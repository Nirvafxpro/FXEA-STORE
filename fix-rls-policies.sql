-- ═══════════════════════════════════════════════════════
-- FXEA Store — Fix RLS Policies for Admin Operations
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Allow authenticated users (admins) to INSERT/UPDATE/DELETE products
CREATE POLICY "Authenticated users can manage products"
ON products
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to manage orders
CREATE POLICY "Authenticated users can manage orders"
ON orders
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow authenticated users to manage settings
CREATE POLICY "Authenticated users can manage settings"
ON settings
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
