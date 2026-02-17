-- Complete Database Schema for MediMark E-commerce
-- Run this SQL in your Supabase SQL Editor

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
  description TEXT,
  category TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);

-- ============================================
-- 2. USERS TABLE (Custom user profiles)
-- ============================================
-- Note: Supabase has auth.users for authentication
-- This table stores additional user profile data
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  province TEXT,
  -- We'll store a reference to Supabase auth user if they sign up
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_email ON user_profiles(email);
CREATE INDEX idx_user_profiles_auth_user_id ON user_profiles(auth_user_id);

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  -- For registered users
  user_id BIGINT REFERENCES user_profiles(id) ON DELETE SET NULL,
  -- For guest checkout
  guest_email TEXT,
  -- Customer information (always stored for shipping)
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_postal_code TEXT NOT NULL,
  customer_province TEXT NOT NULL,
  -- Order details
  total NUMERIC(10, 2) NOT NULL CHECK (total >= 0),
  payment_method TEXT NOT NULL DEFAULT 'transferencia',
  status TEXT NOT NULL DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'Paga', 'Completada', 'Cancelada')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- Constraint: must have either user_id OR guest_email
  CONSTRAINT check_user_or_guest CHECK (
    (user_id IS NOT NULL AND guest_email IS NULL) OR
    (user_id IS NULL AND guest_email IS NOT NULL)
  )
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_guest_email ON orders(guest_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 4. ORDER ITEMS TABLE (Normalized)
-- ============================================

-- ============================================
-- 1.1 CATEGORIES TABLE (Recursive)
-- ============================================
CREATE TABLE categories (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  parent_id BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);

-- Add category_id to products
ALTER TABLE products ADD COLUMN category_id BIGINT REFERENCES categories(id) ON DELETE SET NULL;
CREATE INDEX idx_products_category_id ON products(category_id);


-- ============================================
-- 1.2 PRODUCT CATEGORIES (Junction Table)
-- ============================================
CREATE TABLE product_categories (
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE INDEX idx_product_categories_product ON product_categories(product_id);
CREATE INDEX idx_product_categories_category ON product_categories(category_id);

-- Remove old category columns from products if they exist
-- ALTER TABLE products DROP COLUMN IF EXISTS category;
-- ALTER TABLE products DROP COLUMN IF EXISTS category_id;
-- Note: In a real production migration we would migrate data first. 
-- For now we will just create the new table and ignore the old columns
-- or let the user manually drop them. 
-- For cleanliness in this file, I will remove the definitions from the CREATE TABLE products above
-- but since this is an append-style file for the user to run, I'll add the DROP here.

-- ALTER TABLE products DROP COLUMN category; 
-- ALTER TABLE products DROP COLUMN category_id;

-- ============================================
-- 4. ORDER ITEMS TABLE (Normalized)
-- ============================================
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
  -- Store product details at time of purchase (in case product changes/deleted)
  product_title TEXT NOT NULL,
  product_price NUMERIC(10, 2) NOT NULL CHECK (product_price >= 0),
  product_image TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- ============================================
-- 5. AUTO-UPDATE TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 5.1 AUTH TRIGGER FOR AUTO-PROFILE CREATION
-- ============================================
-- This function will be called whenever a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (auth_user_id, email, name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Categories: Public read, admin write
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories are viewable by everyone"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage categories"
  ON categories FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

-- Product Categories: Public read, admin write
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Product categories are viewable by everyone"
  ON product_categories FOR SELECT
  USING (true);

CREATE POLICY "Admin can manage product categories"
  ON product_categories FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

-- Products: Public read, admin write
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Service role can manage products"
  ON products FOR ALL
  USING (auth.role() = 'service_role');

-- User Profiles: Users can read their own, admins can read all
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = auth_user_id OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage user profiles"
  ON user_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Orders: Users can view their own orders, service role can manage all
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
  );

CREATE POLICY "Admin can create products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'admin');

CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage orders"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- Order Items: Accessible through orders
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their order items"
  ON order_items FOR SELECT
  USING (
    auth.role() = 'service_role' OR
    order_id IN (
      SELECT id FROM orders 
      WHERE user_id IN (SELECT id FROM user_profiles WHERE auth_user_id = auth.uid())
    )
  );

CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can manage order items"
  ON order_items FOR ALL
  USING (auth.role() = 'service_role');


-- ============================================
-- 7. HOMEPAGE CONTENT MANAGEMENT
-- ============================================

-- Hero Slides
CREATE TABLE homepage_hero_slides (
  id BIGSERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  link_url TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Homepage Sections
CREATE TABLE homepage_sections (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Junction table for products in sections
CREATE TABLE homepage_section_products (
  section_id BIGINT REFERENCES homepage_sections(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  PRIMARY KEY (section_id, product_id)
);

-- RLS for homepage content
ALTER TABLE homepage_hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_section_products ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Hero slides are viewable by everyone" ON homepage_hero_slides FOR SELECT USING (true);
CREATE POLICY "Sections are viewable by everyone" ON homepage_sections FOR SELECT USING (true);
CREATE POLICY "Section products are viewable by everyone" ON homepage_section_products FOR SELECT USING (true);

-- Admin write access
CREATE POLICY "Admin can manage hero slides" ON homepage_hero_slides FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can manage sections" ON homepage_sections FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Admin can manage section products" ON homepage_section_products FOR ALL
  USING (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

-- Update Triggers
CREATE TRIGGER update_hero_slides_updated_at
  BEFORE UPDATE ON homepage_hero_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_homepage_sections_updated_at
  BEFORE UPDATE ON homepage_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
