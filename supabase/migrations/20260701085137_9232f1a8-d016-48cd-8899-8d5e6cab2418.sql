
-- ============================================
-- Umsatzsteuerbefreiung §4 Nr. 21 UStG
-- ============================================
INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('vat_exemption_active', 'USt-Befreiung aktiv', 'true', 'invoicing', 'Wenn aktiv, wird keine Mehrwertsteuer ausgewiesen (§4 Nr. 21 UStG).')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('vat_exemption_note', 'USt-Befreiungshinweis', 'Umsatzsteuerbefreit gemäß §4 Nr. 21 UStG (Bildungsleistung).', 'invoicing', 'Hinweistext auf Rechnungen und Kostenvoranschlägen.')
ON CONFLICT (key) DO NOTHING;

UPDATE public.site_settings SET value = '0' WHERE key = 'default_vat_rate';

-- ============================================
-- Kostenvoranschlag-Nummernkreis
-- ============================================
INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('quote_number_counter', 'Kostenvoranschlag Zähler', '0', 'invoicing', 'Fortlaufende Nummer für Kostenvoranschläge')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('quote_number_prefix', 'Kostenvoranschlag Präfix', 'KV-', 'invoicing', 'Präfix für Kostenvoranschlag-Nummern')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('quote_validity_days', 'KV Gültigkeitsdauer (Tage)', '30', 'invoicing', 'Standard-Gültigkeit eines Kostenvoranschlags in Tagen')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- Leistungskatalog: Kategorien
-- ============================================
CREATE TABLE public.service_catalog_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_catalog_categories TO authenticated;
GRANT ALL ON public.service_catalog_categories TO service_role;

ALTER TABLE public.service_catalog_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage service catalog categories"
ON public.service_catalog_categories FOR ALL
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER update_service_catalog_categories_updated_at
BEFORE UPDATE ON public.service_catalog_categories
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Leistungskatalog: Positionen
-- ============================================
CREATE TABLE public.service_catalog_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.service_catalog_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    unit TEXT NOT NULL DEFAULT 'Stück',
    unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_service_catalog_items_category ON public.service_catalog_items(category_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_catalog_items TO authenticated;
GRANT ALL ON public.service_catalog_items TO service_role;

ALTER TABLE public.service_catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage service catalog items"
ON public.service_catalog_items FOR ALL
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER update_service_catalog_items_updated_at
BEFORE UPDATE ON public.service_catalog_items
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Kategorien vorbefüllen
INSERT INTO public.service_catalog_categories (name, description, sort_order) VALUES
    ('BKF-Weiterbildung', 'Beschleunigte Grundqualifikation und Module', 10),
    ('Führerscheinausbildung', 'Fahrausbildung aller Klassen', 20),
    ('Prüfungsgebühren', 'TÜV, DEKRA und weitere Prüfungen', 30),
    ('Sonstiges', 'Sonstige Leistungen', 90);

-- ============================================
-- Kostenvoranschläge
-- ============================================
CREATE TABLE public.quotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    quote_number TEXT NOT NULL UNIQUE,

    -- Referenzen (optional)
    participant_id UUID REFERENCES public.participants(id),

    -- Empfänger (Snapshot)
    recipient_name TEXT NOT NULL,
    recipient_address TEXT,
    recipient_zip_city TEXT,
    recipient_email TEXT,

    -- Beträge
    net_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    vat_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    gross_amount NUMERIC(10,2) NOT NULL DEFAULT 0,

    -- Daten
    quote_date DATE NOT NULL DEFAULT CURRENT_DATE,
    valid_until DATE,
    service_date DATE,
    service_period_start DATE,
    service_period_end DATE,

    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','declined','expired','converted','cancelled')),

    -- Umwandlung zu Rechnung
    converted_to_invoice_id UUID REFERENCES public.invoices(id),
    converted_at TIMESTAMP WITH TIME ZONE,

    -- PDF
    pdf_url TEXT,
    pdf_generated_at TIMESTAMP WITH TIME ZONE,

    -- Notizen
    notes TEXT,
    internal_notes TEXT,

    -- Versionierung
    version INTEGER NOT NULL DEFAULT 1,
    is_locked BOOLEAN NOT NULL DEFAULT false,

    -- Soft Delete
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_quotes_number ON public.quotes(quote_number);
CREATE INDEX idx_quotes_status ON public.quotes(status) WHERE is_deleted = false;
CREATE INDEX idx_quotes_participant ON public.quotes(participant_id);
CREATE INDEX idx_quotes_date ON public.quotes(quote_date);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quotes TO authenticated;
GRANT ALL ON public.quotes TO service_role;

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage quotes"
ON public.quotes FOR ALL
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

CREATE TRIGGER update_quotes_updated_at
BEFORE UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- Positionen des Kostenvoranschlags
-- ============================================
CREATE TABLE public.quote_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,

    position INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Stück',
    unit_price NUMERIC(10,2) NOT NULL,

    net_amount NUMERIC(10,2) NOT NULL,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
    vat_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    gross_amount NUMERIC(10,2) NOT NULL,

    catalog_item_id UUID REFERENCES public.service_catalog_items(id),
    course_id UUID REFERENCES public.courses(id),

    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_items_quote ON public.quote_items(quote_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.quote_items TO authenticated;
GRANT ALL ON public.quote_items TO service_role;

ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage quote items"
ON public.quote_items FOR ALL
USING (is_staff(auth.uid()))
WITH CHECK (is_staff(auth.uid()));

-- ============================================
-- Historie
-- ============================================
CREATE TABLE public.quote_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quote_id UUID NOT NULL REFERENCES public.quotes(id),
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    change_reason TEXT,
    performed_by UUID,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_quote_history_quote ON public.quote_history(quote_id);

GRANT SELECT ON public.quote_history TO authenticated;
GRANT ALL ON public.quote_history TO service_role;

ALTER TABLE public.quote_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view quote history"
ON public.quote_history FOR SELECT
USING (is_staff(auth.uid()));

-- ============================================
-- Nummerngenerator
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_quote_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_counter INTEGER;
    prefix TEXT;
    new_number TEXT;
    current_year TEXT;
BEGIN
    current_year := to_char(CURRENT_DATE, 'YYYY');

    SELECT value INTO prefix FROM public.site_settings WHERE key = 'quote_number_prefix';
    IF prefix IS NULL THEN prefix := 'KV-'; END IF;

    UPDATE public.site_settings
    SET value = (COALESCE(value::integer, 0) + 1)::text,
        updated_at = now()
    WHERE key = 'quote_number_counter'
    RETURNING value::integer INTO current_counter;

    new_number := prefix || current_year || '-' || lpad(current_counter::text, 5, '0');
    RETURN new_number;
END;
$$;

-- ============================================
-- History-Trigger
-- ============================================
CREATE OR REPLACE FUNCTION public.log_quote_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.quote_history (quote_id, action, new_data, performed_by)
        VALUES (NEW.id, 'created', to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        IF OLD.is_locked = false THEN
            NEW.version := OLD.version + 1;
            NEW.updated_at := now();
        END IF;

        INSERT INTO public.quote_history (quote_id, action, old_data, new_data, performed_by)
        VALUES (
            NEW.id,
            CASE
                WHEN OLD.status != NEW.status THEN 'status_changed'
                WHEN NEW.converted_to_invoice_id IS NOT NULL AND OLD.converted_to_invoice_id IS NULL THEN 'converted'
                WHEN NEW.pdf_url IS NOT NULL AND OLD.pdf_url IS NULL THEN 'pdf_generated'
                ELSE 'updated'
            END,
            to_jsonb(OLD),
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER quote_audit_trigger
AFTER INSERT OR UPDATE ON public.quotes
FOR EACH ROW EXECUTE FUNCTION public.log_quote_changes();

-- ============================================
-- Active Quotes View
-- ============================================
CREATE OR REPLACE VIEW public.active_quotes AS
SELECT * FROM public.quotes WHERE is_deleted = false;
