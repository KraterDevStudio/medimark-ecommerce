-- Migration Script: Add varieties to products and order_items

BEGIN;

-- 1. Add varieties array to products. Default to empty array `{}`.
ALTER TABLE products ADD COLUMN varieties TEXT[] DEFAULT '{}';

-- 2. Add selected_variety to order_items. It is optional.
ALTER TABLE order_items ADD COLUMN selected_variety TEXT;

COMMIT;
