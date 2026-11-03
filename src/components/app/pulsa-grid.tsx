'use client';
import { useState, useEffect } from 'react';
import { formatIDR } from '@/lib/utils';
import { X, Smartphone, CheckCircle2, AlertCircle, Share2, Loader2, Zap } from 'lucide-react';
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
    // Menghapus nama brand dari judul (misal "Telkomsel 10.000" jadi "10.000")
    return name.replace(new RegExp(brand, 'gi'), '').trim();
  };

  return (
    <div className="space-y-6">
      {/* KOTAK INPUT DENGAN EFEK GLOW GRADIENT */}
      <div className="relative p-[1.5px] rounded-2xl bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300 shadow-[0_0_20px_rgba(168,85,247,0.15)]">
        <div className="bg-white rounded-[14px] p-4 flex flex-col justify-center">
          <label className="block text-xs font-semibold text-slate-500 mb-1">Masukkan Nomor HP</label>
          <div className="flex items-center gap-3">
            <Smartphone className="w-6 h-6 text-slate-400" />
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
              className="w-full text-2xl font-bold text-slate-800 placeholder-slate-300 outline-none bg-transparent tracking-widest"
              placeholder="08123456789" 
            />
          </div>
        </div>
      </div>

      {/* TAB KAPSUL (PILL) */}
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setDetectedBrand(brand)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-300 border ${
              detectedBrand === brand 
                ? 'bg-brand-gradient text-white border-transparent shadow-lg shadow-brand/30 scale-105' 
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
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
              className={`relative bg-white p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-purple-400 bg-purple-50/40 shadow-md shadow-purple-200' 
                  : 'border border-slate-100 shadow-sm hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-0.5">
                <span className="font-extrabold text-slate-800 text-lg">
                  {getNominal(p.product_name, p.brand)}
                </span>
                <Zap className="w-3.5 h-3.5 text-blue-300 fill-blue-100 mt-1" />
              </div>
              <span className="font-bold text-blue-600 text-sm mt-1">{formatIDR(p.sell_price)}</span>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100">
          Produk untuk operator ini belum tersedia.
        </div>
      )}

      {/* MODAL KONFIRMASI */}
      {selected && !successTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => !loading && setSelected(null)} className="absolute right-4 top-4 text-slate-400 p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X className="w-5 h-5" /></button>
            <p className="text-xs font-bold text-brand mb-1 uppercase">{selected.brand}</p>
            <h3 className="font-bold text-lg mb-1">{selected.product_name}</h3>
            <p className="text-brand font-bold text-xl mb-4">{formatIDR(selected.sell_price)}</p>
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
            
            <button onClick={handleBuy} disabled={loading || !phone} className="w-full py-3.5 bg-brand-gradient text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
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
