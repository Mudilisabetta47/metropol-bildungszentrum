
-- =====================================================
-- PHASE 1: GoBD-KONFORME RECHNUNGSVERWALTUNG
-- =====================================================

-- 1. Rechnungsnummer-Sequenz in site_settings
INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('invoice_number_counter', 'Rechnungsnummer Zähler', '0', 'invoicing', 'Fortlaufende Rechnungsnummer')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('invoice_number_prefix', 'Rechnungsnummer Präfix', 'RE-', 'invoicing', 'Präfix für Rechnungsnummern (z.B. RE-2024-)')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('company_name', 'Firmenname', 'Metropol Bildungszentrum GmbH', 'company', 'Firmenname für Rechnungen')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('company_address', 'Firmenadresse', '', 'company', 'Vollständige Firmenadresse')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('company_tax_id', 'Steuernummer', '', 'company', 'Steuernummer für Rechnungen')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('company_vat_id', 'USt-IdNr.', '', 'company', 'Umsatzsteuer-ID für Rechnungen')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('company_bank_name', 'Bank', '', 'company', 'Bankname')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('company_iban', 'IBAN', '', 'company', 'IBAN für Überweisungen')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('company_bic', 'BIC', '', 'company', 'BIC/SWIFT Code')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('default_vat_rate', 'Standard MwSt.-Satz', '19', 'invoicing', 'Standard Mehrwertsteuersatz in %')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.site_settings (key, label, value, category, description)
VALUES ('invoice_payment_terms', 'Zahlungsziel (Tage)', '14', 'invoicing', 'Standard Zahlungsziel in Tagen')
ON CONFLICT (key) DO NOTHING;

-- 2. Invoices Tabelle (GoBD-konform)
CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Rechnungsnummer (fortlaufend, unveränderlich nach Erstellung)
    invoice_number TEXT NOT NULL UNIQUE,
    
    -- Referenzen
    registration_id UUID REFERENCES public.registrations(id),
    participant_id UUID REFERENCES public.participants(id),
    
    -- Rechnungsempfänger (Snapshot zum Zeitpunkt der Erstellung - GoBD)
    recipient_name TEXT NOT NULL,
    recipient_address TEXT,
    recipient_zip_city TEXT,
    recipient_email TEXT,
    
    -- Beträge
    net_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 19,
    vat_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    gross_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    
    -- Daten
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    service_date DATE,
    service_period_start DATE,
    service_period_end DATE,
    due_date DATE,
    
    -- Status (GoBD: storniert statt gelöscht)
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'partial', 'overdue', 'cancelled', 'refunded')),
    paid_at TIMESTAMP WITH TIME ZONE,
    paid_amount NUMERIC(10,2) DEFAULT 0,
    payment_method TEXT,
    payment_reference TEXT,
    
    -- Storno-Referenz (bei Storno-Rechnungen)
    cancelled_invoice_id UUID REFERENCES public.invoices(id),
    cancellation_reason TEXT,
    cancelled_at TIMESTAMP WITH TIME ZONE,
    cancelled_by UUID,
    
    -- PDF Storage
    pdf_url TEXT,
    pdf_generated_at TIMESTAMP WITH TIME ZONE,
    
    -- Notizen
    notes TEXT,
    internal_notes TEXT,
    
    -- Versionierung (GoBD)
    version INTEGER NOT NULL DEFAULT 1,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    locked_at TIMESTAMP WITH TIME ZONE,
    locked_by UUID,
    
    -- Soft Delete (GoBD: nie wirklich löschen)
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    deleted_at TIMESTAMP WITH TIME ZONE,
    deleted_by UUID,
    
    -- Audit
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Archivierung
    archived_until DATE GENERATED ALWAYS AS (invoice_date + INTERVAL '10 years') STORED
);

-- Index für schnelle Suche
CREATE INDEX idx_invoices_number ON public.invoices(invoice_number);
CREATE INDEX idx_invoices_status ON public.invoices(status) WHERE is_deleted = false;
CREATE INDEX idx_invoices_participant ON public.invoices(participant_id);
CREATE INDEX idx_invoices_date ON public.invoices(invoice_date);

-- 3. Rechnungspositionen
CREATE TABLE public.invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
    
    position INTEGER NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
    unit TEXT DEFAULT 'Stück',
    unit_price NUMERIC(10,2) NOT NULL,
    
    -- Beträge pro Position
    net_amount NUMERIC(10,2) NOT NULL,
    vat_rate NUMERIC(5,2) NOT NULL DEFAULT 19,
    vat_amount NUMERIC(10,2) NOT NULL,
    gross_amount NUMERIC(10,2) NOT NULL,
    
    -- Referenz zum Kurs
    course_id UUID REFERENCES public.courses(id),
    course_date_id UUID REFERENCES public.course_dates(id),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_invoice_items_invoice ON public.invoice_items(invoice_id);

-- 4. Rechnungshistorie (GoBD-Änderungsprotokoll)
CREATE TABLE public.invoice_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES public.invoices(id),
    
    action TEXT NOT NULL, -- 'created', 'updated', 'status_changed', 'sent', 'paid', 'cancelled', 'pdf_generated'
    
    -- Snapshot der alten/neuen Werte
    old_data JSONB,
    new_data JSONB,
    
    -- Änderungsgrund (für GoBD wichtig)
    change_reason TEXT,
    
    -- Audit
    performed_by UUID,
    performed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT
);

CREATE INDEX idx_invoice_history_invoice ON public.invoice_history(invoice_id);
CREATE INDEX idx_invoice_history_date ON public.invoice_history(performed_at);

-- 5. Soft-Delete zu bestehenden Tabellen hinzufügen
ALTER TABLE public.payments 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

ALTER TABLE public.participants 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID;

-- 6. RLS Policies für Invoices

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_history ENABLE ROW LEVEL SECURITY;

-- Staff kann alles sehen und bearbeiten
CREATE POLICY "Staff can manage invoices"
ON public.invoices FOR ALL
USING (is_staff(auth.uid()));

CREATE POLICY "Staff can manage invoice items"
ON public.invoice_items FOR ALL
USING (is_staff(auth.uid()));

CREATE POLICY "Staff can view invoice history"
ON public.invoice_history FOR SELECT
USING (is_staff(auth.uid()));

-- Nur System kann History einfügen (via Trigger)
CREATE POLICY "System can insert invoice history"
ON public.invoice_history FOR INSERT
WITH CHECK (true);

-- 7. Trigger für automatische Versionierung
CREATE OR REPLACE FUNCTION public.log_invoice_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Bei INSERT
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.invoice_history (invoice_id, action, new_data, performed_by)
        VALUES (NEW.id, 'created', to_jsonb(NEW), NEW.created_by);
        RETURN NEW;
    END IF;
    
    -- Bei UPDATE
    IF TG_OP = 'UPDATE' THEN
        -- Version erhöhen wenn Daten geändert wurden
        IF OLD.is_locked = false THEN
            NEW.version := OLD.version + 1;
            NEW.updated_at := now();
        END IF;
        
        -- Änderungen protokollieren
        INSERT INTO public.invoice_history (invoice_id, action, old_data, new_data, performed_by)
        VALUES (
            NEW.id,
            CASE 
                WHEN OLD.status != NEW.status THEN 'status_changed'
                WHEN NEW.cancelled_at IS NOT NULL AND OLD.cancelled_at IS NULL THEN 'cancelled'
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

CREATE TRIGGER invoice_audit_trigger
AFTER INSERT OR UPDATE ON public.invoices
FOR EACH ROW EXECUTE FUNCTION public.log_invoice_changes();

-- 8. Funktion für fortlaufende Rechnungsnummer
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
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
    
    -- Präfix holen
    SELECT value INTO prefix FROM public.site_settings WHERE key = 'invoice_number_prefix';
    IF prefix IS NULL THEN prefix := 'RE-'; END IF;
    
    -- Counter holen und erhöhen (atomisch mit Row Lock)
    UPDATE public.site_settings 
    SET value = (COALESCE(value::integer, 0) + 1)::text,
        updated_at = now()
    WHERE key = 'invoice_number_counter'
    RETURNING value::integer INTO current_counter;
    
    -- Rechnungsnummer generieren: RE-2024-00001
    new_number := prefix || current_year || '-' || lpad(current_counter::text, 5, '0');
    
    RETURN new_number;
END;
$$;

-- 9. Updated_at Trigger
CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 10. View für aktive Rechnungen (ohne gelöschte)
CREATE OR REPLACE VIEW public.active_invoices AS
SELECT * FROM public.invoices WHERE is_deleted = false;

-- 11. DATEV Export View (für Steuerberater)
CREATE OR REPLACE VIEW public.datev_export AS
SELECT 
    i.invoice_number AS "Belegnummer",
    i.invoice_date AS "Belegdatum",
    i.recipient_name AS "Buchungstext",
    i.net_amount AS "Umsatz (netto)",
    i.vat_amount AS "USt-Betrag",
    i.gross_amount AS "Umsatz (brutto)",
    i.vat_rate AS "USt-Satz",
    CASE i.status
        WHEN 'paid' THEN 'bezahlt'
        WHEN 'cancelled' THEN 'storniert'
        ELSE 'offen'
    END AS "Status",
    i.paid_at AS "Zahldatum",
    '8400' AS "Erlöskonto", -- Standard Erlöskonto
    '1200' AS "Gegenkonto"  -- Standard Debitorenkonto
FROM public.invoices i
WHERE i.is_deleted = false
ORDER BY i.invoice_date, i.invoice_number;
