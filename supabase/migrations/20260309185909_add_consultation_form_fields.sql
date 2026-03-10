-- Add new fields to consultations if they don't exist
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS body_part TEXT;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS size_cm NUMERIC;
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS style TEXT;

-- Since we see that the UI currently only has 'Nombre', 'Email', and 'Idea' but the db script explicitly included full_name, email, phone, idea_description, body_placement, estimated_size, budget
-- Wait, in the earlier migration we defined `consultations` via:
-- CREATE TABLE public.consultations (id, created_at, name, whatsapp, description, image_url)
-- Let's stick with the newly added ones:
-- body_part, size_cm, style. 
-- Wait, email wasn't in the newly initialized simplified schema! Let's check `20260309134000_consultations_and_storage.sql`
-- It had: id, created_at, name, whatsapp, description, image_url.
-- So we need to add email.
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS email TEXT;
