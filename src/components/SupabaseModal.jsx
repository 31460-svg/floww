import React, { useState } from 'react';
import { 
  Database, 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Sparkles,
  ShieldCheck,
  Globe
} from 'lucide-react';

export default function SupabaseModal({ isOpen, onClose, isSupabaseConnected }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlCode = `-- =================================================================
-- BLOOM POS - SUPABASE DATABASE SCHEMA MIGRATION SCRIPT
-- Copy and paste this script into Supabase SQL Editor and click RUN
-- =================================================================

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

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public insert orders" ON public.orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read order_items" ON public.order_items FOR SELECT USING (true);
CREATE POLICY "Allow public insert order_items" ON public.order_items FOR INSERT WITH CHECK (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                ตั้งค่า Supabase Database & Vercel
              </h3>
              <p className="text-xs text-slate-400">คู่มือเชื่อมต่อฐานข้อมูลสำหรับ BloomPOS</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
          
          {/* Current Status Box */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            isSupabaseConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-6 h-6 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-sm">
                  {isSupabaseConnected ? 'เชื่อมต่อ Supabase Live เรียบร้อยแล้ว!' : 'ปัจจุบันทำงานในโหมด Demo (Local Storage)'}
                </h4>
                <p className="text-[11px] opacity-80 mt-0.5">
                  {isSupabaseConnected
                    ? 'ข้อมูลสินค้า ดอกไม้ทั้ง 20 รายการ และออเดอร์จะถูกบันทึกลงใน Supabase Database'
                    : 'คุณสามารถทดลองใช้งาน POS ได้ทันที โดยไม่ต้องตั้งค่าใดๆ หรือใส่ API Keys เพื่อเชื่อมต่อ Supabase จริง'}
                </p>
              </div>
            </div>
          </div>

          {/* Step 1: Create Supabase Project & Run SQL */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs">1</span>
              สร้างตารางใน Supabase SQL Editor
            </h4>
            <p className="text-slate-400">
              สร้าง Project ที่ <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 underline font-semibold">supabase.com</a> แล้วคัดลอก SQL คำสั่งด้านล่างไปวางใน <strong>SQL Editor</strong> ในแดชบอร์ด Supabase:
            </p>

            <div className="relative">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto max-h-44 scrollbar-none">
                {sqlCode}
              </pre>
              <button
                onClick={copySql}
                className="absolute top-2 right-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center space-x-1 shadow"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก SQL'}</span>
              </button>
            </div>
          </div>

          {/* Step 2: Vercel Environment Variables */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-300 flex items-center justify-center text-xs">2</span>
              ตั้งค่า Environment Variables บน Vercel
            </h4>
            <p className="text-slate-400">
              เมื่อนำไป Deploy บน Vercel ให้เพิ่มค่า Environment Variables ในหัวข้อ <strong>Project Settings &gt; Environment Variables</strong>:
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono space-y-2 text-slate-200">
              <div>
                <span className="text-rose-400">VITE_SUPABASE_URL</span> = <span className="text-slate-400">https://your-project.supabase.co</span>
              </div>
              <div>
                <span className="text-rose-400">VITE_SUPABASE_ANON_KEY</span> = <span className="text-slate-400">your-anon-key-here</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl"
          >
            เข้าใจแล้ว
          </button>
        </div>

      </div>
    </div>
  );
}
