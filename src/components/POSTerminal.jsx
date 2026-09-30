import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Minus, 
  Trash2, 
  ShoppingBag, 
  CreditCard, 
  Sparkles, 
  Tag, 
  User, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES } from '../data/initialFlowers';

export default function POSTerminal({ 
  products, 
  cart, 
  setCart, 
  onCheckout 
}) {
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [searchQuery, setSearchQuery] = useState('');
  const [customerName, setCustomerName] = useState('ลูกค้าหน้าร้าน');
  const [orderType, setOrderType] = useState('หน้าร้าน');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountType, setDiscountType] = useState('THB'); // 'THB' or 'PERCENT'
  const [includeTax, setIncludeTax] = useState(false);
  const [activeFlowerInfo, setActiveFlowerInfo] = useState(null);

  // Filter products by search and category
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    const matchesSearch = product.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (product.name_en && product.name_en.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (product.meaning && product.meaning.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  // Cart operations
  const addToCart = (product) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const product = products.find(p => p.id === productId);
          const maxStock = product ? product.stock : 999;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > maxStock) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(Boolean);
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
  };

  // Financial calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  let calculatedDiscount = 0;
  if (discountType === 'PERCENT') {
    calculatedDiscount = Math.round((rawSubtotal * Number(discountAmount)) / 100);
  } else {
    calculatedDiscount = Number(discountAmount) || 0;
  }
  calculatedDiscount = Math.min(calculatedDiscount, rawSubtotal);

  const subtotalAfterDiscount = Math.max(0, rawSubtotal - calculatedDiscount);
  const taxAmount = includeTax ? Math.round(subtotalAfterDiscount * 0.07) : 0;
  const finalTotal = subtotalAfterDiscount + taxAmount;

  const handleStartCheckout = () => {
    if (cart.length === 0) return;
    onCheckout({
      customerName,
      orderType,
      items: cart,
      rawSubtotal,
      discount: calculatedDiscount,
      tax: taxAmount,
      total: finalTotal
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-5rem)] pb-4">
      
      {/* LEFT SECTION: PRODUCT CATALOG */}
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900/60 rounded-2xl border border-slate-800 p-4 sm:p-5">
        
        {/* Search & Header */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อดอกไม้ (เช่น กุหลาบ, ทานตะวัน, ลิลลี่)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                ล้าง
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 self-end sm:self-center px-2">
            พบ <span className="text-rose-400 font-semibold">{filteredProducts.length}</span> รายการ
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex overflow-x-auto gap-2 pb-2 mb-4 scrollbar-none border-b border-slate-800/80">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {filteredProducts.map((flower) => {
            const cartItem = cart.find(i => i.id === flower.id);
            const inCartQty = cartItem ? cartItem.quantity : 0;
            const isOutOfStock = flower.stock <= 0;
            const isLowStock = flower.stock > 0 && flower.stock <= 15;

            return (
              <div
                key={flower.id}
                className={`group relative flex flex-col rounded-xl overflow-hidden glass-card transition-all ${
                  isOutOfStock ? 'opacity-60 grayscale-[40%]' : ''
                }`}
              >
                {/* Product Image */}
                <div className="relative h-32 sm:h-36 overflow-hidden bg-slate-950">
                  <img
                    src={flower.image}
                    alt={flower.name_th}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                  
                  {/* Category Pill */}
                  <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium bg-slate-950/80 text-rose-300 backdrop-blur-sm rounded-md border border-slate-700/50">
                    {flower.unit}
                  </span>

                  {/* Stock Indicator */}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-semibold rounded-md backdrop-blur-sm ${
                    isOutOfStock
                      ? 'bg-red-500/90 text-white'
                      : isLowStock
                      ? 'bg-amber-500/90 text-slate-950 font-bold'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {isOutOfStock ? 'หมด' : `คลัง: ${flower.stock}`}
                  </span>

                  {/* Info Trigger Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFlowerInfo(activeFlowerInfo?.id === flower.id ? null : flower);
                    }}
                    className="absolute bottom-2 right-2 p-1 rounded-full bg-slate-900/80 text-slate-300 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                    title="ดูความหมายดอกไม้"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Product Details */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-semibold text-sm text-slate-100 line-clamp-1">
                        {flower.name_th}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {flower.name_en}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {flower.meaning}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-xs text-slate-400">ราคา</span>
                      <div className="text-base font-bold text-rose-400">
                        ฿{flower.price.toLocaleString()}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">/{flower.unit}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => addToCart(flower)}
                      disabled={isOutOfStock}
                      className={`relative flex items-center justify-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isOutOfStock
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 active:scale-95'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ใส่ตะกร้า</span>
                      {inCartQty > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 bg-amber-400 text-slate-950 font-bold text-[10px] rounded-full shadow">
                          {inCartQty}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT SECTION: CART & CHECKOUT SIDEBAR */}
      <div className="w-full lg:w-96 flex flex-col bg-slate-900/90 rounded-2xl border border-slate-800 p-4 sm:p-5 glass-panel">
        
        {/* Cart Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-rose-400" />
            <h2 className="font-bold text-base text-slate-100">รายการสั่งซื้อ</h2>
            <span className="px-2 py-0.5 text-xs bg-rose-500/20 text-rose-300 font-bold rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} ชิ้น
            </span>
          </div>

          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-slate-400 hover:text-red-400 flex items-center space-x-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>ล้างตะกร้า</span>
            </button>
          )}
        </div>

        {/* Customer & Order Settings */}
        <div className="py-3 border-b border-slate-800/80 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">ชื่อลูกค้า</label>
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-8 pr-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">ประเภทออเดอร์</label>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value)}
                className="w-full px-2 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              >
                <option value="หน้าร้าน">หน้าร้าน</option>
                <option value="เดลิเวอรี่">จัดส่ง (Delivery)</option>
                <option value="สั่งจอง">สั่งจองล่วงหน้า</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto my-3 space-y-2.5 pr-1">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-16 h-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 text-2xl">
                🛒
              </div>
              <p className="text-sm font-medium text-slate-300">ยังไม่มีสินค้าในตะกร้า</p>
              <p className="text-xs text-slate-500 mt-1">คลิกปุ่ม "+ ใส่ตะกร้า" ทางซ้ายมือเพื่อเลือกดอกไม้</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-2.5 bg-slate-950/70 border border-slate-800/90 rounded-xl"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name_th}
                    className="w-10 h-10 rounded-lg object-cover bg-slate-800"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-slate-200 truncate">
                      {item.name_th}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      ฿{item.price} x {item.quantity} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700/60">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center text-slate-300 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="text-right min-w-[50px]">
                    <span className="text-xs font-bold text-rose-300">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Calculations & Summary Footer */}
        <div className="pt-3 border-t border-slate-800 space-y-2 bg-slate-900">
          
          {/* Discount Field */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-rose-400" />
              ส่วนลด
            </span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="0"
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="w-16 px-2 py-1 bg-slate-950 border border-slate-800 rounded text-right text-xs text-slate-200 focus:outline-none focus:border-rose-500"
              />
              <button
                onClick={() => setDiscountType(discountType === 'THB' ? 'PERCENT' : 'THB')}
                className="px-1.5 py-1 bg-slate-800 text-[10px] font-bold text-rose-300 rounded border border-slate-700"
              >
                {discountType === 'THB' ? '฿' : '%'}
              </button>
            </div>
          </div>

          {/* Subtotal */}
          <div className="flex justify-between text-xs text-slate-400">
            <span>ยอดรวมสินค้า</span>
            <span>฿{rawSubtotal.toLocaleString()}</span>
          </div>

          {calculatedDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-400">
              <span>หักส่วนลด</span>
              <span>-฿{calculatedDiscount.toLocaleString()}</span>
            </div>
          )}

          {/* Tax Checkbox */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={includeTax}
                onChange={(e) => setIncludeTax(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-rose-600 focus:ring-rose-500"
              />
              <span>ภาษีมูลค่าเพิ่ม VAT 7%</span>
            </label>
            <span>{includeTax ? `+฿${taxAmount.toLocaleString()}` : '฿0'}</span>
          </div>

          {/* Grand Total */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block">ยอดสุทธิที่ต้องชำระ</span>
              <span className="text-xl font-extrabold bg-gradient-to-r from-rose-400 to-amber-300 bg-clip-text text-transparent">
                ฿{finalTotal.toLocaleString()}
              </span>
            </div>

            <button
              onClick={handleStartCheckout}
              disabled={cart.length === 0}
              className={`flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
                cart.length === 0
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white shadow-rose-600/25 active:scale-98'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>ชำระเงิน</span>
            </button>
          </div>

        </div>

      </div>

      {/* Flower Meaning Drawer Modal */}
      {activeFlowerInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl p-5 relative">
            <button
              onClick={() => setActiveFlowerInfo(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white"
            >
              ✕
            </button>
            <div className="flex items-center space-x-3 mb-3">
              <img
                src={activeFlowerInfo.image}
                alt={activeFlowerInfo.name_th}
                className="w-14 h-14 rounded-xl object-cover"
              />
              <div>
                <h3 className="font-bold text-lg text-rose-300">{activeFlowerInfo.name_th}</h3>
                <p className="text-xs text-slate-400">{activeFlowerInfo.name_en} • {activeFlowerInfo.category}</p>
              </div>
            </div>
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <p><strong className="text-amber-300">ความหมายภาษาดอกไม้:</strong> {activeFlowerInfo.meaning}</p>
              <p><strong className="text-slate-400">ราคาขาย:</strong> ฿{activeFlowerInfo.price} / {activeFlowerInfo.unit}</p>
              <p><strong className="text-slate-400">คงเหลือในคลัง:</strong> {activeFlowerInfo.stock} {activeFlowerInfo.unit}</p>
              <p><strong className="text-slate-400">SKU Code:</strong> {activeFlowerInfo.sku}</p>
            </div>
            <button
              onClick={() => {
                addToCart(activeFlowerInfo);
                setActiveFlowerInfo(null);
              }}
              className="mt-4 w-full py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl"
            >
              เพิ่มเข้าตะกร้าสินค้า
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
