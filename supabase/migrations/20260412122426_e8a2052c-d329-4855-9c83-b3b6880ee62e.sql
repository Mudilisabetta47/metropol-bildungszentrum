-- Remove the overly permissive token lookup policy
DROP POLICY IF EXISTS "Token lookup for accepting invitations" ON public.staff_invitations;

-- Create a new admin-only SELECT policy
CREATE POLICY "Only admins can view invitations"
ON public.staff_invitations
FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'super_admin'::app_role)
);