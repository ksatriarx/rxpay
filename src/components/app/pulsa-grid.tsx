'use client';
import { useState, useEffect } from 'react';
import { formatIDR } from '@/lib/utils';
import { X, Smartphone, CheckCircle2, AlertCircle, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PulsaGrid({ products }: { products: any[] }) {
  const [phone, setPhone] = useState('');
  const [detectedBrand, setDetectedBrand] = useState('TELKOMSEL');
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Ambil daftar brand unik
  const brands = Array.from(new Set(products.map(p => p.brand))).filter(Boolean);

  // Logika Deteksi Operator
  useEffect(() => {
    const prefix = phone.substring(0, 4);
    if (!prefix) return;
    
    // Telkomsel
    if (['0811','0812','0813','0821','0822','0823','0851','0852','0853'].some(p => prefix.startsWith(p))) setDetectedBrand('TELKOMSEL');
    // Indosat
    else if (['0814','0815','0816','0855','0856','0857','0858'].some(p => prefix.startsWith(p))) setDetectedBrand('INDOSAT');
    // XL
    else if (['0817','0818','0819','0859','0877','0878'].some(p => prefix.startsWith(p))) setDetectedBrand('XL');
    // Axis
    else if (['0831','0832','0833','0838'].some(p => prefix.startsWith(p))) setDetectedBrand('AXIS');
    // Tri
    else if (['0895','0896','0897','0898','0899'].some(p => prefix.startsWith(p))) setDetectedBrand('TRI');
    // Smartfren
    else if (['0881','0882','0883','0884','0885','0886','0887','0888','0889'].some(p => prefix.startsWith(p))) setDetectedBrand('SMARTFREN');
  }, [phone]);

  // Filter produk berdasarkan operator yang terdeteksi
  const filteredProducts = products.filter(p => p.brand === detectedBrand);

  const handleBuy = async () => {
    if (!phone) return setErrorMsg('Masukkan nomor HP terlebih dahulu');
    setLoading(true);
    setErrorMsg('');
    
    const res = await fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ productId: selected.id, customerNo: phone })
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSuccessTx(data.tx);
      setPhone('');
    } else {
      setErrorMsg(data.error || 'Gagal memproses transaksi');
    }
  };

  return (
    <div className="space-y-6">
      {/* INPUT NOMOR HP */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <label className="block text-sm font-bold text-slate-700 mb-2">Masukkan Nomor HP</label>
        <div className="relative">
          <Smartphone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="tel" 
            value={phone}
            onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-brand outline-none text-lg font-bold text-slate-800 tracking-wider"
            placeholder="08123456789" 
          />
        </div>
        {phone.length > 3 && (
          <p className="text-xs font-semibold text-brand mt-2">
            Terdeteksi: {detectedBrand}
          </p>
        )}
      </div>

      {/* TAB OPERATOR (Bisa diklik manual jika deteksi gagal) */}
      <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
        {brands.map((brand) => (
          <button
            key={brand}
            onClick={() => setDetectedBrand(brand)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
              detectedBrand === brand 
                ? 'bg-brand text-white border-brand shadow-md' 
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {brand}
          </button>
        ))}
      </div>

      {/* GRID PRODUK (Minimalis) */}
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {filteredProducts.map((p) => (
          <div 
            key={p.id} 
            onClick={() => { setSelected(p); setErrorMsg(''); }} 
            className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm hover:border-brand transition-all cursor-pointer active:scale-95 flex flex-col items-center justify-center text-center"
          >
            <p className="font-extrabold text-slate-800 text-sm">{p.product_name.replace(detectedBrand, '').trim()}</p>
            <p className="font-bold text-brand text-xs mt-1">{formatIDR(p.sell_price)}</p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && phone.length > 3 && (
        <div className="text-center py-10 text-slate-500">Produk untuk operator ini belum tersedia.</div>
      )}

      {/* MODAL KONFIRMASI & ERROR SALDO */}
      {selected && !successTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-slate-400 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
              <X className="w-5 h-5" />
            </button>
            <p className="text-xs font-bold text-brand mb-1 uppercase">{selected.brand}</p>
            <h3 className="font-bold text-lg mb-1">{selected.product_name}</h3>
            <p className="text-brand font-bold text-xl mb-4">{formatIDR(selected.sell_price)}</p>
            <p className="text-sm font-semibold text-slate-600 mb-6">Tujuan: {phone || 'Belum diisi'}</p>
            
            {errorMsg && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-xl mb-4">
                <div className="flex items-center gap-2 text-red-600 font-bold text-sm mb-2">
                  <AlertCircle className="w-4 h-4" /> {errorMsg}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.location.href = '/deposit'} className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-bold">Top Up Saldo</button>
                  <button className="flex-1 bg-white text-red-600 border border-red-200 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1">
                    <Share2 className="w-3 h-3" /> Minta Teman
                  </button>
                </div>
              </div>
            )}
            
            <button onClick={handleBuy} disabled={loading || !phone} className="w-full py-3.5 bg-brand-gradient text-white font-bold rounded-xl disabled:opacity-50">
              {loading ? 'Memproses...' : 'Konfirmasi & Bayar'}
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
            <button onClick={() => { setSuccessTx(null); setSelected(null); }} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl">
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
