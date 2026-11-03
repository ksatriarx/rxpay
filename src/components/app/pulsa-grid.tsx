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
    return name.replace(new RegExp(brand, 'gi'), '').trim();
  };

  return (
    <div className="space-y-6">
      {/* INPUT NOMOR HP - CLEAN & MINIMALIS */}
      <div className="bg-slate-50 border border-slate-200 focus-within:border-brand focus-within:bg-white focus-within:ring-1 focus-within:ring-brand transition-all rounded-2xl p-4">
        <label className="block text-xs font-semibold text-slate-500 mb-1">Masukkan Nomor HP</label>
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-slate-400" />
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full text-xl font-bold text-slate-800 placeholder-slate-300 outline-none bg-transparent tracking-wide"
            placeholder="08123456789" 
          />
        </div>
      </div>

      {/* TAB OPERATOR - PILL SHAPE MINIMALIS */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setDetectedBrand(brand)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              detectedBrand === brand 
                ? 'bg-brand text-white border-brand' 
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* GRID PRODUK - KOTAK BERSIH */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {filteredProducts.map((p) => {
          const isSelected = selected?.id === p.id;
          return (
            <div 
              key={p.id} 
              onClick={() => { setSelected(p); setErrorMsg(''); }} 
              className={`relative bg-white p-4 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                isSelected 
                  ? 'border-2 border-brand shadow-sm' 
                  : 'border border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-800 text-lg">
                  {getNominal(p.product_name, p.brand)}
                </span>
                <Zap className={`w-3 h-3 ${isSelected ? 'text-brand fill-brand/20' : 'text-slate-300 fill-slate-100'}`} />
              </div>
              <span className="font-semibold text-brand text-sm mt-1">{formatIDR(p.sell_price)}</span>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
          Produk untuk operator ini belum tersedia.
        </div>
      )}

      {/* MODAL KONFIRMASI */}
      {selected && !successTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => !loading && setSelected(null)} className="absolute right-4 top-4 text-slate-400 p-2 hover:bg-slate-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase">{selected.brand}</p>
                <h3 className="font-bold text-slate-800">{selected.product_name}</h3>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-500">Nomor Tujuan</span>
                <span className="font-bold text-slate-800">{phone || '-'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Total Bayar</span>
                <span className="font-extrabold text-lg text-brand">{formatIDR(selected.sell_price)}</span>
              </div>
            </div>
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                <div className="flex items-start gap-2 text-red-600 font-bold text-sm mb-2">
                  <AlertCircle className="w-5 h-5 shrink-0" /> 
                  <span className="leading-tight">{errorMsg}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => window.location.href = '/deposit'} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold">Top Up Saldo</button>
                  <button className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"><Share2 className="w-3 h-3" /> Minta Teman</button>
                </div>
              </div>
            )}
            
            <button onClick={handleBuy} disabled={loading || !phone} className="w-full py-3.5 bg-brand text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors">
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
            <button onClick={() => { setSuccessTx(null); setSelected(null); }} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors">Tutup</button>
          </div>
        </div>
      )}
    </div>
  );
}
