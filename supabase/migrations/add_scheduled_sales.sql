-- Add discount fields to products table
ALTER TABLE products 
ADD COLUMN discount_percentage NUMERIC(5,2) DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
ADD COLUMN sale_start_date TIMESTAMPTZ,
ADD COLUMN sale_end_date TIMESTAMPTZ;

-- Add index on sale dates for faster querying (optional but good practice)
CREATE INDEX idx_products_sale_dates ON products(sale_start_date, sale_end_date);
