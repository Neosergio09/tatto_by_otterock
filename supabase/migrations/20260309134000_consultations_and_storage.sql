-- Drop existing table if it exists as we're initializing the schema
DROP TABLE IF EXISTS public.consultations;

-- Create consultations table
CREATE TABLE public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    whatsapp TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT
);

-- Enable RLS on consultations (ensure security)
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT
CREATE POLICY "Allow public submissions" 
ON public.consultations 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Set up Storage for Reference Images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tattoo-references', 'tattoo-references', true)
ON CONFLICT (id) DO NOTHING;

-- Allow anonymous users to upload reference images
CREATE POLICY "Allow public uploads to tattoo-references"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'tattoo-references');
