-- ═══════════════════════════════════════════════════════
-- FXEA Store — Supabase Auth Setup
-- Run this in Supabase SQL Editor AFTER running the main setup
-- ═══════════════════════════════════════════════════════

-- 1. Enable Email Auth (Supabase Dashboard)
-- Go to: Authentication → Providers → Email
-- Enable "Enable email signups"
-- Enable "Secure email change"

-- 2. Create admin_users table for role management
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS on admin_users
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 4. Policies for admin_users
CREATE POLICY "Admin users can read own data" ON admin_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admin users can insert own data" ON admin_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 5. Function to automatically create admin_users entry
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_users (id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Trigger to call function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Grant service role access (for backend operations)
GRANT ALL ON admin_users TO service_role;
GRANT ALL ON admin_users TO postgres;

-- ═══════════════════════════════════════════════════════
-- INSTRUCTIONS
-- ═══════════════════════════════════════════════════════

-- After running this script:
-- 1. Go to Authentication → Users in Supabase Dashboard
-- 2. Click "Add User" or use the signup form in your app
-- 3. Create your first admin account
-- 4. The trigger will automatically create an admin_users entry
-- 5. To make someone admin, update their role:
--    UPDATE admin_users SET role = 'admin' WHERE email = 'your@email.com';

-- ═══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY UPDATES FOR PRODUCTS & ORDERS
-- ═══════════════════════════════════════════════════════

-- Allow authenticated admins to manage products
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow authenticated admins to manage orders
CREATE POLICY "Admins can manage orders" ON orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Allow authenticated admins to manage settings
CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
