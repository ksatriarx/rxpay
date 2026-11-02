import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/app/product-grid';
import PulsaGrid from '@/components/app/pulsa-grid';

export default async function ProdukPage({ searchParams }: { searchParams: { kategori?: string } }) {
  const supabase = await createClient();
  const kategori = searchParams.kategori || 'Semua';
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sell_price', { ascending: true });

  // Perbaikan nama kategori agar sinkron dengan Digiflazz
  if (kategori !== 'Semua') {
    if (kategori === 'Game') query = query.eq('category', 'Games');
    else if (kategori === 'E-Wallet') query = query.eq('category', 'E-Money');
    else if (kategori === 'Token Listrik') query = query.eq('category', 'PLN');
    else if (kategori === 'Paket Data') query = query.eq('category', 'Data');
    else query = query.ilike('category', `%${kategori}%`);
  }

  const { data: products } = await query;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          {kategori === 'Semua' ? 'Katalog Produk' : kategori}
        </h1>
        <p className="text-slate-500 text-sm">Pilih produk yang kamu butuhkan.</p>
      </div>
      
      {/* TAMPILAN KHUSUS PULSA & DATA */}
      {(kategori === 'Pulsa' || kategori === 'Paket Data') ? (
        <PulsaGrid products={products || []} />
      ) : (
        /* TAMPILAN GRID MINIMALIS UNTUK LAINNYA */
        <ProductGrid products={products || []} />
      )}
    </div>
  );
}
