import React from 'react';
import { 
  Store, 
  Package, 
  Receipt, 
  BarChart3, 
  Database, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  isSupabaseConnected, 
  openSupabaseModal,
  cartCount
}) {
  const tabs = [
    { id: 'pos', label: 'หน้าขาย (POS)', icon: Store, badge: cartCount > 0 ? cartCount : null },
    { id: 'stock', label: 'สต็อกสินค้า', icon: Package },
    { id: 'history', label: 'ประวัติการขาย', icon: Receipt },
    { id: 'analytics', label: 'รายงานยอดขาย', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('pos')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-400 p-0.5 shadow-lg shadow-rose-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl">🌸</span>
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold bg-gradient-to-r from-rose-400 via-pink-300 to-amber-200 bg-clip-text text-transparent">
                  BloomPOS
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-medium bg-rose-500/20 text-rose-300 rounded border border-rose-500/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">ระบบจัดการร้านดอกไม้ & หน้าร้าน</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-md shadow-rose-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-rose-400' : ''}`} />
                  <span className="hidden md:inline">{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs font-bold bg-rose-500 text-white rounded-full animate-bounce">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Database Connection Status Badge */}
          <div className="flex items-center space-x-3">
            <button
              onClick={openSupabaseModal}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                isSupabaseConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="คลิกเพื่อตั้งค่า Supabase Connection"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConnected ? 'Supabase Live' : 'Demo Mode (Local)'}
              </span>
              <span className="flex h-2 w-2 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSupabaseConnected ? 'bg-emerald-400' : 'bg-amber-400'
                }`}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSupabaseConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}></span>
              </span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
