import React, { useState } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  Eye, 
  Calendar, 
  User, 
  CreditCard,
  ShoppingBag
} from 'lucide-react';

export default function SalesHistory({ 
  orders, 
  onReprintReceipt 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPaymentFilter, setSelectedPaymentFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchSearch = order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchPayment = selectedPaymentFilter === 'ALL' || order.paymentMethod === selectedPaymentFilter;
    return matchSearch && matchPayment;
  });

  const paymentLabels = {
    'CASH': { label: 'เงินสด', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    'PROMPTPAY': { label: 'พร้อมเพย์', class: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
    'CARD': { label: 'บัตรเครดิต', class: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    'BANK': { label: 'โอนเงิน', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นตามเลขที่ใบเสร็จ หรือ ชื่อลูกค้า..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-rose-500"
          />
        </div>

        <div className="flex space-x-2">
          {['ALL', 'CASH', 'PROMPTPAY', 'CARD', 'BANK'].map(method => (
            <button
              key={method}
              onClick={() => setSelectedPaymentFilter(method)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedPaymentFilter === method
                  ? 'bg-rose-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {method === 'ALL' ? 'ทั้งหมด' : (paymentLabels[method]?.label || method)}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Receipt className="w-12 h-12 mx-auto text-slate-600 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">ยังไม่มีประวัติการขายในระบบ</p>
            <p className="text-xs">เมื่อคุณทำออเดอร์ในหน้า POS รายการจะมาปรากฏที่นี่โดยอัตโนมัติ</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">เลขที่ใบเสร็จ / วันที่</th>
                  <th className="py-3 px-4">ลูกค้า</th>
                  <th className="py-3 px-4">รายการสินค้า</th>
                  <th className="py-3 px-4">การชำระเงิน</th>
                  <th className="py-3 px-4 text-right">ยอดรวมสุทธิ</th>
                  <th className="py-3 px-4 text-center">พิมพ์ / ดูรายละเอียด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredOrders.map(order => {
                  const payMeta = paymentLabels[order.paymentMethod] || { label: order.paymentMethod, class: 'bg-slate-800 text-slate-300' };
                  const formattedTime = new Date(order.created_at || order.completedAt || Date.now()).toLocaleString('th-TH', {
                    year: '2-digit',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  });

                  return (
                    <tr key={order.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-bold text-rose-300">{order.orderNumber || order.order_number || order.id}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          {formattedTime}
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">{order.customerName || order.customer_name || 'ลูกค้าหน้าร้าน'}</div>
                        <div className="text-[10px] text-slate-400">{order.orderType || order.order_type || 'หน้าร้าน'}</div>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="line-clamp-1 text-slate-300">
                          {order.items?.map(i => `${i.product_name || i.name_th} (${i.quantity})`).join(', ') || 'สินค้าดอกไม้'}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          รวม {order.items?.length || 0} รายการ
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${payMeta.class}`}>
                          {payMeta.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right font-extrabold text-slate-100 text-sm">
                        ฿{Number(order.total).toLocaleString()}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                            title="ดูรายละเอียด"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => onReprintReceipt(order)}
                            className="p-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg transition-colors"
                            title="พิมพ์ใบเสร็จย้อนหลัง"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-100 text-base">ออเดอร์ #{selectedOrder.orderNumber || selectedOrder.id}</h3>
                <p className="text-xs text-slate-400">ลูกค้า: {selectedOrder.customerName || selectedOrder.customer_name}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-slate-300">
                    <span>{item.name_th || item.product_name} x {item.quantity}</span>
                    <span className="font-bold">฿{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>ยอดรวมสินค้า</span>
                  <span>฿{Number(selectedOrder.subtotal || selectedOrder.rawSubtotal || selectedOrder.total).toLocaleString()}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-red-400">
                    <span>ส่วนลด</span>
                    <span>-฿{Number(selectedOrder.discount).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-100 text-sm pt-1">
                  <span>ยอดชำระสุทธิ</span>
                  <span className="text-rose-400">฿{Number(selectedOrder.total).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onReprintReceipt(selectedOrder);
                  setSelectedOrder(null);
                }}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบเสร็จย้อนหลัง</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
