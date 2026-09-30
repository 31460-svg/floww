import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Award,
  PieChart
} from 'lucide-react';

export default function Analytics({ orders, products }) {
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
  const totalOrdersCount = orders.length;
  const avgOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Calculate top selling flower items across all orders
  const itemSalesMap = {};
  orders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach(item => {
        const name = item.name_th || item.product_name;
        if (!itemSalesMap[name]) {
          itemSalesMap[name] = { name, quantity: 0, revenue: 0 };
        }
        itemSalesMap[name].quantity += Number(item.quantity || 0);
        itemSalesMap[name].revenue += Number((item.price || 0) * (item.quantity || 0));
      });
    }
  });

  const sortedTopFlowers = Object.values(itemSalesMap)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const topFlower = sortedTopFlowers[0] || { name: 'ไม่มีข้อมูล', quantity: 0 };

  // Payment method breakdown
  const paymentBreakdown = {
    CASH: 0,
    PROMPTPAY: 0,
    CARD: 0,
    BANK: 0
  };
  orders.forEach(o => {
    if (paymentBreakdown[o.paymentMethod] !== undefined) {
      paymentBreakdown[o.paymentMethod] += Number(o.total || 0);
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium">ยอดขายรวมสะสม</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-emerald-400">฿{totalRevenue.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" />
            จากรายการขายทั้งหมด {totalOrdersCount} บิล
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium">จำนวนออเดอร์ทั้งหมด</span>
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-rose-300">{totalOrdersCount} บิล</h3>
          <p className="text-[11px] text-slate-500 mt-1">อัปเดตเรียลไทม์</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium">ยอดขายเฉลี่ยต่อบิล</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl">
              <BarChart3 className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-amber-300">฿{avgOrderValue.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Average Order Value</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs text-slate-400 font-medium">ดอกไม้ขายดีอันดับ 1</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-lg font-black text-purple-300 truncate">{topFlower.name}</h3>
          <p className="text-[11px] text-slate-500 mt-1">ขายได้ทั้งหมด {topFlower.quantity} หน่วย</p>
        </div>

      </div>

      {/* Visual Charts & Ranking Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top 5 Best Selling Flowers Bar Chart Simulation */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              อันดับดอกไม้ขายดีที่สุด (Top 5 Best Sellers)
            </h3>
          </div>

          {sortedTopFlowers.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-8">ยังไม่มีข้อมูลยอดขายเพียงพอ</p>
          ) : (
            <div className="space-y-3">
              {sortedTopFlowers.map((item, idx) => {
                const maxQty = sortedTopFlowers[0].quantity || 1;
                const pct = Math.round((item.quantity / maxQty) * 100);

                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-200">
                        {idx + 1}. {item.name}
                      </span>
                      <span className="text-rose-400 font-mono">
                        {item.quantity} ชิ้น (฿{item.revenue.toLocaleString()})
                      </span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 to-amber-400 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Method Breakdown */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-rose-400" />
              สัดส่วนยอดขายตามช่องทางชำระเงิน
            </h3>
          </div>

          <div className="space-y-3">
            {[
              { key: 'CASH', name: 'เงินสด (Cash)', color: 'bg-emerald-500' },
              { key: 'PROMPTPAY', name: 'พร้อมเพย์ (PromptPay)', color: 'bg-blue-500' },
              { key: 'CARD', name: 'บัตรเครดิต (Credit Card)', color: 'bg-purple-500' },
              { key: 'BANK', name: 'โอนเงิน (Bank Transfer)', color: 'bg-amber-500' },
            ].map(m => {
              const amount = paymentBreakdown[m.key] || 0;
              const sharePct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;

              return (
                <div key={m.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">{m.name}</span>
                    <span className="font-bold text-slate-100">
                      ฿{amount.toLocaleString()} ({sharePct}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} transition-all duration-500`}
                      style={{ width: `${sharePct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
