import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Save,
  X,
  TrendingDown
} from 'lucide-react';
import { CATEGORIES } from '../data/initialFlowers';

export default function StockManagement({ 
  products, 
  onSaveProduct, 
  onResetSeed 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // New product state
  const [newProduct, setNewProduct] = useState({
    id: `flw-${Date.now().toString().slice(-4)}`,
    name_th: '',
    name_en: '',
    category: 'สด / ช่อยอดนิยม',
    price: 100,
    unit: 'ดอก',
    stock: 20,
    meaning: '',
    image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    color: '#e11d48',
    sku: `FLW-NEW-${Math.floor(Math.random()*100)}`
  });

  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ทั้งหมด' || p.category === selectedCategory;
    const matchSearch = p.name_th.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  const lowStockProducts = products.filter(p => p.stock <= 15);

  const handleStockQuickChange = (product, delta) => {
    const updatedStock = Math.max(0, product.stock + delta);
    onSaveProduct({ ...product, stock: updatedStock });
  };

  const handleSaveEdit = () => {
    if (!editingProduct) return;
    onSaveProduct(editingProduct);
    setEditingProduct(null);
  };

  const handleCreateNewProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name_th) return;
    onSaveProduct(newProduct);
    setIsAddModalOpen(false);
    setNewProduct({
      id: `flw-${Date.now().toString().slice(-4)}`,
      name_th: '',
      name_en: '',
      category: 'สด / ช่อยอดนิยม',
      price: 100,
      unit: 'ดอก',
      stock: 20,
      meaning: '',
      image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
      color: '#e11d48',
      sku: `FLW-NEW-${Math.floor(Math.random()*100)}`
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">รายการสินค้าทั้งหมด</p>
            <h3 className="text-2xl font-black text-slate-100">{products.length} รายการ</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">เตือนสินค้าคลังต่ำ (&le; 15 ชิ้น)</p>
            <h3 className="text-2xl font-black text-amber-400">{lowStockProducts.length} รายการ</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">จำนวนสต็อกรวมทุกประเภท</p>
            <h3 className="text-2xl font-black text-emerald-400">
              {products.reduce((acc, curr) => acc + curr.stock, 0).toLocaleString()} ชิ้น
            </h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Action buttons */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาตามชื่อดอกไม้ หรือ รหัส SKU..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-200 focus:outline-none"
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onResetSeed}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center space-x-1.5 transition-colors"
            title="คืนค่าข้อมูลดอกไม้เริ่มต้น 20 ชนิด"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>รีเซ็ตข้อมูล 20 ชนิด</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-rose-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มดอกไม้ใหม่</span>
          </button>
        </div>

      </div>

      {/* Stock Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">รูป & ชื่อสินค้า</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">รหัส SKU</th>
                <th className="py-3 px-4">ราคา/หน่วย</th>
                <th className="py-3 px-4 text-center">คงเหลือในคลัง</th>
                <th className="py-3 px-4 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.map(p => {
                const isLow = p.stock <= 15;
                const isOut = p.stock <= 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <img
                        src={p.image}
                        alt={p.name_th}
                        className="w-10 h-10 rounded-xl object-cover bg-slate-950 border border-slate-800"
                      />
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{p.name_th}</div>
                        <div className="text-[11px] text-slate-400">{p.name_en}</div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-300">
                      <span className="px-2 py-1 bg-slate-800 rounded-md text-[11px] font-medium text-rose-300 border border-slate-700/50">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                      {p.sku || '-'}
                    </td>

                    <td className="py-3 px-4 font-bold text-rose-400">
                      ฿{p.price.toLocaleString()} <span className="text-slate-500 font-normal">/{p.unit}</span>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleStockQuickChange(p, -5)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                          title="ลด 5"
                        >
                          -5
                        </button>
                        
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                          isOut 
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40' 
                            : isLow 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}>
                          {p.stock} {p.unit}
                        </span>

                        <button
                          onClick={() => handleStockQuickChange(p, 5)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
                          title="เพิ่ม 5"
                        >
                          +5
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setEditingProduct(p)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium inline-flex items-center space-x-1"
                      >
                        <Edit className="w-3.5 h-3.5 text-rose-400" />
                        <span>แก้ไข</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100">แก้ไขข้อมูล: {editingProduct.name_th}</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อภาษาไทย</label>
                <input
                  type="text"
                  value={editingProduct.name_th}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name_th: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">จำนวนคงเหลือ</label>
                  <input
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ความหมายดอกไม้</label>
                <textarea
                  rows="2"
                  value={editingProduct.meaning || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, meaning: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingProduct(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1"
              >
                <Save className="w-3.5 h-3.5" />
                <span>บันทึกการแก้ไข</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <form onSubmit={handleCreateNewProduct} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100">เพิ่มรายการดอกไม้ใหม่</h3>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">ชื่อดอกไม้ (ภาษาไทย)*</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ดอกไฮยาซินธ์..."
                  value={newProduct.name_th}
                  onChange={(e) => setNewProduct({ ...newProduct, name_th: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">ราคา (บาท)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">จำนวนเริ่มต้น</label>
                  <input
                    type="number"
                    required
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">หมวดหมู่</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                >
                  {CATEGORIES.filter(c => c !== 'ทั้งหมด').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">ความหมายดอกไม้</label>
                <input
                  type="text"
                  placeholder="ความหมายมงคล..."
                  value={newProduct.meaning}
                  onChange={(e) => setNewProduct({ ...newProduct, meaning: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs"
              >
                บันทึกสินค้า
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
