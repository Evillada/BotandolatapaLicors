-- =============================================
-- BOTANDO LA TAPA LICORS - Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CATEGORIES TABLE
-- =============================================
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default categories
INSERT INTO categories (name, slug, icon) VALUES
  ('Whisky', 'whisky', 'wine'),
  ('Vodka', 'vodka', 'glass-water'),
  ('Tequila', 'tequila', 'martini'),
  ('Gin', 'gin', 'cocktail'),
  ('Ron', 'ron', 'glass-water'),
  ('Champagne', 'champagne', 'champagne-glasses'),
  ('Aguardiente', 'aguardiente', 'bottle-droplet');

-- =============================================
-- PRODUCTS TABLE
-- =============================================
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  original_price DECIMAL(12, 2),
  discount INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  category VARCHAR(100),
  size VARCHAR(50),
  image_url TEXT,
  badge VARCHAR(50),
  stock INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  is_promotion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(active);
CREATE INDEX idx_products_promotion ON products(is_promotion);

-- =============================================
-- ORDERS TABLE
-- =============================================
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'delivered', 'cancelled');

CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number SERIAL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_notes TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  delivery_fee DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- =============================================
-- ADMIN USERS TABLE (for role management)
-- =============================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- CATEGORIES: Public read, admin write
CREATE POLICY "Categories are viewable by everyone" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Categories are editable by admins" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- PRODUCTS: Public read (active only), admin write
CREATE POLICY "Active products are viewable by everyone" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "All products viewable by admins" ON products
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Products are editable by admins" ON products
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Products are updatable by admins" ON products
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Products are deletable by admins" ON products
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ORDERS: Public insert, admin read/update
CREATE POLICY "Anyone can create orders" ON orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Orders are viewable by admins" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

CREATE POLICY "Orders are editable by admins" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- ADMIN_USERS: Only admins can view
CREATE POLICY "Admin users viewable by admins" ON admin_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid())
  );

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- SEED DATA: Initial Products
-- =============================================
INSERT INTO products (name, description, price, category, size, image_url, badge, stock, active) VALUES
  ('Johnnie Walker Black Label', 'Whisky escocés mezclado con notas de vainilla y frutas oscuras', 185000, 'Whisky', '750ml', '/johnnie-walker-black-label-whisky-bottle-premium-d.jpg', NULL, 50, true),
  ('Absolut Vodka', 'Vodka sueco premium, puro y versátil para cualquier ocasión', 89000, 'Vodka', '750ml', '/absolut-vodka-bottle-premium-dark-background.jpg', NULL, 100, true),
  ('Don Julio 70', 'Tequila añejo cristalino con sabor suave y sofisticado', 320000, 'Tequila', '700ml', '/don-julio-70-tequila-bottle-premium-dark-backgroun.jpg', 'Premium', 30, true),
  ('Hendricks Gin', 'Gin escocés con infusión de pepino y pétalos de rosa', 175000, 'Gin', '700ml', '/hendricks-gin-bottle-premium-dark-background.jpg', NULL, 40, true),
  ('Bacardi Superior', 'Ron blanco premium cubano, ideal para cócteles', 72000, 'Ron', '750ml', '/bacardi-white-rum-bottle-premium-dark-background.jpg', NULL, 80, true),
  ('Jack Daniels Tennessee', 'Whiskey americano con su característico sabor suave', 125000, 'Whiskey', '750ml', '/jack-daniels-tennessee-whiskey-bottle-premium-dark.jpg', NULL, 60, true),
  ('Grey Goose', 'Vodka francés ultra premium destilado de los mejores ingredientes', 195000, 'Vodka', '750ml', '/grey-goose-vodka-bottle-premium-dark-background.jpg', 'Bestseller', 45, true),
  ('Moët & Chandon Imperial', 'Champagne francés de renombre mundial, elegancia en cada copa', 280000, 'Champagne', '750ml', '/moet-chandon-champagne-bottle-premium-dark-backgro.jpg', 'Exclusivo', 25, true);

-- Promotions
INSERT INTO products (name, description, price, original_price, discount, category, size, image_url, stock, active, is_promotion) VALUES
  ('Buchanans 12 años', 'Whisky escocés premium', 145000, 175000, 17, 'Whisky', '750ml', '/buchanans-12-whisky-bottle-premium.jpg', 35, true, true),
  ('Aguardiente Antioqueño', 'El tradicional aguardiente colombiano', 42000, 52000, 20, 'Aguardiente', '750ml', '/aguardiente-antioqueno-bottle.jpg', 150, true, true),
  ('Red Label 1L', 'Johnnie Walker Red Label edición grande', 115000, 140000, 18, 'Whisky', '1L', '/johnnie-walker-red-label-whisky-bottle.jpg', 70, true, true);
