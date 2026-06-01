-- ═══════════════════════════════════════════════════════
-- FXEA Store — Complete Storage Setup
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- 1. First, go to Supabase Dashboard > Storage
-- 2. Create a bucket named: ea-files
-- 3. Make it PUBLIC (toggle the switch)
-- 4. Then run these policies:

-- ═══════════════════════════════════════════════════════
-- Storage Policies for 'ea-files' bucket
-- ═══════════════════════════════════════════════════════

-- Policy 1: Allow public read access
CREATE POLICY "Public can download files"
ON storage.objects FOR SELECT
USING (bucket_id = 'ea-files');

-- Policy 2: Allow authenticated uploads
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ea-files' AND auth.role() = 'authenticated');

-- Policy 3: Allow authenticated updates
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ea-files' AND auth.role() = 'authenticated');

-- Policy 4: Allow authenticated deletes
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'ea-files' AND auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- Fix Products Table
-- ═══════════════════════════════════════════════════════

-- Drop old policies safely
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Orders are publicly readable" ON orders;
DROP POLICY IF EXISTS "Orders can be updated" ON orders;
DROP POLICY IF EXISTS "Settings readable" ON settings;

-- Recreate product policies
CREATE POLICY "Products are publicly readable" 
ON products FOR SELECT 
USING (true);

-- Allow authenticated users (admins) to manage products
CREATE POLICY "Authenticated can manage products" 
ON products FOR ALL 
USING (auth.role() = 'authenticated');

-- Recreate order policies
CREATE POLICY "Anyone can create orders" 
ON orders FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Orders are publicly readable" 
ON orders FOR SELECT 
USING (true);

CREATE POLICY "Orders can be updated" 
ON orders FOR UPDATE 
USING (true);

-- Recreate settings policy
CREATE POLICY "Settings readable" 
ON settings FOR SELECT 
USING (true);

-- ═══════════════════════════════════════════════════════
-- Create admin_users table (for role management)
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Policy for admin_users
CREATE POLICY "Admins can read admin_users" 
ON admin_users FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can insert admin_users" 
ON admin_users FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════════════
-- Function to auto-create admin_users entry
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, role)
  VALUES (NEW.id, NEW.email, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create admin entry on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
