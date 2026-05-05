import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SITE = "https://metropol-bz.de";
const SITEMAP_URL = `${SITE}/sitemap.xml`;

async function sha256(str: string): Promise<string> {
  const buf = new TextEncoder().encode(str);
  const hash = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function checkUrl(url: string) {
  const start = performance.now();
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, {
      method: "GET",
      redirect: "manual",
      headers: { "User-Agent": "MetropolSEOBot/1.0 (+https://metropol-bz.de)" },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    const elapsed = Math.round(performance.now() - start);
    const location = res.headers.get("location");
    let length: number | null = null;
    const cl = res.headers.get("content-length");
    if (cl) length = parseInt(cl, 10);
    else if (res.status >= 200 && res.status < 300) {
      try {
        const txt = await res.text();
        length = txt.length;
      } catch (_) {}
    }
    return {
      status_code: res.status,
      response_time_ms: elapsed,
      content_length: length,
      redirected_to: location,
      error_message: null as string | null,
    };
  } catch (e) {
    return {
      status_code: null,
      response_time_ms: Math.round(performance.now() - start),
      content_length: null,
      redirected_to: null,
      error_message: String((e as Error).message ?? e),
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // Fetch sitemap
    const sitemapRes = await fetch(SITEMAP_URL, {
      headers: { "User-Agent": "MetropolSEOBot/1.0" },
    });
    if (!sitemapRes.ok) {
      return new Response(
        JSON.stringify({ error: `Sitemap fetch failed: ${sitemapRes.status}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    const xml = await sitemapRes.text();
    const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    const hash = await sha256(urls.slice().sort().join("\n"));

    // Snapshot diff
    const { data: lastSnap } = await supabase
      .from("seo_sitemap_snapshots")
      .select("content_hash, urls")
      .order("captured_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!lastSnap || lastSnap.content_hash !== hash) {
      const prev: string[] = (lastSnap?.urls as string[]) ?? [];
      const prevSet = new Set(prev);
      const curSet = new Set(urls);
      const added = urls.filter((u) => !prevSet.has(u));
      const removed = prev.filter((u) => !curSet.has(u));
      await supabase.from("seo_sitemap_snapshots").insert({
        url_count: urls.length,
        content_hash: hash,
        urls,
        added_urls: added,
        removed_urls: removed,
      });
    }

    // Create run
    const { data: run, error: runErr } = await supabase
      .from("seo_crawl_runs")
      .insert({ source: "edge-function", total_urls: urls.length })
      .select()
      .single();
    if (runErr) throw runErr;

    const startAll = performance.now();
    const results = await Promise.all(urls.map(async (url) => {
      const r = await checkUrl(url);
      return { run_id: run.id, url, ...r };
    }));

    const ok = results.filter((r) => r.status_code && r.status_code >= 200 && r.status_code < 300).length;
    const redir = results.filter((r) => r.status_code && r.status_code >= 300 && r.status_code < 400).length;
    const err = results.length - ok - redir;

    // Insert results in chunks
    const chunkSize = 100;
    for (let i = 0; i < results.length; i += chunkSize) {
      const chunk = results.slice(i, i + chunkSize);
      const { error } = await supabase.from("seo_crawl_results").insert(chunk);
      if (error) console.error("insert chunk error", error);
    }

    await supabase
      .from("seo_crawl_runs")
      .update({
        finished_at: new Date().toISOString(),
        duration_ms: Math.round(performance.now() - startAll),
        ok_count: ok,
        error_count: err,
        redirect_count: redir,
      })
      .eq("id", run.id);

    return new Response(
      JSON.stringify({ run_id: run.id, total: urls.length, ok, redirects: redir, errors: err }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as Error).message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
