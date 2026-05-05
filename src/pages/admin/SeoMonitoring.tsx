import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, AlertTriangle, CheckCircle2, ArrowRight, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface CrawlRun {
  id: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  total_urls: number;
  ok_count: number;
  error_count: number;
  redirect_count: number;
  source: string;
}

interface CrawlResult {
  id: string;
  run_id: string;
  url: string;
  status_code: number | null;
  response_time_ms: number | null;
  error_message: string | null;
  redirected_to: string | null;
  checked_at: string;
}

interface SitemapSnapshot {
  id: string;
  captured_at: string;
  url_count: number;
  content_hash: string;
  added_urls: string[];
  removed_urls: string[];
}

function statusBadge(code: number | null) {
  if (code === null) return <Badge variant="destructive">Fehler</Badge>;
  if (code >= 200 && code < 300) return <Badge className="bg-green-600 hover:bg-green-600">{code}</Badge>;
  if (code >= 300 && code < 400) return <Badge className="bg-amber-500 hover:bg-amber-500">{code}</Badge>;
  return <Badge variant="destructive">{code}</Badge>;
}

export default function SeoMonitoring() {
  const qc = useQueryClient();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  const runsQ = useQuery({
    queryKey: ["seo-runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_crawl_runs")
        .select("*")
        .order("started_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as CrawlRun[];
    },
  });

  const activeRunId = selectedRunId ?? runsQ.data?.[0]?.id ?? null;

  const resultsQ = useQuery({
    queryKey: ["seo-results", activeRunId],
    enabled: !!activeRunId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_crawl_results")
        .select("*")
        .eq("run_id", activeRunId!)
        .order("status_code", { ascending: false, nullsFirst: true })
        .limit(500);
      if (error) throw error;
      return data as CrawlResult[];
    },
  });

  const snapsQ = useQuery({
    queryKey: ["seo-snapshots"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("seo_sitemap_snapshots")
        .select("id, captured_at, url_count, content_hash, added_urls, removed_urls")
        .order("captured_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as SitemapSnapshot[];
    },
  });

  const runCrawl = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("seo-crawl", { body: {} });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Crawl abgeschlossen: ${data.ok} OK, ${data.redirects} Redirects, ${data.errors} Fehler`);
      qc.invalidateQueries({ queryKey: ["seo-runs"] });
      qc.invalidateQueries({ queryKey: ["seo-snapshots"] });
    },
    onError: (e: Error) => toast.error(`Crawl fehlgeschlagen: ${e.message}`),
  });

  const latest = runsQ.data?.[0];
  const errorResults = useMemo(
    () => (resultsQ.data ?? []).filter((r) => !r.status_code || r.status_code >= 400),
    [resultsQ.data],
  );

  const chartData = useMemo(() => {
    return [...(runsQ.data ?? [])].reverse().map((r) => ({
      date: format(new Date(r.started_at), "dd.MM HH:mm"),
      OK: r.ok_count,
      Redirects: r.redirect_count,
      Fehler: r.error_count,
    }));
  }, [runsQ.data]);

  const statusDistribution = useMemo(() => {
    const buckets: Record<string, number> = { "2xx": 0, "3xx": 0, "4xx": 0, "5xx": 0, Fehler: 0 };
    (resultsQ.data ?? []).forEach((r) => {
      if (r.status_code === null) buckets["Fehler"]++;
      else if (r.status_code < 300) buckets["2xx"]++;
      else if (r.status_code < 400) buckets["3xx"]++;
      else if (r.status_code < 500) buckets["4xx"]++;
      else buckets["5xx"]++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [resultsQ.data]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SEO Monitoring</h1>
          <p className="text-sm text-muted-foreground">
            Crawl-Fehler, HTTP-Statuscodes und Sitemap-Änderungen für metropol-bz.de
          </p>
        </div>
        <Button onClick={() => runCrawl.mutate()} disabled={runCrawl.isPending}>
          {runCrawl.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          Crawl jetzt starten
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">URLs gesamt</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold">{latest?.total_urls ?? "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">OK (2xx)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{latest?.ok_count ?? "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Redirects (3xx)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-amber-500">{latest?.redirect_count ?? "—"}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fehler (4xx/5xx)</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-destructive">{latest?.error_count ?? "—"}</div></CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="errors">Fehler ({errorResults.length})</TabsTrigger>
          <TabsTrigger value="results">Alle URLs</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap-Änderungen</TabsTrigger>
          <TabsTrigger value="runs">Crawl-Historie</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Crawls über Zeit</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="OK" stroke="#16a34a" strokeWidth={2} />
                  <Line type="monotone" dataKey="Redirects" stroke="#f59e0b" strokeWidth={2} />
                  <Line type="monotone" dataKey="Fehler" stroke="#dc2626" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Status-Verteilung (letzter Crawl)</CardTitle></CardHeader>
            <CardContent className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-destructive" /> Fehlerhafte URLs</CardTitle></CardHeader>
            <CardContent>
              {resultsQ.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : errorResults.length === 0 ? (
                <div className="flex items-center gap-2 text-green-600"><CheckCircle2 className="h-5 w-5" /> Keine Fehler im letzten Crawl 🎉</div>
              ) : (
                <Table>
                  <TableHeader><TableRow><TableHead>Status</TableHead><TableHead>URL</TableHead><TableHead>Fehler</TableHead><TableHead>Zeit</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {errorResults.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{statusBadge(r.status_code)}</TableCell>
                        <TableCell className="font-mono text-xs break-all">{r.url}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{r.error_message ?? "—"}</TableCell>
                        <TableCell className="text-xs">{r.response_time_ms} ms</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <Card>
            <CardHeader><CardTitle>Alle URLs (letzter Crawl)</CardTitle></CardHeader>
            <CardContent>
              {resultsQ.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                <Table>
                  <TableHeader><TableRow><TableHead>Status</TableHead><TableHead>URL</TableHead><TableHead>Antwortzeit</TableHead><TableHead>Größe</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {(resultsQ.data ?? []).map((r) => (
                      <TableRow key={r.id}>
                        <TableCell>{statusBadge(r.status_code)}</TableCell>
                        <TableCell className="font-mono text-xs break-all">{r.url}{r.redirected_to && (<><ArrowRight className="inline h-3 w-3 mx-1" />{r.redirected_to}</>)}</TableCell>
                        <TableCell className="text-xs">{r.response_time_ms} ms</TableCell>
                        <TableCell className="text-xs">{r.content_length ? `${(r.content_length/1024).toFixed(1)} KB` : "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card>
            <CardHeader><CardTitle>Sitemap-Änderungen</CardTitle></CardHeader>
            <CardContent>
              {snapsQ.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (snapsQ.data ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Noch keine Snapshots. Starte einen Crawl, um die Sitemap zu erfassen.</p>
              ) : (
                <div className="space-y-4">
                  {(snapsQ.data ?? []).map((s) => (
                    <div key={s.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm font-medium">{format(new Date(s.captured_at), "dd. MMM yyyy, HH:mm", { locale: de })}</div>
                        <Badge variant="outline">{s.url_count} URLs</Badge>
                      </div>
                      {s.added_urls.length === 0 && s.removed_urls.length === 0 ? (
                        <p className="text-xs text-muted-foreground">Erster Snapshot – keine Vergleichsbasis.</p>
                      ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-xs font-semibold text-green-600 mb-1 flex items-center gap-1"><Plus className="h-3 w-3" /> Hinzugefügt ({s.added_urls.length})</div>
                            <ul className="text-xs space-y-0.5 font-mono">{s.added_urls.slice(0, 20).map((u) => <li key={u}>{u}</li>)}</ul>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-destructive mb-1 flex items-center gap-1"><Minus className="h-3 w-3" /> Entfernt ({s.removed_urls.length})</div>
                            <ul className="text-xs space-y-0.5 font-mono">{s.removed_urls.slice(0, 20).map((u) => <li key={u}>{u}</li>)}</ul>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="runs">
          <Card>
            <CardHeader><CardTitle>Crawl-Historie</CardTitle></CardHeader>
            <CardContent>
              <Table>
                <TableHeader><TableRow><TableHead>Zeitpunkt</TableHead><TableHead>URLs</TableHead><TableHead>OK</TableHead><TableHead>3xx</TableHead><TableHead>Fehler</TableHead><TableHead>Dauer</TableHead><TableHead></TableHead></TableRow></TableHeader>
                <TableBody>
                  {(runsQ.data ?? []).map((r) => (
                    <TableRow key={r.id} className={activeRunId === r.id ? "bg-muted/50" : ""}>
                      <TableCell className="text-xs">{format(new Date(r.started_at), "dd.MM.yyyy HH:mm", { locale: de })}</TableCell>
                      <TableCell>{r.total_urls}</TableCell>
                      <TableCell className="text-green-600">{r.ok_count}</TableCell>
                      <TableCell className="text-amber-500">{r.redirect_count}</TableCell>
                      <TableCell className="text-destructive">{r.error_count}</TableCell>
                      <TableCell className="text-xs">{r.duration_ms ? `${(r.duration_ms/1000).toFixed(1)}s` : "—"}</TableCell>
                      <TableCell><Button size="sm" variant="ghost" onClick={() => setSelectedRunId(r.id)}>Details</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
