import React from 'react';
import { Printer, CheckCircle, X, Sparkles } from 'lucide-react';

export default function ReceiptModal({ 
  receiptData, 
  onClose, 
  onNewOrder 
}) {
  const handlePrint = () => {
    window.print();
  };

  const paymentMethodLabel = {
    'CASH': 'เงินสด (Cash)',
    'PROMPTPAY': 'พร้อมเพย์ (PromptPay)',
    'CARD': 'บัตรเครดิต (Credit Card)',
    'BANK': 'โอนผ่านธนาคาร (Bank Transfer)'
  }[receiptData.paymentMethod] || receiptData.paymentMethod;

  const formattedDate = new Date(receiptData.completedAt || Date.now()).toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]">
        
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80 no-print">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>ชำระเงินสำเร็จ!</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PRINTABLE RECEIPT CARD BODY */}
        <div className="flex-1 overflow-y-auto p-6 bg-white text-slate-900 font-mono text-xs shadow-inner select-text" id="printable-receipt">
          
          {/* Store Logo & Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h2 className="font-bold text-base tracking-wide text-slate-950 uppercase">🌸 BLOOM POS SHOP 🌸</h2>
            <p className="text-[11px] text-slate-600">ร้านดอกไม้ & ช่อดอกไม้สดพรีเมียม</p>
            <p className="text-[10px] text-slate-500">โทร: 02-123-4567 | Line: @bloompos</p>
            <p className="text-[10px] text-slate-500 mt-1">สาขาหลัก สยามสแควร์ กรุงเทพฯ</p>
          </div>

          {/* Receipt Info */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">เลขที่ใบเสร็จ:</span>
              <span className="font-bold">{receiptData.orderNumber || receiptData.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">วันที่-เวลา:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ลูกค้า / ประเภท:</span>
              <span>{receiptData.customerName} ({receiptData.orderType})</span>
            </div>
          </div>

          {/* Items Breakdown Table */}
          <div className="py-3 border-b border-dashed border-slate-300">
            <div className="grid grid-cols-12 font-bold pb-1 text-[10px] text-slate-700 uppercase">
              <span className="col-span-6">รายการ</span>
              <span className="col-span-2 text-center">จำนวน</span>
              <span className="col-span-4 text-right">รวม (฿)</span>
            </div>
            <div className="space-y-1.5 pt-1 text-[11px]">
              {receiptData.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center">
                  <span className="col-span-6 font-semibold line-clamp-1">{item.name_th}</span>
                  <span className="col-span-2 text-center text-slate-600">x{item.quantity}</span>
                  <span className="col-span-4 text-right font-bold">
                    {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals & Calculations */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between text-slate-600">
              <span>รวมเงิน (Subtotal):</span>
              <span>฿{receiptData.rawSubtotal?.toLocaleString() || receiptData.subtotal?.toLocaleString()}</span>
            </div>

            {receiptData.discount > 0 && (
              <div className="flex justify-between text-red-600 font-medium">
                <span>ส่วนลด (Discount):</span>
                <span>-฿{receiptData.discount.toLocaleString()}</span>
              </div>
            )}

            {receiptData.tax > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>ภาษี VAT 7%:</span>
                <span>+฿{receiptData.tax.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-sm font-black pt-1 text-slate-950 border-t border-slate-200">
              <span>ยอดสุทธิ (TOTAL):</span>
              <span>฿{receiptData.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method & Change */}
          <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">วิธีชำระ:</span>
              <span className="font-semibold">{paymentMethodLabel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">รับเงินมา:</span>
              <span>฿{receiptData.amountPaid?.toLocaleString() || receiptData.total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900">
              <span className="text-slate-500">เงินทอน:</span>
              <span>฿{(receiptData.change || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Footer Thank You Message */}
          <div className="text-center pt-4 space-y-1">
            <p className="font-bold text-[11px] text-slate-800">*** ขอบคุณที่อุดหนุน BloomPOS ***</p>
            <p className="text-[9px] text-slate-500">ขอให้มีความสุขสดชื่นดั่งมวลบุปผาชาติ 🌸</p>
            <div className="pt-2 flex justify-center opacity-70">
              <div className="h-6 w-48 bg-slate-900 rounded flex items-center justify-center text-white text-[8px] tracking-widest font-mono">
                |||| ||| ||||||| ||| |||||
              </div>
            </div>
          </div>

        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex space-x-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center space-x-1.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์ใบเสร็จ</span>
          </button>

          <button
            onClick={onNewOrder}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            ทำรายการถัดไป
          </button>
        </div>

      </div>
    </div>
  );
}
