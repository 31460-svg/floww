-- =================================================================
-- BLOOM POS - SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- =================================================================

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name_th TEXT NOT NULL,
    name_en TEXT,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'ดอก',
    stock INT NOT NULL DEFAULT 0,
    meaning TEXT,
    image TEXT,
    color TEXT,
    sku TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_name TEXT DEFAULT 'ลูกค้าหน้าร้าน',
    order_type TEXT DEFAULT 'หน้าร้าน',
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount NUMERIC NOT NULL DEFAULT 0,
    tax NUMERIC NOT NULL DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL,
    amount_paid NUMERIC NOT NULL DEFAULT 0,
    change NUMERIC NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Order Items Table
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id TEXT REFERENCES public.products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    price NUMERIC NOT NULL,
    quantity INT NOT NULL,
    unit TEXT DEFAULT 'ดอก',
    subtotal NUMERIC NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. Create Public Access Policies (Allow read/write for POS client)
CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);

-- 6. Insert Pre-seeded 20 Flowers
INSERT INTO public.products (id, name_th, name_en, category, price, unit, stock, meaning, image, color, sku)
VALUES
  ('flw-01', 'กุหลาบ', 'Red Rose', 'สด / ช่อยอดนิยม', 120, 'ดอก', 45, 'ความรักที่ลึกซึ้งและจริงใจ', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', '#e11d48', 'ROSE-RED-01'),
  ('flw-02', 'ทานตะวัน', 'Sunflower', 'สด / มงคล', 90, 'ดอก', 30, 'ความร่าเริง ความมั่นคงและความหวัง', 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=600&q=80', '#eab308', 'SUN-YEL-02'),
  ('flw-03', 'มะลิ', 'Jasmine', 'กลิ่นหอม / มงคล', 50, 'พวง', 60, 'ความรักอันบริสุทธิ์และกตัญญู', 'https://images.unsplash.com/photo-1592729645009-b96d1e63d14b?auto=format&fit=crop&w=600&q=80', '#f8fafc', 'JAS-WHT-03'),
  ('flw-04', 'ดาวเรือง', 'Marigold', 'กลิ่นหอม / มงคล', 35, 'ดอก', 80, 'ความเจริญรุ่งเรือง ร่ำรวยเงินทอง', 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80', '#f59e0b', 'MAR-GOLD-04'),
  ('flw-05', 'ชบา', 'Hibiscus', 'สด / สีสันสดใส', 45, 'ดอก', 25, 'ความสง่างามและความภูมิใจ', 'https://images.unsplash.com/photo-1550950158-d0d960dff51b?auto=format&fit=crop&w=600&q=80', '#ec4899', 'HIB-RED-05'),
  ('flw-06', 'กล้วยไม้', 'Orchid', 'ช่อพรีเมียม / มงคล', 150, 'ช่อ', 18, 'ความประณีต อ่อนหวาน ละเมียดละไม', 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80', '#a855f7', 'ORC-PUR-06'),
  ('flw-07', 'ลิลลี่', 'White Lily', 'สด / ช่อยอดนิยม', 180, 'ดอก', 22, 'ความซื่อสัตย์ ไร้เดียงสา ละมุนตา', 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?auto=format&fit=crop&w=600&q=80', '#f1f5f9', 'LIL-WHT-07'),
  ('flw-08', 'ทิวลิป', 'Tulip', 'นำเข้า / พรีเมียม', 220, 'ดอก', 15, 'ความรักที่สมบูรณ์แบบและการเริ่มต้นใหม่', 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=600&q=80', '#f43f5e', 'TUL-PNK-08'),
  ('flw-09', 'ดอกเข็ม', 'Ixora', 'สด / มงคล', 40, 'กระถาง', 35, 'เฉลียวฉลาด ปัญญาเฉียบแหลม', 'https://images.unsplash.com/photo-1616690710400-a16d146927c5?auto=format&fit=crop&w=600&q=80', '#ef4444', 'IXO-RED-09'),
  ('flw-10', 'ดอกบัว', 'Lotus', 'กลิ่นหอม / มงคล', 30, 'ดอก', 70, 'ความบริสุทธิ์ หลุดพ้น สงบสุข', 'https://images.unsplash.com/photo-1508615070457-7baeba4003ab?auto=format&fit=crop&w=600&q=80', '#f472b6', 'LOT-PNK-10'),
  ('flw-11', 'ดอกพุด', 'Gardenia', 'กลิ่นหอม / มงคล', 55, 'ดอก', 40, 'ความบริสุทธิ์ผุดผ่อง ความสมบูรณ์', 'https://images.unsplash.com/photo-1596073413225-300dd1d416c2?auto=format&fit=crop&w=600&q=80', '#ffffff', 'GAR-WHT-11'),
  ('flw-12', 'ดอกจำปี', 'White Champaka', 'กลิ่นหอม / มงคล', 60, 'พวง', 30, 'ความอ่อนหวาน เมตตา เสน่ห์ตรึงใจ', 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80', '#fef08a', 'CHA-WHT-12'),
  ('flw-13', 'ดอกจำปา', 'Golden Champaka', 'กลิ่นหอม / มงคล', 65, 'พวง', 25, 'มั่งคั่ง โชคลาภ เกียรติยศ', 'https://images.unsplash.com/photo-1567684014761-b65e2e59b9eb?auto=format&fit=crop&w=600&q=80', '#f97316', 'CHA-GLD-13'),
  ('flw-14', 'ดอกเฟื่องฟ้า', 'Bougainvillea', 'สด / สีสันสดใส', 85, 'กระถาง', 20, 'ความสดใส เบิกบาน ก้าวหน้า', 'https://images.unsplash.com/photo-1589217157232-464b505b197f?auto=format&fit=crop&w=600&q=80', '#d946ef', 'BOU-MAG-14'),
  ('flw-15', 'ดอกเบญจมาศ', 'Chrysanthemum', 'สด / ช่อยอดนิยม', 75, 'ดอก', 50, 'ความจริงใจ อายุยืนยาว สดใส', 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80', '#eab308', 'CHR-YEL-15'),
  ('flw-16', 'ดอกคาร์เนชั่น', 'Carnation', 'สด / ช่อยอดนิยม', 80, 'ดอก', 45, 'เสน่ห์แห่งรัก ชื่นชมยินดี', 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?auto=format&fit=crop&w=600&q=80', '#fb7185', 'CAR-PNK-16'),
  ('flw-17', 'ดอกเดซี่', 'Daisy', 'สด / ช่อยอดนิยม', 95, 'กำ', 35, 'ความไร้เดียงสา รอยยิ้ม ความหวัง', 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80', '#ffffff', 'DAI-WHT-17'),
  ('flw-18', 'ดอกลาเวนเดอร์', 'Lavender', 'นำเข้า / พรีเมียม', 250, 'ช่อ', 12, 'ความทรงจำที่สงบ ความหวังอันน่าหลงใหล', 'https://images.unsplash.com/photo-1528183429752-a97d0bf99b5a?auto=format&fit=crop&w=600&q=80', '#8b5cf6', 'LAV-PUR-18'),
  ('flw-19', 'ดอกโบตั๋น', 'Peony', 'นำเข้า / พรีเมียม', 320, 'ดอก', 10, 'ราชาแห่งดอกไม้ ความมั่งคั่งและความงามสง่า', 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80', '#f43f5e', 'PEO-PNK-19'),
  ('flw-20', 'ดอกไฮเดรนเยีย', 'Hydrangea', 'ช่อพรีเมียม / มงคล', 280, 'หัว', 14, 'ขอบคุณจากหัวใจ ความเข้าใจอันลึกซึ้ง', 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80', '#3b82f6', 'HYD-BLU-20')
ON CONFLICT (id) DO UPDATE SET
  name_th = EXCLUDED.name_th,
  price = EXCLUDED.price,
  stock = EXCLUDED.stock,
  image = EXCLUDED.image;
