'use client';
import { useState } from 'react';
import { formatIDR } from '@/lib/utils';
import { X, Search, CheckCircle2 } from 'lucide-react';

export default function ProductGrid({ products }: { products: any[] }) {
  const [selected, setSelected] = useState<any>(null);
  const [customerNo, setCustomerNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter pencarian teks
  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBuy = async () => {
    if (!customerNo) return alert('Masukkan nomor tujuan / ID');
    setLoading(true);
    
    const res = await fetch('/api/transactions', {
      method: 'POST',
      body: JSON.stringify({ productId: selected.id, customerNo })
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSuccessTx(data.tx);
      setCustomerNo('');
    } else {
      alert(data.error || 'Gagal memproses transaksi');
    }
  };

  return (
    <>
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari produk atau operator..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-brand outline-none shadow-sm text-sm"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredProducts.map((p) => (
          <div 
            key={p.id} 
            onClick={() => setSelected(p)} 
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-brand transition-all cursor-pointer active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-brand mb-1 uppercase tracking-wider">{p.brand}</p>
              <p className="font-bold text-slate-800 text-sm mb-2 leading-tight">{p.product_name}</p>
            </div>
            <p className="font-extrabold text-slate-900 mt-2">{formatIDR(p.sell_price)}</p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100">
          Produk tidak ditemukan untuk kategori ini.
        </div>
      )}

      {/* Modal Pembelian */}
      {selected && !successTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl">
            <button onClick={() => setSelected(null)} className="absolute right-4 top-4 text-slate-400 p-2 bg-slate-100 rounded-full hover:bg-slate-200">
              <X className="w-5 h-5" />
            </button>
            <p className="text-xs font-bold text-brand mb-1 uppercase">{selected.brand}</p>
            <h3 className="font-bold text-lg mb-1">{selected.product_name}</h3>
            <p className="text-brand font-bold text-xl mb-6">{formatIDR(selected.sell_price)}</p>
            
            <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Tujuan / ID Game</label>
            <input 
              type="text" 
              value={customerNo} 
              onChange={(e) => setCustomerNo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand focus:ring-2 focus:ring-brand/20 outline-none mb-6 text-lg font-semibold"
              placeholder="Contoh: 08123456789" 
            />
            
            <button onClick={handleBuy} disabled={loading} className="w-full py-3.5 bg-brand-gradient text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-brand/30">
              {loading ? 'Memproses...' : 'Konfirmasi Pembelian'}
            </button>
          </div>
        </div>
      )}

      {/* Modal Sukses */}
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
    </>
  );
}
