import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import POSTerminal from './components/POSTerminal';
import PaymentModal from './components/PaymentModal';
import ReceiptModal from './components/ReceiptModal';
import StockManagement from './components/StockManagement';
import SalesHistory from './components/SalesHistory';
import Analytics from './components/Analytics';
import SupabaseModal from './components/SupabaseModal';
import { 
  fetchProducts, 
  saveProduct, 
  createOrder, 
  fetchOrders, 
  resetToSeedData, 
  isSupabaseConfigured 
} from './lib/supabaseClient';

export default function App() {
  const [activeTab, setActiveTab] = useState('pos'); // 'pos', 'stock', 'history', 'analytics'
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('local'); // 'supabase' or 'local'

  // Modal States
  const [checkoutData, setCheckoutData] = useState(null); // Active checkout payload
  const [activeReceipt, setActiveReceipt] = useState(null); // Active printable receipt payload
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const prodRes = await fetchProducts();
      setProducts(prodRes.data || []);
      setDataSource(prodRes.source || 'local');

      const ordRes = await fetchOrders();
      setOrders(ordRes.data || []);
    } catch (e) {
      console.error('Error loading initial data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handlers
  const handleProductSave = async (productObj) => {
    const res = await saveProduct(productObj);
    // Refresh list
    const updatedProdRes = await fetchProducts();
    setProducts(updatedProdRes.data || []);
  };

  const handleResetSeed = () => {
    if (window.confirm('คุณต้องการรีเซ็ตสินค้าเป็น 20 รายการดอกไม้เริ่มต้นใช่หรือไม่?')) {
      const reset = resetToSeedData();
      setProducts(reset);
      setOrders([]);
      setCart([]);
    }
  };

  const handleStartCheckout = (payload) => {
    setCheckoutData(payload);
  };

  const handlePaymentSuccess = async (completedPaymentObj) => {
    const orderNumber = `INV-${Date.now().toString().slice(-6)}`;
    
    const finalOrderRecord = {
      order: {
        id: `ord-${Date.now()}`,
        order_number: orderNumber,
        customer_name: completedPaymentObj.customerName || 'ลูกค้าหน้าร้าน',
        order_type: completedPaymentObj.orderType || 'หน้าร้าน',
        subtotal: completedPaymentObj.rawSubtotal,
        discount: completedPaymentObj.discount,
        tax: completedPaymentObj.tax,
        total: completedPaymentObj.total,
        payment_method: completedPaymentObj.paymentMethod,
        amount_paid: completedPaymentObj.amountPaid,
        change: completedPaymentObj.change,
        status: 'completed',
        created_at: new Date().toISOString()
      },
      items: completedPaymentObj.items
    };

    // Save order & update stock
    await createOrder(finalOrderRecord);

    // Refresh products and orders list
    await loadData();

    // Close payment modal & show printable receipt
    setCheckoutData(null);
    setActiveReceipt({
      ...completedPaymentObj,
      orderNumber,
      id: finalOrderRecord.order.id
    });
    setCart([]);
  };

  const handleReprintReceipt = (orderObj) => {
    setActiveReceipt({
      id: orderObj.id,
      orderNumber: orderObj.orderNumber || orderObj.order_number,
      customerName: orderObj.customerName || orderObj.customer_name || 'ลูกค้าหน้าร้าน',
      orderType: orderObj.orderType || orderObj.order_type || 'หน้าร้าน',
      items: orderObj.items || [],
      rawSubtotal: orderObj.subtotal || orderObj.rawSubtotal || orderObj.total,
      subtotal: orderObj.subtotal || orderObj.total,
      discount: orderObj.discount || 0,
      tax: orderObj.tax || 0,
      total: orderObj.total,
      paymentMethod: orderObj.paymentMethod || orderObj.payment_method || 'CASH',
      amountPaid: orderObj.amountPaid || orderObj.amount_paid || orderObj.total,
      change: orderObj.change || 0,
      completedAt: orderObj.created_at || orderObj.completedAt
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Prompt',sans-serif]">
      
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSupabaseConnected={isSupabaseConfigured && dataSource === 'supabase'}
        openSupabaseModal={() => setIsSupabaseModalOpen(true)}
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400 space-x-3">
            <span className="text-2xl animate-spin">🌸</span>
            <span className="text-sm font-medium">กำลังโหลดข้อมูลร้านดอกไม้...</span>
          </div>
        ) : (
          <>
            {activeTab === 'pos' && (
              <POSTerminal
                products={products}
                cart={cart}
                setCart={setCart}
                onCheckout={handleStartCheckout}
              />
            )}

            {activeTab === 'stock' && (
              <StockManagement
                products={products}
                onSaveProduct={handleProductSave}
                onResetSeed={handleResetSeed}
              />
            )}

            {activeTab === 'history' && (
              <SalesHistory
                orders={orders}
                onReprintReceipt={handleReprintReceipt}
              />
            )}

            {activeTab === 'analytics' && (
              <Analytics
                orders={orders}
                products={products}
              />
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {checkoutData && (
        <PaymentModal
          checkoutData={checkoutData}
          onClose={() => setCheckoutData(null)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}

      {activeReceipt && (
        <ReceiptModal
          receiptData={activeReceipt}
          onClose={() => setActiveReceipt(null)}
          onNewOrder={() => {
            setActiveReceipt(null);
            setActiveTab('pos');
          }}
        />
      )}

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        isSupabaseConnected={isSupabaseConfigured && dataSource === 'supabase'}
      />

    </div>
  );
}
