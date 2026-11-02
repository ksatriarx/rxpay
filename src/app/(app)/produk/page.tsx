import { createClient } from '@/lib/supabase/server';
import ProductGrid from '@/components/app/product-grid';

export default async function ProdukPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('sell_price', { ascending: true });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Katalog Produk</h1>
        <p className="text-slate-500 text-sm">Pilih produk digital yang kamu butuhkan.</p>
      </div>
      
      {/* Kirim data ke komponen interaktif */}
      <ProductGrid products={products || []} />
    </div>
  );
}
