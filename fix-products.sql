-- ═══════════════════════════════════════════════════════
-- FXEA Store — Fix Products Status
-- Run this in Supabase SQL Editor to make products available
-- ═══════════════════════════════════════════════════════

-- 1. Mark all products as in stock
UPDATE products 
SET in_stock = true;

-- 2. Verify the changes
SELECT 
  id, 
  name, 
  price, 
  in_stock,
  featured
FROM products
ORDER BY created_at DESC;

-- 3. (Optional) Update specific product
-- UPDATE products 
-- SET in_stock = true 
-- WHERE id = 'your-product-id';
