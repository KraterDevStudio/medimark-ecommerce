-- ==============================================================================
-- UUID Migration Script for Products and Orders
-- IMPORTANT: Make a backup of your database before running this script!
-- ==============================================================================

BEGIN;

-- 1. Add new UUID columns to products and orders
ALTER TABLE products ADD COLUMN new_id UUID DEFAULT gen_random_uuid();
ALTER TABLE orders ADD COLUMN new_id UUID DEFAULT gen_random_uuid();

-- 2. Add new UUID foreign key columns
ALTER TABLE product_categories ADD COLUMN new_product_id UUID;
ALTER TABLE homepage_section_products ADD COLUMN new_product_id UUID;
ALTER TABLE order_items ADD COLUMN new_order_id UUID;
ALTER TABLE order_items ADD COLUMN new_product_id UUID;

-- 3. Populate foreign key columns with the newly generated UUIDs
UPDATE product_categories pc
SET new_product_id = p.new_id
FROM products p
WHERE pc.product_id = p.id;

UPDATE homepage_section_products hsp
SET new_product_id = p.new_id
FROM products p
WHERE hsp.product_id = p.id;

UPDATE order_items oi
SET new_order_id = o.new_id
FROM orders o
WHERE oi.order_id = o.id;

UPDATE order_items oi
SET new_product_id = p.new_id
FROM products p
WHERE oi.product_id = p.id;

-- 4. Drop objects that depend on the old columns
-- Drop the policy that depends on order_items.order_id and orders.id
DROP POLICY IF EXISTS "Users can view their order items" ON order_items;

-- Since the old columns are part of foreign key constraints, we must drop those constraints first.
ALTER TABLE product_categories DROP CONSTRAINT product_categories_product_id_fkey;
ALTER TABLE homepage_section_products DROP CONSTRAINT homepage_section_products_product_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT order_items_order_id_fkey;
ALTER TABLE order_items DROP CONSTRAINT order_items_product_id_fkey;

-- We also have a Primary Key on product_categories and homepage_section_products that use product_id
ALTER TABLE product_categories DROP CONSTRAINT product_categories_pkey;
ALTER TABLE homepage_section_products DROP CONSTRAINT homepage_section_products_pkey;

-- Drop the views and policies that might depend directly on the primary key type (if any, usually RLS policies are fine but we'll see if Postgres complains)
-- Postgres generally allows dropping the PK columns cascadingly or requires dropping the constraint. Let's drop PK constraints:
ALTER TABLE products DROP CONSTRAINT products_pkey CASCADE;
ALTER TABLE orders DROP CONSTRAINT orders_pkey CASCADE;

-- 5. Drop old columns
ALTER TABLE product_categories DROP COLUMN product_id;
ALTER TABLE homepage_section_products DROP COLUMN product_id;
ALTER TABLE order_items DROP COLUMN order_id;
ALTER TABLE order_items DROP COLUMN product_id;
ALTER TABLE products DROP COLUMN id;
ALTER TABLE orders DROP COLUMN id;

-- 6. Rename new columns to original names
ALTER TABLE products RENAME COLUMN new_id TO id;
ALTER TABLE orders RENAME COLUMN new_id TO id;
ALTER TABLE product_categories RENAME COLUMN new_product_id TO product_id;
ALTER TABLE homepage_section_products RENAME COLUMN new_product_id TO product_id;
ALTER TABLE order_items RENAME COLUMN new_order_id TO order_id;
ALTER TABLE order_items RENAME COLUMN new_product_id TO product_id;

-- 7. Add constraints back
ALTER TABLE products ADD PRIMARY KEY (id);
ALTER TABLE orders ADD PRIMARY KEY (id);

-- Make FKs NOT NULL where appropriate
ALTER TABLE product_categories ALTER COLUMN product_id SET NOT NULL;
ALTER TABLE order_items ALTER COLUMN order_id SET NOT NULL;
-- Note: order_items.product_id can be NULL based on original schema
-- Note: homepage_section_products.product_id doesn't have NOT NULL explicitly in original schema, usually part of PK implies it

-- Re-add Primary Keys for junction tables
ALTER TABLE product_categories ADD PRIMARY KEY (product_id, category_id);
ALTER TABLE homepage_section_products ADD PRIMARY KEY (section_id, product_id);

-- Re-add Foreign Keys
ALTER TABLE product_categories 
  ADD CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE homepage_section_products 
  ADD CONSTRAINT homepage_section_products_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

ALTER TABLE order_items 
  ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE;

ALTER TABLE order_items 
  ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL;

-- Recreate Policy for order_items using the new UUID columns
CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    order_id IN (
      SELECT id FROM orders 
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
  );

-- 8. Recreate Indexes
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_categories_product ON product_categories(product_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

COMMIT;
