
-- 1. Fix staff_invitations: Replace overly permissive public SELECT with admin-only + token lookup
DROP POLICY IF EXISTS "Public can view invitation by token for accepting" ON public.staff_invitations;

CREATE POLICY "Token lookup for accepting invitations"
ON public.staff_invitations
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
  OR (accepted_at IS NULL AND expires_at > now())
);

-- 2. Fix active_invoices view: Add RLS policy (it's a view on invoices table, enable RLS)
ALTER VIEW public.active_invoices SET (security_invoker = true);

-- 3. Fix datev_export view: Add RLS policy
ALTER VIEW public.datev_export SET (security_invoker = true);
