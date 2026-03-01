BEGIN;

CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC(10, 2) NOT NULL CHECK (value > 0),
  max_uses INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_to TIMESTAMPTZ DEFAULT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'coupons_percentage_max_value'
  ) THEN
    ALTER TABLE coupons
      ADD CONSTRAINT coupons_percentage_max_value
      CHECK (type <> 'percentage' OR value <= 100)
      NOT VALID;
  END IF;
END $$;

ALTER TABLE coupons VALIDATE CONSTRAINT coupons_percentage_max_value;

ALTER TABLE orders
  ALTER COLUMN discount_amount SET DEFAULT 0;

UPDATE orders
SET discount_amount = 0
WHERE discount_amount IS NULL;

ALTER TABLE orders
  ALTER COLUMN discount_amount SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'orders_discount_non_negative'
  ) THEN
    ALTER TABLE orders
      ADD CONSTRAINT orders_discount_non_negative CHECK (discount_amount >= 0) NOT VALID;
  END IF;
END $$;

ALTER TABLE orders VALIDATE CONSTRAINT orders_discount_non_negative;

CREATE INDEX IF NOT EXISTS idx_orders_coupon_code ON orders(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active_dates ON coupons(is_active, valid_from, valid_to);

ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'coupons' AND policyname = 'Coupons are viewable by everyone'
  ) THEN
    CREATE POLICY "Coupons are viewable by everyone"
      ON coupons FOR SELECT
      USING (true);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'coupons' AND policyname = 'Admin can manage coupons'
  ) THEN
    CREATE POLICY "Admin can manage coupons" ON coupons FOR ALL
      USING (auth.role() = 'service_role' OR EXISTS (
        SELECT 1 FROM user_profiles
        WHERE auth_user_id = auth.uid() AND role = 'admin'
      ));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'update_coupons_updated_at'
  ) THEN
    CREATE TRIGGER update_coupons_updated_at
      BEFORE UPDATE ON coupons
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

COMMIT;
