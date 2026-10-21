-- Sayphora initial schema.
-- Conventions: snake_case, money stored as integer cents (no floating point),
-- timestamps are timestamptz, every foreign key has an explicit ON DELETE rule.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------- users ----
CREATE TABLE users (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT        NOT NULL,
  password_hash    TEXT        NOT NULL,
  name             TEXT        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  role             TEXT        NOT NULL DEFAULT 'Customer' CHECK (role IN ('Customer', 'Staff', 'Admin')),
  tier             TEXT        NOT NULL DEFAULT 'Insider' CHECK (tier IN ('Insider', 'VIB', 'Rouge')),
  points           INTEGER     NOT NULL DEFAULT 0 CHECK (points >= 0),
  lifetime_spend_cents INTEGER NOT NULL DEFAULT 0 CHECK (lifetime_spend_cents >= 0),
  phone            TEXT,
  skin_type        TEXT        NOT NULL DEFAULT 'Combination',
  skin_tone        TEXT        NOT NULL DEFAULT 'Medium',
  undertone        TEXT        NOT NULL DEFAULT 'Neutral',
  concerns         TEXT[]      NOT NULL DEFAULT '{}',
  favorite_brands  TEXT[]      NOT NULL DEFAULT '{}',
  token_version    INTEGER     NOT NULL DEFAULT 0,
  last_login_at    TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX users_email_lower_key ON users (lower(email));
CREATE INDEX users_role_idx ON users (role) WHERE role <> 'Customer';
CREATE TRIGGER users_set_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE addresses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  full_name   TEXT        NOT NULL,
  street      TEXT        NOT NULL,
  apt         TEXT,
  city        TEXT        NOT NULL,
  state       TEXT        NOT NULL DEFAULT '',
  zip_code    TEXT        NOT NULL,
  country     TEXT        NOT NULL,
  phone       TEXT        NOT NULL DEFAULT '',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX addresses_user_idx ON addresses (user_id);

CREATE TABLE password_resets (
  token_hash  TEXT PRIMARY KEY,
  user_id     UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX password_resets_user_idx ON password_resets (user_id);

-- ------------------------------------------------------------- catalogue ----
CREATE TABLE products (
  id                     TEXT PRIMARY KEY CHECK (id ~ '^[a-z0-9][a-z0-9-]*$'),
  name                   TEXT        NOT NULL,
  brand                  TEXT        NOT NULL,
  category               TEXT        NOT NULL,
  subcategory            TEXT        NOT NULL DEFAULT 'General',
  price_cents            INTEGER     NOT NULL CHECK (price_cents > 0),
  original_price_cents   INTEGER     CHECK (original_price_cents IS NULL OR original_price_cents > 0),
  rating                 NUMERIC(3,2) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count           INTEGER     NOT NULL DEFAULT 0 CHECK (review_count >= 0),
  is_bestseller          BOOLEAN     NOT NULL DEFAULT false,
  is_clean               BOOLEAN     NOT NULL DEFAULT true,
  is_sale                BOOLEAN     NOT NULL DEFAULT false,
  is_new                 BOOLEAN     NOT NULL DEFAULT false,
  stock                  INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  status                 TEXT        NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Draft', 'Archived')),
  description            TEXT        NOT NULL DEFAULT '',
  details                TEXT[]      NOT NULL DEFAULT '{}',
  how_to_use             TEXT[]      NOT NULL DEFAULT '{}',
  ingredients            TEXT        NOT NULL DEFAULT '',
  ingredient_analysis    JSONB,
  image                  TEXT        NOT NULL,
  hover_image            TEXT        NOT NULL,
  shades                 JSONB       NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(shades) = 'array'),
  sizes                  TEXT[]      NOT NULL DEFAULT '{}',
  skin_types             TEXT[]      NOT NULL DEFAULT '{}',
  coverage               TEXT,
  finish                 TEXT,
  awards                 TEXT,
  frequently_bought_with TEXT[]      NOT NULL DEFAULT '{}',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_status_category_idx ON products (status, category);
CREATE INDEX products_brand_idx ON products (brand);
CREATE INDEX products_search_trgm_idx
  ON products USING gin ((lower(name || ' ' || brand || ' ' || subcategory || ' ' || category)) gin_trgm_ops);
CREATE TRIGGER products_set_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE samples (
  id        TEXT PRIMARY KEY,
  name      TEXT    NOT NULL,
  brand     TEXT    NOT NULL,
  category  TEXT    NOT NULL,
  image     TEXT    NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE boutiques (
  id            TEXT PRIMARY KEY,
  name          TEXT        NOT NULL,
  address       TEXT        NOT NULL,
  city          TEXT        NOT NULL,
  map_uri       TEXT        NOT NULL,
  rating        NUMERIC(3,2),
  reviews_count INTEGER,
  phone         TEXT,
  services      TEXT[]      NOT NULL DEFAULT '{}',
  snippets      TEXT[]      NOT NULL DEFAULT '{}',
  in_stock_items TEXT[]     NOT NULL DEFAULT '{}',
  is_active     BOOLEAN     NOT NULL DEFAULT true
);
CREATE INDEX boutiques_city_idx ON boutiques (lower(city));

-- ------------------------------------------------------------- promotions ---
CREATE TABLE promo_codes (
  code                  TEXT PRIMARY KEY CHECK (code = upper(code) AND code ~ '^[A-Z0-9_-]{3,40}$'),
  description           TEXT        NOT NULL,
  discount_percent      INTEGER     CHECK (discount_percent BETWEEN 1 AND 100),
  discount_amount_cents INTEGER     CHECK (discount_amount_cents > 0),
  free_shipping         BOOLEAN     NOT NULL DEFAULT false,
  min_spend_cents       INTEGER     NOT NULL DEFAULT 0 CHECK (min_spend_cents >= 0),
  max_uses              INTEGER     CHECK (max_uses IS NULL OR max_uses > 0),
  usage_count           INTEGER     NOT NULL DEFAULT 0 CHECK (usage_count >= 0),
  required_tier         TEXT        CHECK (required_tier IN ('Insider', 'VIB', 'Rouge')),
  owner_user_id         UUID        REFERENCES users (id) ON DELETE CASCADE,
  is_active             BOOLEAN     NOT NULL DEFAULT true,
  expires_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- a code must grant something
  CHECK (discount_percent IS NOT NULL OR discount_amount_cents IS NOT NULL OR free_shipping),
  -- percent and fixed discounts are mutually exclusive
  CHECK (NOT (discount_percent IS NOT NULL AND discount_amount_cents IS NOT NULL))
);

CREATE TABLE rewards (
  id          TEXT PRIMARY KEY,
  title       TEXT    NOT NULL,
  description TEXT    NOT NULL DEFAULT '',
  cost_points INTEGER NOT NULL CHECK (cost_points > 0),
  value_cents INTEGER NOT NULL CHECK (value_cents > 0),
  is_active   BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE reward_redemptions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  reward_id    TEXT        NOT NULL REFERENCES rewards (id) ON DELETE RESTRICT,
  promo_code   TEXT        NOT NULL REFERENCES promo_codes (code) ON DELETE CASCADE,
  points_spent INTEGER     NOT NULL CHECK (points_spent > 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reward_redemptions_user_idx ON reward_redemptions (user_id, created_at DESC);

-- ----------------------------------------------------------------- orders ---
CREATE SEQUENCE order_number_seq START 10001;

CREATE TABLE orders (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       TEXT        NOT NULL UNIQUE,
  user_id            UUID        REFERENCES users (id) ON DELETE SET NULL,
  customer_email     TEXT        NOT NULL,
  status             TEXT        NOT NULL DEFAULT 'Processing'
                     CHECK (status IN ('Processing', 'Packed', 'Shipped', 'In Transit', 'Out for Delivery', 'Delivered', 'Cancelled')),
  payment_method     TEXT        NOT NULL,
  payment_provider   TEXT        NOT NULL DEFAULT 'manual',
  payment_status     TEXT        NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
  payment_reference  TEXT,
  payment_expires_at TIMESTAMPTZ,
  subtotal_cents     INTEGER     NOT NULL CHECK (subtotal_cents >= 0),
  discount_cents     INTEGER     NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
  gift_fee_cents     INTEGER     NOT NULL DEFAULT 0 CHECK (gift_fee_cents >= 0),
  shipping_cents     INTEGER     NOT NULL DEFAULT 0 CHECK (shipping_cents >= 0),
  tax_cents          INTEGER     NOT NULL DEFAULT 0 CHECK (tax_cents >= 0),
  total_cents        INTEGER     NOT NULL CHECK (total_cents >= 0),
  currency           TEXT        NOT NULL DEFAULT 'USD',
  promo_code         TEXT,
  shipping_method    TEXT        NOT NULL CHECK (shipping_method IN ('Standard', 'Express', 'Next-Day')),
  carrier            TEXT,
  tracking_number    TEXT,
  estimated_delivery DATE,
  ship_full_name     TEXT        NOT NULL,
  ship_street        TEXT        NOT NULL,
  ship_apt           TEXT,
  ship_city          TEXT        NOT NULL,
  ship_state         TEXT        NOT NULL DEFAULT '',
  ship_zip_code      TEXT        NOT NULL,
  ship_country       TEXT        NOT NULL,
  ship_phone         TEXT        NOT NULL DEFAULT '',
  is_gift            BOOLEAN     NOT NULL DEFAULT false,
  gift_wrap_type     TEXT,
  gift_message       TEXT,
  samples            JSONB       NOT NULL DEFAULT '[]'::jsonb,
  points_earned      INTEGER     NOT NULL DEFAULT 0 CHECK (points_earned >= 0),
  points_awarded     BOOLEAN     NOT NULL DEFAULT false,
  idempotency_key    TEXT,
  cancelled_at       TIMESTAMPTZ,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_created_idx ON orders (user_id, created_at DESC);
CREATE INDEX orders_status_created_idx ON orders (status, created_at DESC);
CREATE INDEX orders_created_idx ON orders (created_at DESC);
CREATE INDEX orders_pending_payment_idx ON orders (payment_expires_at) WHERE payment_status = 'Pending' AND payment_expires_at IS NOT NULL;
CREATE UNIQUE INDEX orders_idempotency_key ON orders (user_id, idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE UNIQUE INDEX orders_payment_reference_key ON orders (payment_provider, payment_reference) WHERE payment_reference IS NOT NULL;
CREATE TRIGGER orders_set_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID    NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id       TEXT    NOT NULL REFERENCES products (id) ON DELETE RESTRICT,
  -- snapshots so historic orders stay accurate when the catalogue changes
  product_name     TEXT    NOT NULL,
  brand            TEXT    NOT NULL,
  category         TEXT    NOT NULL,
  image            TEXT    NOT NULL,
  shade_id         TEXT,
  shade_name       TEXT,
  shade_hex        TEXT,
  size             TEXT,
  quantity         INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents > 0)
);
CREATE INDEX order_items_order_idx ON order_items (order_id);
CREATE INDEX order_items_product_idx ON order_items (product_id);

CREATE TABLE order_events (
  id            BIGSERIAL PRIMARY KEY,
  order_id      UUID        NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  status        TEXT        NOT NULL,
  note          TEXT,
  actor_user_id UUID        REFERENCES users (id) ON DELETE SET NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX order_events_order_idx ON order_events (order_id, created_at);

-- ---------------------------------------------------------------- reviews ---
CREATE TABLE reviews (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id        TEXT        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  user_id           UUID        REFERENCES users (id) ON DELETE SET NULL,
  user_name         TEXT        NOT NULL,
  user_badge        TEXT,
  rating            INTEGER     NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title             TEXT        NOT NULL CHECK (char_length(title) BETWEEN 1 AND 140),
  comment           TEXT        NOT NULL CHECK (char_length(comment) BETWEEN 1 AND 4000),
  verified_purchase BOOLEAN     NOT NULL DEFAULT false,
  shade_used        TEXT,
  skin_type         TEXT,
  skin_tone         TEXT,
  undertone         TEXT,
  recommended       BOOLEAN     NOT NULL DEFAULT true,
  helpful_count     INTEGER     NOT NULL DEFAULT 0 CHECK (helpful_count >= 0),
  unhelpful_count   INTEGER     NOT NULL DEFAULT 0 CHECK (unhelpful_count >= 0),
  photos            TEXT[]      NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX reviews_product_created_idx ON reviews (product_id, created_at DESC);
CREATE UNIQUE INDEX reviews_one_per_user_product ON reviews (product_id, user_id) WHERE user_id IS NOT NULL;
CREATE TRIGGER reviews_set_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE review_votes (
  review_id  UUID        NOT NULL REFERENCES reviews (id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  vote       SMALLINT    NOT NULL CHECK (vote IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (review_id, user_id)
);

-- --------------------------------------------------------------- the rest ---
CREATE TABLE wishlist_items (
  user_id    UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  product_id TEXT        NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE newsletter_subscribers (
  email      TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_events (
  id         BIGSERIAL PRIMARY KEY,
  kind       TEXT        NOT NULL CHECK (kind IN ('shade-match', 'skincare-routine', 'beauty-consultant', 'store-locator')),
  source     TEXT        NOT NULL CHECK (source IN ('gemini', 'fallback')),
  user_id    UUID        REFERENCES users (id) ON DELETE SET NULL,
  detail     TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ai_events_kind_created_idx ON ai_events (kind, created_at DESC);
