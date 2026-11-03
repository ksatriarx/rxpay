'use client';
import { useState } from 'react';
import { formatIDR } from '@/lib/utils';
import { X, CheckCircle2, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductGrid({ products, isReseller }: { products: any[], isReseller: boolean }) {
  const [selected, setSelected] = useState<any>(null);
  const [customerNo, setCustomerNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeBrand, setActiveBrand] = useState('Semua');

  // Ambil daftar brand unik (misal: MOBILE LEGENDS, FREE FIRE)
  const brands = ['Semua', ...Array.from(new Set(products.map(p => p.brand))).filter(Boolean)];

  // Filter berdasarkan tab brand dan pencarian
  const filteredProducts = products.filter(p => {
    const matchBrand = activeBrand === 'Semua' || p.brand === activeBrand;
    const matchSearch = p.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchBrand && matchSearch;
  });

  const getFinalPrice = (p: any) => {
    return (isReseller && p.reseller_price) ? p.reseller_price : p.sell_price;
  };

  const handleBuy = async () => {
    if (!customerNo) return toast.error('Masukkan nomor tujuan / ID');
    setLoading(true);
    
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selected.id, customerNo })
      });
      
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setSuccessTx(data.tx);
        setCustomerNo('');
        toast.success('Transaksi Berhasil!');
      } else {
        toast.error(data.error || 'Gagal memproses transaksi');
      }
    } catch (err) {
      setLoading(false);
      toast.error('Koneksi terputus.');
    }
  };

  return (
    <>
      {/* Kolom Pencarian */}
      <div className="relative mb-6">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Cari produk..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-brand outline-none shadow-sm text-sm bg-white"
        />
      </div>

      {/* Tab Filter Brand (Hanya muncul jika brand lebih dari 1) */}
      {brands.length > 2 && (
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide mb-2">
          {brands.map((brand) => (
            <button
              key={brand}
              onClick={() => setActiveBrand(brand)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${
                activeBrand === brand 
                  ? 'bg-brand text-white border-brand' 
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      )}

      {/* Grid Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {filteredProducts.map((p) => (
          <div 
            key={p.id} 
            onClick={() => setSelected(p)} 
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-brand transition-all cursor-pointer active:scale-95 flex flex-col justify-between"
          >
            <div>
              <p className="text-[10px] font-bold text-brand mb-1 uppercase tracking-wider">{p.brand}</p>
              <p className="font-bold text-slate-800 text-sm mb-2 leading-tight">{p.product_name}</p>
            </div>
            <p className="font-extrabold text-slate-900 mt-2">{formatIDR(getFinalPrice(p))}</p>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-10 text-slate-500 bg-white rounded-2xl border border-slate-100">
          Produk tidak ditemukan.
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
            <p className="text-brand font-bold text-xl mb-6">{formatIDR(getFinalPrice(selected))}</p>
            
            <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Tujuan / ID Game</label>
            <input 
              type="text" 
              value={customerNo} 
              onChange={(e) => setCustomerNo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand outline-none mb-6 text-lg font-semibold"
              placeholder="Masukkan ID / Nomor" 
            />
            
            <button onClick={handleBuy} disabled={loading} className="w-full py-3.5 bg-brand text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50">
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
