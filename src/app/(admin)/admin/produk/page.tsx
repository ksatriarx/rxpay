'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatIDR } from '@/lib/utils';
import { Loader2, RefreshCw, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminProdukPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle'|'success'|'error'>('idle');
  const [syncCount, setSyncCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  // State untuk form Tambah Produk Manual
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    buyer_sku_code: '', product_name: '', category: 'Pulsa', brand: '', type: 'Umum', base_price: 0, sell_price: 0, reseller_price: 0
  });

  const supabase = createClient();

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    setProducts(data || []);
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleUpdatePrice = async (id: number, newPrice: string) => {
    const price = parseInt(newPrice);
    if (isNaN(price) || price <= 0) return toast.error('Harga tidak valid');
    
    setLoadingId(id);
    const { error } = await supabase.from('products').update({ sell_price: price }).eq('id', id);
    setLoadingId(null);

    if (error) toast.error(`Gagal: ${error.message}`);
    else {
      toast.success('Harga berhasil diupdate!');
      fetchProducts();
    }
  };

  const syncProducts = async () => {
    setSyncing(true);
    setSyncStatus('idle');
    setErrorMessage('');
    try {
      const res = await fetch('/api/digiflazz/pricelist');
      const data = await res.json();
      if (data.success) {
        setSyncStatus('success');
        setSyncCount(data.count);
        toast.success(`Berhasil sinkron ${data.count} produk`);
        fetchProducts();
      } else {
        setSyncStatus('error');
        setErrorMessage(data.error || 'Unknown Error');
        toast.error('Gagal Sinkronisasi');
      }
    } catch (e: any) {
      setSyncStatus('error');
      setErrorMessage(e.message);
      toast.error('Sistem Error');
    }
    setSyncing(false);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.buyer_sku_code || !newProduct.product_name) return toast.error('SKU dan Nama Produk wajib diisi');
    
    setLoadingId(-1); 
    
    const { error } = await supabase.from('products').insert({
      buyer_sku_code: newProduct.buyer_sku_code.toUpperCase(),
      product_name: newProduct.product_name,
      category: newProduct.category,
      brand: newProduct.brand.toUpperCase(),
      type: newProduct.type,
      base_price: Number(newProduct.base_price),
      sell_price: Number(newProduct.sell_price),
      reseller_price: Number(newProduct.reseller_price),
      is_active: true
    });

    setLoadingId(null);

    if (error) {
      toast.error(`Gagal menambah: ${error.message}`);
    } else {
      toast.success('Produk baru berhasil ditambahkan!');
      setIsAddModalOpen(false);
      setNewProduct({ buyer_sku_code: '', product_name: '', category: 'Pulsa', brand: '', type: 'Umum', base_price: 0, sell_price: 0, reseller_price: 0 });
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Kelola Produk</h1>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:bg-slate-900"
          >
            <Plus className="w-4 h-4" /> Tambah Produk
          </button>
          
          <button 
            onClick={syncProducts} 
            disabled={syncing}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold shadow-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Sinkron...' : 'Sinkron Digiflazz'}
          </button>
        </div>
      </div>

      {syncStatus === 'success' && (
        <div className="flex items-center gap-2 text-green-700 bg-green-50 p-4 rounded-xl border border-green-200">
          <CheckCircle2 className="w-5 h-5" />
          <span>Berhasil! {syncCount} produk dari Digiflazz telah disinkronkan.</span>
        </div>
      )}
      {syncStatus === 'error' && (
        <div className="flex flex-col gap-2 text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 font-bold"><AlertCircle className="w-5 h-5" /><span>Gagal Sinkronisasi</span></div>
          <p className="text-sm font-mono">{errorMessage}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="p-4">SKU / Produk</th>
                <th className="p-4">Kategori</th>
                <th className="p-4">Harga Modal</th>
                <th className="p-4">Harga Jual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <p className="text-xs text-slate-400 font-mono mb-1">{p.buyer_sku_code}</p>
                    <p className="font-semibold text-slate-800">{p.product_name}</p>
                    <p className="text-xs text-brand font-normal">{p.brand}</p>
                  </td>
                  <td className="p-4 text-slate-600">{p.category}</td>
                  <td className="p-4 text-slate-500">{formatIDR(p.base_price)}</td>
                  <td className="p-4">
                    <input 
                      type="number" 
                      defaultValue={p.sell_price}
                      onBlur={(e) => handleUpdatePrice(p.id, e.target.value)}
                      className="w-24 px-2 py-1 border border-slate-200 rounded-lg focus:border-brand outline-none font-bold"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 relative shadow-2xl max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute right-4 top-4 text-slate-400 p-2 hover:bg-slate-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 mb-4">Tambah Produk Baru</h2>
            
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600">Kode SKU (Unik)</label>
                <input required type="text" value={newProduct.buyer_sku_code} onChange={(e) => setNewProduct({...newProduct, buyer_sku_code: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1 font-mono uppercase" placeholder="Misal: TSEL100" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600">Nama Produk</label>
                <input required type="text" value={newProduct.product_name} onChange={(e) => setNewProduct({...newProduct, product_name: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1" placeholder="Misal: Telkomsel 100.000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-600">Kategori</label>
                  <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1">
                    <option value="Pulsa">Pulsa</option>
                    <option value="Data">Paket Data</option>
                    <option value="PLN">Token PLN</option>
                    <option value="Games">Voucher Game</option>
                    <option value="E-Money">E-Wallet</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">Brand/Operator</label>
                  <input required type="text" value={newProduct.brand} onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})} className="w-full px-3 py-2 border rounded-lg mt-1 uppercase" placeholder="TELKOMSEL" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-600">H. Modal</label>
                  <input required type="number" value={newProduct.base_price} onChange={(e) => setNewProduct({...newProduct, base_price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">H. Jual</label>
                  <input required type="number" value={newProduct.sell_price} onChange={(e) => setNewProduct({...newProduct, sell_price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg mt-1" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600">H. Reseller</label>
                  <input required type="number" value={newProduct.reseller_price} onChange={(e) => setNewProduct({...newProduct, reseller_price: Number(e.target.value)})} className="w-full px-3 py-2 border rounded-lg mt-1" />
                </div>
              </div>
              <button type="submit" disabled={loadingId === -1} className="w-full py-3 bg-brand text-white font-bold rounded-xl mt-4 flex justify-center items-center">
                {loadingId === -1 ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Simpan Produk'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
