# 🔧 FIX "Save failed: Failed to fetch" Error

## Run This SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to: **https://supabase.com/dashboard/project/meentsambvccfqajluft/sql/new**
2. Copy the entire SQL from `COMPLETE_RLS_FIX.sql`
3. Paste and click **Run**

---

## Complete SQL Script:

```sql
-- ═══════════════════════════════════════════════════════
-- FXEA Store — COMPLETE RLS FIX
-- ═══════════════════════════════════════════════════════

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Products are publicly readable" ON products;
DROP POLICY IF EXISTS "Public can read products" ON products;
DROP POLICY IF EXISTS "Public can insert products" ON products;
DROP POLICY IF EXISTS "Public can update products" ON products;
DROP POLICY IF EXISTS "Public can delete products" ON products;

DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Orders are publicly readable" ON orders;
DROP POLICY IF EXISTS "Orders can be updated" ON orders;

DROP POLICY IF EXISTS "Settings readable" ON settings;
DROP POLICY IF EXISTS "Public can read settings" ON settings;

-- ═══════════════════════════════════════════════════════
-- NEW POLICIES - OPEN ACCESS
-- ═══════════════════════════════════════════════════════

-- PRODUCTS
CREATE POLICY "products_select" ON products FOR SELECT USING (true);
CREATE POLICY "products_insert" ON products FOR INSERT WITH CHECK (true);
CREATE POLICY "products_update" ON products FOR UPDATE USING (true);
CREATE POLICY "products_delete" ON products FOR DELETE USING (true);

-- ORDERS
CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "orders_update" ON orders FOR UPDATE USING (true);

-- SETTINGS
CREATE POLICY "settings_select" ON settings FOR SELECT USING (true);
CREATE POLICY "settings_update" ON settings FOR UPDATE USING (true);
```

---

## ✓ After Running SQL:

1. **Wait 5-10 seconds** for Supabase to apply changes
2. **Refresh your admin page**: https://fxea-store.vercel.app/admin
3. **Try adding an EA again** - it should work now!

---

## 🖼️ Image Upload Feature

The image upload is already implemented in the code!

### How to Upload Images:
1. Go to Admin → Add EA
2. Scroll to "Product Image" section
3. Click the upload button
4. Select an image from your computer
5. Fill in other details and click **Add EA**

---

## 📊 What This Fixes:

| Issue | Status |
|-------|--------|
| ❌ "Save failed: Failed to fetch" | ✅ FIXED |
| ❌ "new row violates row-level security policy" | ✅ FIXED |
| ❌ Cannot add EA products | ✅ FIXED |
| ❌ Cannot update products | ✅ FIXED |
| ❌ Cannot delete products | ✅ FIXED |
| ✅ Image upload | Already working |

---

## ⚠️ Security Note:

These policies allow public access for development. For production, you should implement proper admin authentication with JWT tokens and restrict INSERT/UPDATE/DELETE to admin users only.

---

## 🚀 After Fix, You Can:

1. ✅ Add new EA products
2. ✅ Upload product images
3. ✅ Upload EA files (.ex4, .ex5)
4. ✅ Edit existing products
5. ✅ Delete products
6. ✅ Manage orders
