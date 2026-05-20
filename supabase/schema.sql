-- =============================================
-- Las Empanadas de Titi — Schema de Base de Datos
-- =============================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tabla: customers
-- Clientes del Club de Titi
-- =============================================
CREATE TABLE IF NOT EXISTS customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  total_purchases INTEGER DEFAULT 0,
  last_purchase_at TIMESTAMPTZ,
  birth_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Validación formato teléfono argentino (código país + código área + número)
  -- Ejemplo válido: 5491123456789 (13 dígitos) o 1123456789 (10 dígitos)
  CONSTRAINT phone_format CHECK (
    phone ~ '^\d{10,13}$'
  )
);

-- Índice para búsquedas por teléfono (upsert)
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- =============================================
-- Tabla: coupons
-- Cupones de descuento / regalos
-- =============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '7ma Empanada de Regalo (con 6)',
  discount_type TEXT NOT NULL DEFAULT 'item' CHECK (discount_type IN ('percentage', 'fixed', 'item')),
  value NUMERIC(10, 2) DEFAULT 0,
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para búsquedas por código de cupón
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);

-- Índice para búsquedas por customer_id
CREATE INDEX IF NOT EXISTS idx_coupons_customer ON coupons(customer_id);

-- =============================================
-- Row Level Security (RLS)
-- =============================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Política: Solo el service_role puede insertar/leer/actualizar
-- (las operaciones se hacen desde API routes con service_role key)
CREATE POLICY "Service role full access on customers"
  ON customers
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role full access on coupons"
  ON coupons
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Tabla: orders
-- Pedidos de la web
-- =============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'cocina', 'en_camino', 'entregado')),
  delivery_type TEXT NOT NULL DEFAULT 'retiro' CHECK (delivery_type IN ('retiro', 'envio')),
  delivery_address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);

-- RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Política: anon puede leer (necesario para Realtime en el browser)
CREATE POLICY "Anon can read orders"
  ON orders
  FOR SELECT
  USING (true);

-- Política: service_role puede todo (las API routes usan service_role)
CREATE POLICY "Service role full access on orders"
  ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Habilitar Realtime para la tabla orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
