-- Tabelle für Mitarbeiter-Einladungen
CREATE TABLE public.staff_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.staff_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invitations"
ON public.staff_invitations FOR ALL
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can view invitation by token for accepting"
ON public.staff_invitations FOR SELECT
USING (true);

-- Tabelle für Teilnehmer (CRM)
CREATE TABLE public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    address TEXT,
    zip_city TEXT,
    date_of_birth DATE,
    status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'registered', 'confirmed', 'completed', 'cancelled', 'dropped')),
    internal_notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID
);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage participants"
ON public.participants FOR ALL
USING (is_staff(auth.uid()));

CREATE TRIGGER update_participants_updated_at
BEFORE UPDATE ON public.participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Tabelle für Teilnehmer-Dokumente
CREATE TABLE public.participant_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    uploaded_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.participant_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage documents"
ON public.participant_documents FOR ALL
USING (is_staff(auth.uid()));

-- Tabelle für Teilnehmer-Historie
CREATE TABLE public.participant_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    details JSONB,
    performed_by UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.participant_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view history"
ON public.participant_history FOR ALL
USING (is_staff(auth.uid()));

-- Tabelle für Zahlungen
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    participant_id UUID REFERENCES public.participants(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'partial', 'refunded', 'cancelled')),
    payment_method TEXT,
    invoice_number TEXT,
    invoice_url TEXT,
    notes TEXT,
    due_date DATE,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage payments"
ON public.payments FOR ALL
USING (is_staff(auth.uid()));

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Audit-Log für DSGVO
CREATE TABLE public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit log"
ON public.audit_log FOR SELECT
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert audit log"
ON public.audit_log FOR INSERT
WITH CHECK (true);

-- Login-Historie
CREATE TABLE public.login_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    login_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ip_address TEXT,
    user_agent TEXT
);

ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view login history"
ON public.login_history FOR SELECT
USING (has_role(auth.uid(), 'super_admin') OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own login history"
ON public.login_history FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert login history"
ON public.login_history FOR INSERT
WITH CHECK (true);

-- Dozenten-Zuordnung zu Kursen
CREATE TABLE public.course_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_date_id UUID NOT NULL REFERENCES public.course_dates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.course_instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage course instructors"
ON public.course_instructors FOR ALL
USING (is_staff(auth.uid()));

CREATE POLICY "Instructors can view their assignments"
ON public.course_instructors FOR SELECT
USING (user_id = auth.uid());

-- Erweitere profiles um mehr Felder
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS position TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Funktion um spezifische Rolle zu prüfen (inkl. super_admin als höchste Rolle)
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND (role = ANY(_roles) OR role = 'super_admin')
    )
$$;

-- Funktion für Instructor: nur eigene Kurse sehen
CREATE OR REPLACE FUNCTION public.is_course_instructor(_user_id uuid, _course_date_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.course_instructors
        WHERE user_id = _user_id
          AND course_date_id = _course_date_id
    )
$$;