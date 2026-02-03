-- Create site_settings table for global configuration
CREATE TABLE public.site_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    key text NOT NULL UNIQUE,
    value text,
    label text NOT NULL,
    description text,
    category text NOT NULL DEFAULT 'general',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings
CREATE POLICY "Site settings are publicly readable"
ON public.site_settings
FOR SELECT
USING (true);

-- Staff can manage settings
CREATE POLICY "Staff can manage site settings"
ON public.site_settings
FOR ALL
USING (is_staff(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default contact settings
INSERT INTO public.site_settings (key, value, label, description, category) VALUES
('central_phone', '0511 – 642 50 68', 'Zentrale Telefonnummer', 'Die Haupttelefonnummer des Bildungszentrums', 'contact'),
('central_email', 'info@metropol-bz.de', 'Zentrale E-Mail', 'Die Haupt-E-Mail-Adresse', 'contact'),
('contact_person_name', 'Regina Martin', 'Ansprechpartnerin Name', 'Name der Hauptansprechpartnerin', 'contact'),
('contact_person_phone', '0511 – 642 50 68', 'Ansprechpartnerin Telefon', 'Direktnummer der Ansprechpartnerin', 'contact'),
('contact_person_email', 'r.martin@metropol-bz.de', 'Ansprechpartnerin E-Mail', 'E-Mail der Ansprechpartnerin', 'contact'),
('company_name', 'Metropol Bildungszentrum GmbH', 'Firmenname', 'Offizieller Firmenname', 'company'),
('company_address', 'Podbielskistraße 333', 'Firmenadresse', 'Straße und Hausnummer', 'company'),
('company_zip_city', '30659 Hannover', 'PLZ und Stadt', 'Postleitzahl und Stadt', 'company'),
('company_ceo', 'Naeim Ghorbani', 'Geschäftsführer', 'Name des Geschäftsführers', 'company'),
('company_register', 'Amtsgericht Hannover, HRB 224 668', 'Handelsregister', 'Handelsregistereintrag', 'company'),
('company_vat_id', 'DE358715877', 'USt-IdNr.', 'Umsatzsteuer-ID', 'company');