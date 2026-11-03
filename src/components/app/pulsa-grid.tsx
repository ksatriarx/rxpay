'use client';
import { useState, useEffect } from 'react';
import { formatIDR } from '@/lib/utils';
import { X, Smartphone, CheckCircle2, AlertCircle, Share2, Loader2, Zap, Bell } from 'lucide-react';
import { toast } from 'sonner';

export default function PulsaGrid({ products }: { products: any[] }) {
  const [phone, setPhone] = useState('');
  const [detectedBrand, setDetectedBrand] = useState('TELKOMSEL');
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

  useEffect(() => {
    const prefix = phone.substring(0, 4);
    if (!prefix) return;
    if (['0811','0812','0813','0821','0822','0823','0851','0852','0853'].some(p => prefix.startsWith(p))) setDetectedBrand('TELKOMSEL');
    else if (['0814','0815','0816','0855','0856','0857','0858'].some(p => prefix.startsWith(p))) setDetectedBrand('INDOSAT');
    else if (['0817','0818','0819','0859','0877','0878'].some(p => prefix.startsWith(p))) setDetectedBrand('XL');
    else if (['0831','0832','0833','0838'].some(p => prefix.startsWith(p))) setDetectedBrand('AXIS');
    else if (['0895','0896','0897','0898','0899'].some(p => prefix.startsWith(p))) setDetectedBrand('TRI');
    else if (['0881','0882','0883','0884','0885','0886','0887','0888','0889'].some(p => prefix.startsWith(p))) setDetectedBrand('SMARTFREN');
  }, [phone]);

  const filteredProducts = products.filter(p => p.brand === detectedBrand);

  const handleBuy = async () => {
    if (!phone) return toast.error('Masukkan nomor HP terlebih dahulu');
    setLoading(true);
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selected.id, customerNo: phone })
      });
      
      const rawText = await res.text();
      let data;
      try { data = JSON.parse(rawText); } 
      catch (e) { throw new Error(`Server Crash (HTTP ${res.status}).`); }

      setLoading(false);

      if (data.success) {
        setSuccessTx(data.tx);
        setPhone('');
        toast.success('Transaksi Berhasil!');
      } else {
        setErrorMsg(data.error || 'Gagal memproses transaksi');
        toast.error('Transaksi Gagal');
      }
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Koneksi terputus.');
      toast.error('Koneksi terputus');
    }
  };

  const getNominal = (name: string, brand: string) => {
    return name.replace(new RegExp(brand, 'gi'), '').trim();
  };

  return (
    <div className="min-h-screen bg-[#F0F2F8] pb-24">
      {/* HEADER DENGAN GRADIENT DAN CURVED BOTTOM */}
      <div className="relative bg-gradient-to-br from-[#4338CA] via-[#6366F1] to-[#8B5CF6] pt-12 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#F0F2F8] opacity-20" />
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 bg-[#F0F2F8]"
          style={{
            borderRadius: '24px 24px 0 0',
            marginTop: '-24px'
          }}
        />
        
        <div className="relative flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
              <span className="text-white font-black text-lg">RX</span>
            </div>
            <h1 className="text-white font-extrabold text-xl tracking-tight">RX PAY</h1>
          </div>
          <button className="w-10 h-10 bg-white/15 backdrop-blur-md rounded-xl flex items-center justify-center relative border border-white/20">
            <Bell className="w-5 h-5 text-white" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#6366F1]" />
          </button>
        </div>

        <div className="relative">
          <h2 className="text-2xl font-black text-white mb-1">Pulsa</h2>
          <p className="text-white/70 text-sm font-medium">Pilih produk yang kamu butuhkan.</p>
        </div>
      </div>

      <div className="px-5 -mt-8 relative z-10 space-y-5">
        {/* KOTAK INPUT DENGAN GRADIENT BORDER */}
        <div className="relative bg-white rounded-2xl p-5 shadow-[0_0_0_1px_rgba(168,85,247,0.1),0_4px_16px_rgba(0,0,0,0.06)]">
          <label className="block text-xs font-bold text-slate-600 mb-2">Masukkan Nomor HP</label>
          <div className="relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-12 bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 rounded-xl opacity-50" />
            <div className="relative flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
              <Smartphone className="w-5 h-5 text-slate-400" />
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full text-lg font-bold text-slate-700 placeholder-slate-300 outline-none bg-transparent"
                placeholder="08123456789" 
              />
            </div>
          </div>
        </div>

        {/* TAB KAPSUL (PILL) DENGAN GRADIENT */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => { setDetectedBrand(brand); setSelected(null); setErrorMsg(''); }}
              className={`px-6 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
                detectedBrand === brand 
                  ? 'bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#6366F1] text-white border-transparent shadow-[0_4px_16px_rgba(79,70,229,0.35)] scale-105' 
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>

        {/* GRID PRODUK */}
        <div className="grid grid-cols-3 gap-3">
          {filteredProducts.map((p) => {
            const isSelected = selected?.id === p.id;
            return (
              <div 
                key={p.id} 
                onClick={() => { setSelected(p); setErrorMsg(''); }} 
                className={`relative bg-white p-4 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isSelected 
                    ? 'shadow-[0_0_0_3px_rgba(99,102,241,0.15),0_4px_16px_rgba(0,0,0,0.08)]' 
                    : 'border border-slate-100 shadow-sm hover:border-slate-300 hover:shadow-md'
                }`}
                style={isSelected ? {
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)',
                  border: '2px solid transparent',
                  backgroundImage: 'linear-gradient(white,white), linear-gradient(135deg, #6366F1, #8B5CF6)',
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'content-box, border-box'
                } : {}}
              >
                {/* ICON PETIR DI POJOK KANAN ATAS */}
                <div className="absolute top-3 right-3">
                  <Zap className="w-4 h-4 text-blue-300 fill-blue-100" />
                </div>
                
                <div className="text-center mt-1">
                  <span className="font-extrabold text-slate-800 text-lg block leading-tight">
                    {getNominal(p.product_name, p.brand)}
                  </span>
                  <span className="font-bold text-[#4F46E5] text-sm mt-1 block">
                    {formatIDR(p.sell_price)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100 shadow-sm">
            Produk untuk operator ini belum tersedia.
          </div>
        )}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-slate-100 px-6 py-3 pb-6 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-6 h-6 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Home</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl bg-[#EEF2FF]">
            <div className="w-6 h-6 text-[#4F46E5]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                <path d="M3 6h18"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-[#4F46E5]">Produk</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-6 h-6 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Riwayat</span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-slate-50 transition-colors">
            <div className="w-6 h-6 text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Akun</span>
          </button>
        </div>
      </div>

      {/* MODAL KONFIRMASI */}
      {selected && !successTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => !loading && setSelected(null)} className="absolute right-4 top-4 text-slate-400 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5" /></button>
            <p className="text-xs font-bold text-[#4F46E5] mb-1 uppercase">{selected.brand}</p>
            <h3 className="font-bold text-lg mb-1 text-slate-800">{selected.product_name}</h3>
            <p className="text-[#4F46E5] font-bold text-xl mb-4">{formatIDR(selected.sell_price)}</p>
            <p className="text-sm font-semibold text-slate-600 mb-6">Tujuan: {phone || 'Belum diisi'}</p>
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                <div className="flex items-start gap-2 text-red-600 font-bold text-sm mb-2">
                  <AlertCircle className="w-5 h-5 shrink-0" /> 
                  <span className="leading-tight">{errorMsg}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => window.location.href = '/deposit'} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold shadow-sm">Top Up Saldo</button>
                  <button className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-sm"><Share2 className="w-3 h-3" /> Minta Teman</button>
                </div>
              </div>
            )}
            
            <button onClick={handleBuy} disabled={loading || !phone} className="w-full py-3.5 bg-gradient-to-r from-[#4F46E5] via-[#7C3AED] to-[#6366F1] text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(79,70,229,0.35)]">
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</> : 'Konfirmasi & Bayar'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES */}
      {successTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 text-center shadow-2xl">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-800 mb-2">Transaksi Berhasil!</h3>
            <p className="text-slate-500 text-sm mb-6">SN: {successTx.serial_number}</p>
            <button onClick={() => { setSuccessTx(null); setSelected(null); }} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
