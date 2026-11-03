import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/app/product-grid';
import PulsaGrid from '@/components/app/pulsa-grid';
import Link from 'next/link';
import { Smartphone, Wifi, Zap, Gamepad2, Wallet } from 'lucide-react';

export default async function ProdukPage({ searchParams }: { searchParams: { kategori?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
  
  const kategori = searchParams.kategori || 'Semua';
  const isReseller = profile?.role === 'reseller';

  // JIKA TIDAK ADA KATEGORI YANG DIPILIH -> TAMPILKAN MENU KATEGORI
  if (kategori === 'Semua') {
    const menuKategori = [
      { name: 'Pulsa', icon: Smartphone, color: 'bg-blue-100 text-blue-600', desc: 'Semua operator' },
      { name: 'Paket Data', icon: Wifi, color: 'bg-purple-100 text-purple-600', desc: 'Internet harian & bulanan' },
      { name: 'Token Listrik', icon: Zap, color: 'bg-yellow-100 text-yellow-600', desc: 'Token PLN prabayar' },
      { name: 'Game', icon: Gamepad2, color: 'bg-red-100 text-red-600', desc: 'Voucher game favorit' },
      { name: 'E-Wallet', icon: Wallet, color: 'bg-green-100 text-green-600', desc: 'Top up dompet digital' },
    ];

    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Katalog Produk</h1>
        <p className="text-slate-500 mb-6 text-sm">Pilih kategori layanan yang ingin kamu beli.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {menuKategori.map((menu, i) => (
            <Link key={i} href={`/produk?kategori=${menu.name}`} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-brand transition-all flex flex-col items-center justify-center text-center gap-3 active:scale-95">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${menu.color}`}>
                <menu.icon className="w-7 h-7" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{menu.name}</p>
                <p className="text-[10px] text-slate-400 mt-1">{menu.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // JIKA KATEGORI DIPILIH -> AMBIL DATA PRODUK SESUAI KATEGORI
  let query = supabase.from('products').select('*').eq('is_active', true).order('sell_price', { ascending: true });

  const targetCat = 
    kategori === 'Game' ? 'Games' :
    kategori === 'E-Wallet' ? 'E-Money' :
    kategori === 'Token Listrik' ? 'PLN' :
    kategori === 'Paket Data' ? 'Data' : kategori;
    
  query = query.eq('category', targetCat);

  const { data: products } = await query;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/produk" className="text-sm font-semibold text-brand hover:underline">&larr; Kembali</Link>
      </div>
      
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">{kategori}</h1>
        {isReseller && <span className="bg-brand/10 text-brand text-xs font-bold px-2 py-1 rounded-md">Mode Reseller Aktif</span>}
      </div>
      
      {(kategori === 'Pulsa' || kategori === 'Paket Data') ? (
        <PulsaGrid products={products || []} isReseller={isReseller} />
      ) : (
        <ProductGrid products={products || []} isReseller={isReseller} />
      )}
    </div>
  );
}
