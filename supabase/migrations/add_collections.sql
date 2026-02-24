-- Add is_collection field to products table
ALTER TABLE products 
ADD COLUMN is_collection BOOLEAN DEFAULT false;

CREATE INDEX idx_products_is_collection ON products(is_collection);

-- Create collection_items table
CREATE TABLE collection_items (
  collection_id UUID REFERENCES products(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  PRIMARY KEY (collection_id, product_id)
);

CREATE INDEX idx_collection_items_collection_id ON collection_items(collection_id);

-- RLS for collection items
ALTER TABLE collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection items are viewable by everyone"
  ON collection_items FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage collection items"
  ON collection_items FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));
