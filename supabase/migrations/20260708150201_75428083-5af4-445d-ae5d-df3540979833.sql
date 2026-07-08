-- Revoke EXECUTE from anon/authenticated/public for SECURITY DEFINER functions
-- that must not be callable via the Data API (triggers + internal number generators).

REVOKE ALL ON FUNCTION public.log_invoice_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_quote_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_invoice_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_quote_number() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_certificate_number() FROM PUBLIC, anon, authenticated;

-- Service role retains access (used by edge functions and triggers).
GRANT EXECUTE ON FUNCTION public.log_invoice_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.log_quote_changes() TO service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_quote_number() TO service_role;
GRANT EXECUTE ON FUNCTION public.generate_certificate_number() TO service_role;

-- Role-check functions (has_role, has_any_role, is_staff, is_course_instructor) remain
-- executable by authenticated because they are referenced inside RLS policies.
