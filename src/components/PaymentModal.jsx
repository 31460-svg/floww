import React, { useState } from 'react';
import { 
  Banknote, 
  QrCode, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  X,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentModal({ 
  checkoutData, 
  onClose, 
  onPaymentSuccess 
}) {
  const [paymentMethod, setPaymentMethod] = useState('CASH'); // CASH, PROMPTPAY, CARD, BANK
  const [cashTendered, setCashTendered] = useState(checkoutData.total);
  const [isProcessing, setIsProcessing] = useState(false);

  const grandTotal = checkoutData.total;
  const changeAmount = Math.max(0, Number(cashTendered) - grandTotal);
  const isCashInsufficient = paymentMethod === 'CASH' && Number(cashTendered) < grandTotal;

  const quickCashPresets = [
    { label: 'พอดีคำ', amount: grandTotal },
    { label: '฿100', amount: 100 },
    { label: '฿500', amount: 500 },
    { label: '฿1,000', amount: 1000 },
  ];

  const handleConfirmPayment = () => {
    if (isCashInsufficient) return;

    setIsProcessing(true);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setTimeout(() => {
      setIsProcessing(false);
      onPaymentSuccess({
        ...checkoutData,
        paymentMethod,
        amountPaid: paymentMethod === 'CASH' ? Number(cashTendered) : grandTotal,
        change: paymentMethod === 'CASH' ? changeAmount : 0,
        completedAt: new Date().toISOString()
      });
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/50">
          <div>
            <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              ชำระเงินค่าสินค้า
            </h3>
            <p className="text-xs text-slate-400">ลูกค้า: {checkoutData.customerName} ({checkoutData.orderType})</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          
          {/* Total Display Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">ยอดชำระเงินสุทธิ</span>
            <span className="text-3xl font-black bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">
              ฿{grandTotal.toLocaleString()}
            </span>
          </div>

          {/* Payment Method Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2">เลือกวิธีชำระเงิน</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'CASH', label: 'เงินสด', icon: Banknote },
                { id: 'PROMPTPAY', label: 'พร้อมเพย์', icon: QrCode },
                { id: 'CARD', label: 'บัตรเครดิต', icon: CreditCard },
                { id: 'BANK', label: 'โอนเงิน', icon: Building2 },
              ].map(tab => {
                const Icon = tab.icon;
                const active = paymentMethod === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setPaymentMethod(tab.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? 'bg-rose-600/20 text-rose-300 border-rose-500 shadow-md shadow-rose-500/10'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${active ? 'text-rose-400' : ''}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Payment Method Specific Content */}
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80">
            
            {/* CASH MODE */}
            {paymentMethod === 'CASH' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">จำนวนเงินที่รับมา (บาท)</label>
                  <input
                    type="number"
                    value={cashTendered}
                    onChange={(e) => setCashTendered(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-bold text-slate-100 focus:outline-none focus:border-rose-500"
                  />
                </div>

                {/* Quick Cash Presets */}
                <div className="flex gap-2">
                  {quickCashPresets.map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => setCashTendered(preset.amount)}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Change Calculation */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400">เงินทอน</span>
                  <span className={`text-lg font-extrabold ${
                    isCashInsufficient ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {isCashInsufficient ? 'เงินไม่พอชำระ' : `฿${changeAmount.toLocaleString()}`}
                  </span>
                </div>
              </div>
            )}

            {/* PROMPTPAY QR MODE */}
            {paymentMethod === 'PROMPTPAY' && (
              <div className="flex flex-col items-center justify-center p-3 text-center space-y-3">
                <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200">
                  {/* Dynamic QR image generated from api */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=PROMPTPAY-0812345678-AMOUNT-${grandTotal}`}
                    alt="PromptPay QR Code"
                    className="w-36 h-36 object-contain"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-200">สแกนจ่ายผ่านแอปธนาคารทุกแห่ง</p>
                  <p className="text-[11px] text-slate-400">ชื่อบัญชี: ร้านดอกไม้ BloomPOS (พร้อมเพย์: 081-234-5678)</p>
                </div>
              </div>
            )}

            {/* CARD MODE */}
            {paymentMethod === 'CARD' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">หมายเลขบัตร (EDC / โหมดจำลอง)</label>
                  <input
                    type="text"
                    placeholder="•••• •••• •••• 4242"
                    defaultValue="4532 8900 1234 4242"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-400 mb-1">วันหมดอายุ</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      defaultValue="12/28"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">CVC / CVV</label>
                    <input
                      type="password"
                      placeholder="•••"
                      defaultValue="888"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* BANK TRANSFER MODE */}
            {paymentMethod === 'BANK' && (
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <p className="font-bold text-rose-300">ธนาคารกสิกรไทย (KBANK)</p>
                  <p className="font-mono text-sm text-amber-300 font-bold">123-4-56789-0</p>
                  <p className="text-slate-400 text-[11px]">ชื่อบัญชี: บจก. บลูมโพส ดอกไม้สด (สำนักงานใหญ่)</p>
                </div>
                <p className="text-[11px] text-slate-400 text-center">โปรดตรวจสอบสลิปโอนเงินก่อนยืนยันรายการ</p>
              </div>
            )}

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/50 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition-colors"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleConfirmPayment}
            disabled={isCashInsufficient || isProcessing}
            className={`flex-2 flex items-center justify-center space-x-2 py-3 px-6 rounded-xl font-bold text-xs transition-all shadow-lg ${
              isCashInsufficient || isProcessing
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-emerald-600/25 active:scale-98'
            }`}
          >
            {isProcessing ? (
              <span>กำลังบันทึกรายการ...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันการรับชำระเงิน</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
