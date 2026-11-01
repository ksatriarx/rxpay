'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatIDR } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export default function AdminProdukPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const supabase = createClient();

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id');
    setProducts(data || []);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleUpdatePrice = async (id: number, newPrice: string) => {
    const price = parseInt(newPrice);
    if (isNaN(price) || price <= 0) return alert('Harga tidak valid');
    
    setLoadingId(id);
    
    // LANGSUNG SIMPAN KE SUPABASE (Bypass API)
    const { error } = await supabase
      .from('products')
      .update({ sell_price: price })
      .eq('id', id);
      
    setLoadingId(null);

    if (error) {
      alert(`❌ GAGAL: ${error.message}`);
    } else {
      alert('✅ Harga berhasil diupdate!');
      fetchProducts(); // Refresh data
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Kelola Harga Produk</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="p-4">Produk</th>
                <th className="p-4">Harga Modal</th>
                <th className="p-4">Harga Jual</th>
                <th className="p-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4 font-semibold text-slate-800">
                    {p.product_name} <br/><span className="text-xs text-brand font-normal">{p.brand}</span>
                  </td>
                  <td className="p-4 text-slate-500">{formatIDR(p.base_price)}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={p.sell_price}
                      onBlur={(e) => handleUpdatePrice(p.id, e.target.value)}
                      className="w-24 px-2 py-1 border border-slate-200 rounded-lg focus:border-brand outline-none font-bold"
                    />
                  </td>
                  <td className="p-4">
                    {loadingId === p.id ? <Loader2 className="w-4 h-4 animate-spin text-brand" /> : <span className="text-xs text-slate-400">Klik luar untuk simpan</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
