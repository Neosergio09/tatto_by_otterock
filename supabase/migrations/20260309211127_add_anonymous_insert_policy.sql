CREATE POLICY "Enable insert for anonymous users" 
ON public.consultations 
FOR INSERT 
WITH CHECK (true);
