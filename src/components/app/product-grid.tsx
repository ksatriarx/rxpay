'use client';
import { useState } from 'react';
import { formatIDR } from '@/lib/utils';
import { X } from 'lucide-react';

export default function ProductGrid({ products }: { products: any[] }) {
  const [selected, setSelected] = useState<any>(null);
  const [customerNo, setCustomerNo] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<any>(null);

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

  // Jika tidak ada produk
  if (!products || products.length === 0) {
    return <div className="text-slate-500 text-center py-10">Belum ada produk.</div>;
  }

  return (
    <>
      {/* Daftar Produk */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {products.map((p) => (
          <div 
            key={p.id} 
            onClick={() => {
              alert(`Tombol Berfungsi! Anda memilih: ${p.product_name}`);
              setSelected(p);
            }} 
            className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-blue-500"
          >
            <p className="text-xs font-bold text-blue-600 mb-1">{p.category}</p>
            <p className="font-bold text-slate-800 text-sm mb-2">{p.product_name}</p>
            <p className="font-extrabold text-slate-900">{formatIDR(p.sell_price)}</p>
          </div>
        ))}
      </div>

      {/* MODAL PEMBELIAN (Menggunakan gaya inline agar pasti muncul) */}
      {selected && !successTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', position: 'relative' }}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', right: '16px', top: '16px', border: 'none', background: 'none' }}>
              <X className="w-6 h-6 text-slate-500" />
            </button>
            <h3 className="font-bold text-lg mb-1">{selected.product_name}</h3>
            <p className="text-blue-600 font-bold mb-4">{formatIDR(selected.sell_price)}</p>
            
            <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Tujuan / ID</label>
            <input 
              type="text" 
              value={customerNo} 
              onChange={(e) => setCustomerNo(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-blue-500 outline-none mb-4 text-lg"
              placeholder="Contoh: 08123456789" 
            />
            
            <button onClick={handleBuy} disabled={loading} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">
              {loading ? 'Memproses...' : 'Beli Sekarang'}
            </button>
          </div>
        </div>
      )}

      {/* MODAL SUKSES */}
      {successTx && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h3 className="font-bold text-lg text-green-600 mb-2">Transaksi Berhasil!</h3>
            <p className="text-slate-600 mb-4">SN: {successTx.serial_number}</p>
            <button onClick={() => { setSuccessTx(null); setSelected(null); }} className="w-full py-3 bg-slate-200 text-slate-800 font-bold rounded-xl">
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
