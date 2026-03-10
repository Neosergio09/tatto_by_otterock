-- 1. Enum types
CREATE TYPE consultation_status AS ENUM ('pending', 'quoted', 'approved', 'rejected');

-- 2. Create the consultations table
CREATE TABLE public.consultations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Client Info
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    
    -- Tattoo Details
    idea_description TEXT NOT NULL,
    body_placement TEXT NOT NULL,
    estimated_size TEXT NOT NULL,
    budget TEXT,
    
    -- Status
    status consultation_status DEFAULT 'pending'::consultation_status NOT NULL,
    
    -- Studio fields (internal)
    quoted_price NUMERIC,
    artist_notes TEXT,
    
    -- Array to store paths/URLs to images in the storage bucket
    reference_images TEXT[] DEFAULT '{}'::TEXT[]
);

-- 3. Set up Storage for Reference Images
-- Create a new bucket named 'consultations'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('consultations', 'consultations', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Set up Row Level Security (RLS)

-- Enable RLS on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to INSERT consultations (for the public form)
CREATE POLICY "Allow public submissions" 
ON public.consultations 
FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow anonymous users to upload reference images
CREATE POLICY "Allow public uploads to consultations"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (bucket_id = 'consultations');

-- We won't add SELECT/UPDATE policies for public so only authenticated artists can read them.
-- In a real scenario, you'd add SELECT/UPDATE policies for authenticated studio members:
-- CREATE POLICY "Artists can view everything" ON public.consultations FOR SELECT TO authenticated USING (true);
