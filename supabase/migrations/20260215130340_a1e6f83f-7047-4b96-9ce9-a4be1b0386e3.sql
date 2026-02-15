
-- Remove the overly permissive public SELECT policy that exposes all emails
DROP POLICY IF EXISTS "Public can view invitation by token" ON public.participant_portal_invitations;
