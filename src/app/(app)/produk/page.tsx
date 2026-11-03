import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/app/product-grid';
import PulsaGrid from '@/components/app/pulsa-grid';

export default async function ProdukPage({ searchParams }: { searchParams: { kategori?: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user!.id).single();
  
  const kategori = searchParams.kategori || 'Semua';
  const isReseller = profile?.role === 'reseller';

  let query = supabase.from('products').select('*').eq('is_active', true).order('sell_price', { ascending: true });

  if (kategori !== 'Semua') {
    const targetCat = 
      kategori === 'Game' ? 'Games' :
      kategori === 'E-Wallet' ? 'E-Money' :
      kategori === 'Token Listrik' ? 'PLN' :
      kategori === 'Paket Data' ? 'Data' : kategori;
    query = query.eq('category', targetCat);
  }

  const { data: products } = await query;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          {kategori === 'Semua' ? 'Katalog Produk' : kategori}
        </h1>
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
