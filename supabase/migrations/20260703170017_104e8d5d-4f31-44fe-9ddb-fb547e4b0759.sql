
-- Recreate views with security_invoker so RLS of the querying user applies
ALTER VIEW public.active_invoices SET (security_invoker = true);
ALTER VIEW public.active_quotes SET (security_invoker = true);
ALTER VIEW public.datev_export SET (security_invoker = true);

-- Trigger/internal functions: revoke all execute (triggers still fire; direct RPC not needed)
REVOKE ALL ON FUNCTION public.log_invoice_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.log_quote_changes() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.update_course_participants() FROM PUBLIC, anon, authenticated;

-- Number-generating RPCs: only signed-in staff should call (RPC callable by authenticated; internal staff check happens in app/RLS)
REVOKE ALL ON FUNCTION public.generate_invoice_number() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.generate_quote_number() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.generate_certificate_number() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_quote_number() TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_certificate_number() TO authenticated;

-- Role helper functions: needed by RLS policies for signed-in users; block anon
REVOKE ALL ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.has_any_role(uuid, app_role[]) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_course_instructor(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_any_role(uuid, app_role[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_course_instructor(uuid, uuid) TO authenticated;
