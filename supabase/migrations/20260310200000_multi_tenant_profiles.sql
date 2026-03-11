-- Create profiles table if it does not exist
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY
);

-- Safely add columns in case the table already existed
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_styles JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Add profile_id to consultations
-- First, add the column
ALTER TABLE public.consultations ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
-- Public can view profiles
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
TO public 
USING (true);

-- Users can insert their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- Update Consultations Policies
-- Drop existing public insert policy to recreate it with profile validation
DROP POLICY IF EXISTS "Allow public submissions" ON public.consultations;
DROP POLICY IF EXISTS "Allow public submissions to specific profiles" ON public.consultations;

-- Allow public to insert consultations, but only for valid profiles
CREATE POLICY "Allow public submissions to specific profiles" 
ON public.consultations FOR INSERT 
TO public 
WITH CHECK (profile_id IS NOT NULL);

-- Artists can view only their own consultations
DROP POLICY IF EXISTS "Artists can view their own consultations" ON public.consultations;
CREATE POLICY "Artists can view their own consultations" 
ON public.consultations FOR SELECT 
TO authenticated 
USING (profile_id = auth.uid());
