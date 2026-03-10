-- Add reference_url column to consultations table
ALTER TABLE public.consultations
ADD COLUMN IF NOT EXISTS reference_url text;
