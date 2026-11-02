import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/app/product-grid';

export default async function ProdukPage({ searchParams }: { searchParams: { kategori?: string } }) {
  const supabase = await createClient();
  const kategori = searchParams.kategori || 'Semua';
  
  let query = supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sell_price', { ascending: true });

  if (kategori !== 'Semua') {
    // Gunakan ilike agar pencarian kategori tidak case-sensitive
    query = query.ilike('category', `%${kategori}%`);
  }

  const { data: products } = await query;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-1">
            {kategori === 'Semua' ? 'Katalog Produk' : kategori}
          </h1>
          <p className="text-slate-500 text-sm">Pilih produk yang kamu butuhkan.</p>
        </div>
      </div>
      
      <ProductGrid products={products || []} />
    </div>
  );
}
