CREATE TABLE public.seo_crawl_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ,
  duration_ms INTEGER,
  total_urls INTEGER NOT NULL DEFAULT 0,
  ok_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  redirect_count INTEGER NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'manual',
  notes TEXT
);

ALTER TABLE public.seo_crawl_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage seo_crawl_runs"
ON public.seo_crawl_runs FOR ALL
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.seo_crawl_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.seo_crawl_runs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  status_code INTEGER,
  response_time_ms INTEGER,
  error_message TEXT,
  content_length INTEGER,
  redirected_to TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_seo_crawl_results_run_id ON public.seo_crawl_results(run_id);
CREATE INDEX idx_seo_crawl_results_checked_at ON public.seo_crawl_results(checked_at DESC);
CREATE INDEX idx_seo_crawl_results_url ON public.seo_crawl_results(url);
CREATE INDEX idx_seo_crawl_results_status ON public.seo_crawl_results(status_code);

ALTER TABLE public.seo_crawl_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage seo_crawl_results"
ON public.seo_crawl_results FOR ALL
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE TABLE public.seo_sitemap_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  url_count INTEGER NOT NULL DEFAULT 0,
  content_hash TEXT NOT NULL,
  urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  added_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
  removed_urls JSONB NOT NULL DEFAULT '[]'::jsonb
);

CREATE INDEX idx_seo_sitemap_snapshots_captured_at ON public.seo_sitemap_snapshots(captured_at DESC);

ALTER TABLE public.seo_sitemap_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage seo_sitemap_snapshots"
ON public.seo_sitemap_snapshots FOR ALL
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));