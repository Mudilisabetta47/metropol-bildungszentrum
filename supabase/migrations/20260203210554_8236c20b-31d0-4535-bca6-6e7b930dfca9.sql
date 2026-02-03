-- Tabelle für Teilnehmer-Portal-Einladungen
CREATE TABLE public.participant_portal_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Verknüpfung Teilnehmer zu Auth-User
ALTER TABLE public.participants ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
CREATE INDEX IF NOT EXISTS idx_participants_user_id ON public.participants(user_id);

-- Tabelle für Zertifikate
CREATE TABLE public.certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL,
    course_date_id UUID REFERENCES public.course_dates(id) ON DELETE SET NULL,
    certificate_number TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    valid_until DATE,
    pdf_url TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'issued', 'revoked')),
    notes TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Zertifikat-Nummern-Generator in site_settings
INSERT INTO public.site_settings (key, label, value, category, description)
VALUES 
    ('certificate_number_prefix', 'Zertifikatsnummer Präfix', 'CERT-', 'certificates', 'Präfix für Zertifikatsnummern'),
    ('certificate_number_counter', 'Zertifikatsnummer Zähler', '1', 'certificates', 'Aktueller Zähler für Zertifikatsnummern')
ON CONFLICT (key) DO NOTHING;

-- Funktion zum Generieren von Zertifikatsnummern
CREATE OR REPLACE FUNCTION public.generate_certificate_number()
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
    
    SELECT value INTO prefix FROM public.site_settings WHERE key = 'certificate_number_prefix';
    IF prefix IS NULL THEN prefix := 'CERT-'; END IF;
    
    UPDATE public.site_settings 
    SET value = (COALESCE(value::integer, 0) + 1)::text,
        updated_at = now()
    WHERE key = 'certificate_number_counter'
    RETURNING value::integer INTO current_counter;
    
    new_number := prefix || current_year || '-' || lpad(current_counter::text, 5, '0');
    
    RETURN new_number;
END;
$$;

-- RLS für participant_portal_invitations
ALTER TABLE public.participant_portal_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage portal invitations"
ON public.participant_portal_invitations FOR ALL
USING (is_staff(auth.uid()));

CREATE POLICY "Public can view invitation by token"
ON public.participant_portal_invitations FOR SELECT
USING (true);

-- RLS für certificates
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage certificates"
ON public.certificates FOR ALL
USING (is_staff(auth.uid()));

CREATE POLICY "Participants can view their own certificates"
ON public.certificates FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.participants p
        WHERE p.id = certificates.participant_id
        AND p.user_id = auth.uid()
    )
);

-- Teilnehmer können ihre eigenen Daten sehen
CREATE POLICY "Participants can view their own data"
ON public.participants FOR SELECT
USING (user_id = auth.uid() OR is_staff(auth.uid()));

-- Teilnehmer können ihr Profil aktualisieren (nur bestimmte Felder)
CREATE POLICY "Participants can update their own profile"
ON public.participants FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Teilnehmer können ihre eigenen Registrierungen sehen
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
CREATE POLICY "Participants can view their own registrations"
ON public.registrations FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.participants p
        WHERE p.email = registrations.email
        AND p.user_id = auth.uid()
    )
    OR is_staff(auth.uid())
);

-- Teilnehmer können ihre eigenen Rechnungen sehen
CREATE POLICY "Participants can view their own invoices"
ON public.invoices FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.participants p
        WHERE p.id = invoices.participant_id
        AND p.user_id = auth.uid()
    )
    OR is_staff(auth.uid())
);

-- Trigger für updated_at
CREATE TRIGGER update_certificates_updated_at
    BEFORE UPDATE ON public.certificates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();