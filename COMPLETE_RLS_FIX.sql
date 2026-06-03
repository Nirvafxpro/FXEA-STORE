-- ═══════════════════════════════════════════════════════
-- FXEA Store — COMPLETE RLS FIX
-- Run this ENTIRE script in Supabase SQL Editor
-- ═══════════════════════════════════════════════════════

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Public can insert products" ON products;
DROP POLICY IF EXISTS "Public can update products" ON products;
DROP POLICY IF EXISTS "Public can delete products" ON products;
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;
DROP POLICY IF EXISTS "Authenticated can manage products" ON products;

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Orders are publicly readable" ON orders;
DROP POLICY IF EXISTS "Orders can be updated" ON orders;
DROP POLICY IF EXISTS "Public can read orders" ON orders;
DROP POLICY IF EXISTS "Public can insert orders" ON orders;
DROP POLICY IF EXISTS "Public can update orders" ON orders;
DROP POLICY IF EXISTS "Public can delete orders" ON orders;
DROP POLICY IF EXISTS "Admins can delete orders" ON orders;

DROP POLICY IF EXISTS "Settings readable" ON settings;
DROP POLICY IF EXISTS "Public can read settings" ON settings;
DROP POLICY IF EXISTS "Public can update settings" ON settings;
DROP POLICY IF EXISTS "Admins can update settings" ON settings;

-- ═══════════════════════════════════════════════════════
-- NEW POLICIES - OPEN ACCESS FOR DEVELOPMENT
-- ═══════════════════════════════════════════════════════

-- PRODUCTS - Full access
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- ORDERS - Full access
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true);
CREATE POLICY "orders_delete" ON orders FOR DELETE USING (true);

-- SETTINGS - Full access
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_insert" ON settings FOR INSERT WITH CHECK (true);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (true);

-- ═══════════════════════════════════════════════════════
-- VERIFY POLICIES
-- ═══════════════════════════════════════════════════════

SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  "with_check"
FROM pg_policies 
WHERE tablename IN ('products', 'orders', 'settings')
ORDER BY tablename, policyname;
