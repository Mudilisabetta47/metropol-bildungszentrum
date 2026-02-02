-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'employee', 'user');

-- Create enum for course categories
CREATE TYPE public.course_category AS ENUM ('lkw', 'bus', 'fahrlehrer', 'bkf', 'sprache', 'sonstige');

-- Create enum for registration status
CREATE TYPE public.registration_status AS ENUM ('pending', 'confirmed', 'cancelled', 'waitlist', 'completed');

-- Create locations table
CREATE TABLE public.locations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL,
    zip_city TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    opening_hours TEXT,
    map_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses table
CREATE TABLE public.courses (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    category public.course_category NOT NULL,
    duration_info TEXT,
    price DECIMAL(10,2),
    price_info TEXT,
    requirements TEXT,
    benefits TEXT[],
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_dates table (scheduled course instances)
CREATE TABLE public.course_dates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    max_participants INTEGER NOT NULL DEFAULT 20,
    current_participants INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create registrations table
CREATE TABLE public.registrations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    course_date_id UUID NOT NULL REFERENCES public.course_dates(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    zip_city TEXT,
    date_of_birth DATE,
    message TEXT,
    status public.registration_status NOT NULL DEFAULT 'pending',
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role public.app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create lead_sources table for tracking
CREATE TABLE public.lead_sources (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    registration_id UUID NOT NULL REFERENCES public.registrations(id) ON DELETE CASCADE,
    referrer TEXT,
    landing_page TEXT,
    user_agent TEXT,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create contact_requests table for general inquiries
CREATE TABLE public.contact_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT,
    message TEXT NOT NULL,
    course_interest TEXT,
    location_preference TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_archived BOOLEAN NOT NULL DEFAULT false,
    source TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_dates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    )
$$;

-- Create function to check if user is admin or employee
CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role IN ('admin', 'employee')
    )
$$;

-- Public read policies for locations and courses (visible to everyone)
CREATE POLICY "Locations are publicly readable" ON public.locations
FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage locations" ON public.locations
FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Courses are publicly readable" ON public.courses
FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage courses" ON public.courses
FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

CREATE POLICY "Active course dates are publicly readable" ON public.course_dates
FOR SELECT USING (is_active = true);

CREATE POLICY "Staff can manage course dates" ON public.course_dates
FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- Registration policies
CREATE POLICY "Anyone can create registrations" ON public.registrations
FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own registrations" ON public.registrations
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Staff can manage all registrations" ON public.registrations
FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- Profile policies
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON public.profiles
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- User roles policies (only admins can manage)
CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Lead sources policies
CREATE POLICY "Anyone can insert lead sources" ON public.lead_sources
FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can view lead sources" ON public.lead_sources
FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));

-- Contact requests policies
CREATE POLICY "Anyone can create contact requests" ON public.contact_requests
FOR INSERT WITH CHECK (true);

CREATE POLICY "Staff can manage contact requests" ON public.contact_requests
FOR ALL TO authenticated USING (public.is_staff(auth.uid()));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Apply updated_at triggers
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_dates_updated_at BEFORE UPDATE ON public.course_dates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON public.registrations
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto-creating profiles
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better query performance
CREATE INDEX idx_course_dates_course_id ON public.course_dates(course_id);
CREATE INDEX idx_course_dates_location_id ON public.course_dates(location_id);
CREATE INDEX idx_course_dates_start_date ON public.course_dates(start_date);
CREATE INDEX idx_registrations_course_date_id ON public.registrations(course_date_id);
CREATE INDEX idx_registrations_email ON public.registrations(email);
CREATE INDEX idx_registrations_status ON public.registrations(status);
CREATE INDEX idx_registrations_created_at ON public.registrations(created_at);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_contact_requests_created_at ON public.contact_requests(created_at);

-- Insert initial locations data
INSERT INTO public.locations (name, slug, address, zip_city, phone, email, opening_hours, map_url) VALUES
('Hannover', 'hannover', 'Beispielstraße 123', '30159 Hannover', '0511 123 456', 'hannover@metropol-bildung.de', 'Mo-Fr: 8:00 - 18:00 Uhr', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d155422.35684374573!2d9.625855874999999!3d52.3758916!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b00b514d494f85%3A0x425ac6d94ac4720!2sHannover!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde'),
('Bremen', 'bremen', 'Musterweg 45', '28195 Bremen', '0421 789 012', 'bremen@metropol-bildung.de', 'Mo-Fr: 8:00 - 17:00 Uhr', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d152519.31548391066!2d8.68125355!3d53.10896015!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b1281e22502089%3A0x4240fe7314f89f0!2sBremen!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde'),
('Garbsen', 'garbsen', 'Fahrweg 78', '30823 Garbsen', '05131 345 678', 'garbsen@metropol-bildung.de', 'Mo-Fr: 8:00 - 17:00 Uhr', 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d38891.32614375611!2d9.559087149999999!3d52.43!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b0715d1c28e55d%3A0x422435029b0e6e0!2sGarbsen!5e0!3m2!1sde!2sde!4v1704900000000!5m2!1sde!2sde');

-- Insert initial courses data
INSERT INTO public.courses (title, slug, description, category, duration_info, price_info, requirements, benefits) VALUES
('Führerschein C/CE', 'c-ce', 'LKW-Führerschein für schwere Lastkraftwagen und Anhänger. Ideale Ausbildung für den Einstieg in die Transportbranche.', 'lkw', '2-4 Wochen intensiv', 'Auf Anfrage / Förderfähig', 'Führerschein Klasse B, Mindestalter 18 Jahre', ARRAY['AZAV-zertifiziert', '100% Förderung möglich', 'Moderne Fahrzeuge', 'Erfahrene Ausbilder']),
('Führerschein D/DE', 'd-de', 'Bus-Führerschein für den Personenverkehr. Ihre Karriere als Busfahrer beginnt hier.', 'bus', '3-6 Wochen', 'Auf Anfrage / Förderfähig', 'Führerschein Klasse B, Mindestalter 21 Jahre', ARRAY['AZAV-zertifiziert', '100% Förderung möglich', 'Praxisnahe Ausbildung', 'Jobgarantie bei Partnern']),
('Fahrlehrer-Ausbildung', 'fahrlehrer', 'Werden Sie Fahrlehrer und gestalten Sie die Zukunft der Mobilität mit.', 'fahrlehrer', '12 Monate', 'Auf Anfrage', 'Führerschein Klasse B seit 3 Jahren, pädagogische Eignung', ARRAY['Staatlich anerkannt', 'Hohe Berufsaussichten', 'Flexible Arbeitszeiten', 'Abwechslungsreicher Job']),
('BKF-Weiterbildung Module 1-5', 'bkf-weiterbildung', 'Gesetzlich vorgeschriebene Weiterbildung für Berufskraftfahrer.', 'bkf', '5 x 7 Stunden', 'Ab 95€ pro Modul', 'Führerschein Klasse C/CE oder D/DE', ARRAY['Alle 5 Module', 'Flexible Termine', 'Zertifizierte Trainer', 'An allen Standorten']),
('Sprachkurse für Berufskraftfahrer', 'sprachkurse', 'Deutschkurse speziell für Berufskraftfahrer mit Fachvokabular.', 'sprache', '4-12 Wochen', 'Auf Anfrage / Förderfähig', 'Keine Vorkenntnisse erforderlich', ARRAY['Fachspezifisches Deutsch', 'Kleine Gruppen', 'Prüfungsvorbereitung', 'Flexible Zeiten']);
