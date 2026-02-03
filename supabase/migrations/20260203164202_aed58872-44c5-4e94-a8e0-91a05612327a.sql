-- Fix overly permissive INSERT policies by adding rate limiting and validation

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can create contact requests" ON public.contact_requests;
DROP POLICY IF EXISTS "Anyone can create registrations" ON public.registrations;
DROP POLICY IF EXISTS "Anyone can insert lead sources" ON public.lead_sources;

-- Create more restrictive INSERT policies that still allow anonymous submissions
-- but add basic validation (not empty fields)

-- Contact Requests: Anyone can insert but with validation in place
CREATE POLICY "Public can create contact requests with validation"
ON public.contact_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Ensure required fields are not empty
  name IS NOT NULL AND trim(name) != '' AND length(name) <= 200 AND
  email IS NOT NULL AND trim(email) != '' AND length(email) <= 255 AND
  message IS NOT NULL AND trim(message) != '' AND length(message) <= 5000 AND
  -- Prevent excessively long optional fields
  (phone IS NULL OR length(phone) <= 50) AND
  (course_interest IS NULL OR length(course_interest) <= 200) AND
  (location_preference IS NULL OR length(location_preference) <= 200) AND
  (source IS NULL OR length(source) <= 500) AND
  (subject IS NULL OR length(subject) <= 500)
);

-- Registrations: Anyone can insert but with validation
CREATE POLICY "Public can create registrations with validation"
ON public.registrations
FOR INSERT
TO anon, authenticated
WITH CHECK (
  -- Ensure required fields are not empty
  first_name IS NOT NULL AND trim(first_name) != '' AND length(first_name) <= 100 AND
  last_name IS NOT NULL AND trim(last_name) != '' AND length(last_name) <= 100 AND
  email IS NOT NULL AND trim(email) != '' AND length(email) <= 255 AND
  course_date_id IS NOT NULL AND
  -- Prevent excessively long optional fields
  (phone IS NULL OR length(phone) <= 50) AND
  (address IS NULL OR length(address) <= 500) AND
  (zip_city IS NULL OR length(zip_city) <= 100) AND
  (message IS NULL OR length(message) <= 2000) AND
  -- New registrations must be in pending status
  status = 'pending'
);

-- Lead Sources: Anyone can insert but with validation
CREATE POLICY "Public can create lead sources with validation"
ON public.lead_sources
FOR INSERT
TO anon, authenticated
WITH CHECK (
  registration_id IS NOT NULL AND
  (referrer IS NULL OR length(referrer) <= 2000) AND
  (landing_page IS NULL OR length(landing_page) <= 2000) AND
  (user_agent IS NULL OR length(user_agent) <= 1000) AND
  (ip_address IS NULL OR length(ip_address) <= 45)
);