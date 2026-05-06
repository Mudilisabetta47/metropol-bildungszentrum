
-- Restrict insert on history/audit tables to service_role (used by edge functions and triggers)
DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;
CREATE POLICY "Service role can insert audit log"
ON public.audit_log FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert login history" ON public.login_history;
CREATE POLICY "Service role can insert login history"
ON public.login_history FOR INSERT TO service_role WITH CHECK (true);

DROP POLICY IF EXISTS "System can insert invoice history" ON public.invoice_history;
CREATE POLICY "Service role can insert invoice history"
ON public.invoice_history FOR INSERT TO service_role WITH CHECK (true);

-- Allow participants to view their own uploaded documents
CREATE POLICY "Participants can view their own documents"
ON public.participant_documents FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.participants p
    WHERE p.id = participant_documents.participant_id
      AND p.user_id = auth.uid()
  )
);
