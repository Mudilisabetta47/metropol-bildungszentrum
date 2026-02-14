
-- Drop the existing overly permissive INSERT policy
DROP POLICY IF EXISTS "Public can create registrations with validation" ON public.registrations;

-- Recreate INSERT policy: anonymous users cannot set user_id
CREATE POLICY "Public can create registrations with validation"
ON public.registrations
FOR INSERT
WITH CHECK (
  (first_name IS NOT NULL) AND (TRIM(BOTH FROM first_name) <> '') AND (length(first_name) <= 100)
  AND (last_name IS NOT NULL) AND (TRIM(BOTH FROM last_name) <> '') AND (length(last_name) <= 100)
  AND (email IS NOT NULL) AND (TRIM(BOTH FROM email) <> '') AND (length(email) <= 255)
  AND (course_date_id IS NOT NULL)
  AND ((phone IS NULL) OR (length(phone) <= 50))
  AND ((address IS NULL) OR (length(address) <= 500))
  AND ((zip_city IS NULL) OR (length(zip_city) <= 100))
  AND ((message IS NULL) OR (length(message) <= 2000))
  AND (status = 'pending'::registration_status)
  AND (user_id IS NULL)
);
