-- Data Seeding Script for Supabase
-- Run this AFTER creating the schema
-- This will populate your tables with existing data from JSON files

-- ============================================
-- SEED PRODUCTS
-- ============================================
INSERT INTO products (id, title, price, description, category, image) VALUES
  (1, 'Tabla de Dibujo', 120.00, 'A clean, functional backpack for everyday use. Durable canvas material with leather accents.', 'Accessories', 'https://placehold.co/600x400/2a2a2a/FFF?text=Backpack'),
  (2, 'Wireless Headphones', 250.00, 'Noise-cancelling over-ear headphones with premium sound quality and 30-hour battery life.', 'Electronics', 'https://placehold.co/600x400/2a2a2a/FFF?text=Headphones'),
  (3, 'Smart Watch Series 5', 399.00, 'Stay connected and active with the latest smartwatch technology. Health tracking and notifications.', 'Electronics', 'https://placehold.co/600x400/2a2a2a/FFF?text=Watch'),
  (4, 'Lapices de Color Faber Castell', 145.00, 'Un paquete de Lapices Faber Castell', 'Lapices', 'https://placehold.co/600x400/2a2a2a/FFF?text=LapicesDeColorFaber'),
  (5, 'Mechanical Keyboard', 149.00, 'Tactile switches and customizable RGB lighting. Perfect for typing and gaming.', 'Electronics', 'https://placehold.co/600x400/2a2a2a/FFF?text=Keyboard'),
  (6, 'Lapiz Mecanico', 35.00, 'Modern ceramic vase suitable for dry or fresh flowers. Matte finish.', 'Home', 'https://placehold.co/600x400/2a2a2a/FFF?text=Vase'),
  (7, 'Cartuchera', 250.00, 'Test desc', 'Utiles', 'https://placehold.co/600x400/2a2a2a/FFF?text=Cartuchera')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to continue from max ID
SELECT setval('products_id_seq', (SELECT MAX(id) FROM products));

-- ============================================
-- SEED USER PROFILES
-- ============================================
-- Note: These are demo users. In production, users would sign up through Supabase Auth
-- For now, we'll create profiles without auth_user_id (legacy users)
INSERT INTO user_profiles (id, email, name, role) VALUES
  (1, 'user@example.com', 'Demo User', 'customer'),
  (2, 'john@example.com', 'John Doe', 'customer'),
  (3, 'jane@example.com', 'Jane Doe', 'customer'),
  (4, 'admin@admin.com', 'Administrator', 'admin'),
  (5, 'jane2@example.com', 'Jane 2', 'customer'),
  (6, 'jane3@example.com', 'Jane 3', 'customer'),
  (7, 'jane4@example.com', 'Jane 4', 'customer'),
  (8, 'jane5@example.com', 'Jane 5', 'customer'),
  (9, 'jane6@example.com', 'Jane 6', 'customer'),
  (10, 'john7@example.com', 'John Doe 7', 'customer')
ON CONFLICT (email) DO NOTHING;

-- Reset sequence
SELECT setval('user_profiles_id_seq', (SELECT MAX(id) FROM user_profiles));

-- ============================================
-- SEED ORDERS (Example from orders.json)
-- ============================================
-- Guest order example
INSERT INTO orders (
  id,
  user_id,
  guest_email,
  customer_name,
  customer_email,
  customer_phone,
  customer_address,
  customer_city,
  customer_postal_code,
  customer_province,
  total,
  payment_method,
  status,
  created_at
) VALUES (
  1770997018271,
  NULL,
  'guest@example.com',
  'Test Guest',
  'guest@example.com',
  '+54 11 1234-5678',
  'Av. Corrientes 1234',
  'Buenos Aires',
  'C1043',
  'Buenos Aires',
  1139.00,
  'transferencia',
  'Pending',
  '2026-02-13T15:36:58.271Z'
) ON CONFLICT (id) DO NOTHING;

-- Reset sequence
SELECT setval('orders_id_seq', (SELECT MAX(id) FROM orders));

-- ============================================
-- SEED ORDER ITEMS
-- ============================================
INSERT INTO order_items (
  order_id,
  product_id,
  product_title,
  product_price,
  product_image,
  quantity,
  subtotal
) VALUES
  -- Order 1770997018271 items
  (1770997018271, 2, 'Wireless Headphones', 250.00, 'https://placehold.co/600x400/2a2a2a/FFF?text=Headphones', 2, 500.00),
  (1770997018271, 1, 'Tabla de Dibujo', 120.00, 'https://placehold.co/600x400/2a2a2a/FFF?text=Backpack', 2, 240.00),
  (1770997018271, 3, 'Smart Watch Series 5', 399.00, 'https://placehold.co/600x400/2a2a2a/FFF?text=Watch', 1, 399.00);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify your data was seeded correctly

-- Check products count
SELECT COUNT(*) as product_count FROM products;

-- Check user profiles count
SELECT COUNT(*) as user_count FROM user_profiles;

-- Check orders count
SELECT COUNT(*) as order_count FROM orders;

-- Check order items count
SELECT COUNT(*) as order_item_count FROM order_items;

-- View a complete order with items
SELECT 
  o.id as order_id,
  o.customer_name,
  o.customer_email,
  o.total,
  o.status,
  oi.product_title,
  oi.quantity,
  oi.subtotal
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE o.id = 1770997018271;
