-- Create profiles table
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    custom_styles JSONB DEFAULT '{}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add profile_id to consultations
-- First, add the column
ALTER TABLE public.consultations ADD COLUMN profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Public can view profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
TO public 
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Update Consultations Policies
-- Drop existing public insert policy to recreate it with profile validation
DROP POLICY IF EXISTS "Allow public submissions" ON public.consultations;

-- Allow public to insert consultations, but only for valid profiles
CREATE POLICY "Allow public submissions to specific profiles" 
ON public.consultations FOR INSERT 
TO public 
WITH CHECK (profile_id IS NOT NULL);

-- Artists can view only their own consultations
CREATE POLICY "Artists can view their own consultations" 
ON public.consultations FOR SELECT 
TO authenticated 
USING (profile_id = auth.uid());
