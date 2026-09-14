-- =============================================
-- Arreglar tabla products si falta alguna columna (error 42P17 en Vercel)
-- Ejecuta en Supabase > SQL Editor si /api/products devuelve 500 o "no encontrada".
-- Si la tabla products no existe, ejecuta antes schema.sql.
-- =============================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR(100);
ALTER TABLE products ADD COLUMN IF NOT EXISTS size VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_promotion BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(12, 2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
