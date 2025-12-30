-- Create contact_submissions table to store form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  location TEXT,
  message TEXT NOT NULL,
  contact_method TEXT NOT NULL CHECK (contact_method IN ('whatsapp', 'email')),
  pdf_content TEXT,
  inverter_sizing JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting (anyone can submit a contact form)
CREATE POLICY "Anyone can submit contact form" 
ON public.contact_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policy for reading (only for authenticated admin users - for now allow none)
CREATE POLICY "No public read access" 
ON public.contact_submissions 
FOR SELECT 
USING (false);