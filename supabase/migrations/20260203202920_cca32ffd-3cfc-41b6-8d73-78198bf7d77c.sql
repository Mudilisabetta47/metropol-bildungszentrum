
-- Fix Security Definer Views - set to SECURITY INVOKER
DROP VIEW IF EXISTS public.active_invoices;
DROP VIEW IF EXISTS public.datev_export;

-- Recreate with SECURITY INVOKER (default, but explicit)
CREATE VIEW public.active_invoices 
WITH (security_invoker = true)
AS SELECT * FROM public.invoices WHERE is_deleted = false;

CREATE VIEW public.datev_export 
WITH (security_invoker = true)
AS SELECT 
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
    '8400' AS "Erlöskonto",
    '1200' AS "Gegenkonto"
FROM public.invoices i
WHERE i.is_deleted = false
ORDER BY i.invoice_date, i.invoice_number;
