import { createAdminClient } from '@/lib/supabase/server';
import { unstable_cache } from 'next/cache';
import ProductGrid from '@/components/app/product-grid';
import PulsaGrid from '@/components/app/pulsa-grid';

// Fungsi untuk mengambil & menyimpan data produk di Cache Vercel
// Cache akan bertahan 1 jam (3600 detik), atau sampai di-revalidate oleh Admin
const getCachedProducts = unstable_cache(
  async () => {
    // Gunakan admin client agar tidak bergantung pada cookies user (bisa di-cache global)
    const supabase = createAdminClient();
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sell_price', { ascending: true });
    return data || [];
  },
  ['all-products'], // Key unik cache
  { revalidate: 3600, tags: ['products'] } // Tag untuk auto-bust
);

export default async function ProdukPage({ searchParams }: { searchParams: { kategori?: string } }) {
  const kategori = searchParams.kategori || 'Semua';
  
  // Ambil dari Cache (Super Cepat!)
  const allProducts = await getCachedProducts();

  // Filter kategori dilakukan di memori (in-memory filtering), bukan di database
  let filteredProducts = allProducts;
  
  if (kategori !== 'Semua') {
    // Penyesuaian nama kategori (Dashboard vs Digiflazz)
    const targetCat = 
      kategori === 'Game' ? 'Games' :
      kategori === 'E-Wallet' ? 'E-Money' :
      kategori === 'Token Listrik' ? 'PLN' :
      kategori === 'Paket Data' ? 'Data' : kategori;

    filteredProducts = allProducts.filter(p => 
      p.category === targetCat || 
      p.category.toLowerCase().includes(kategori.toLowerCase())
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          {kategori === 'Semua' ? 'Katalog Produk' : kategori}
        </h1>
        <p className="text-slate-500 text-sm">Pilih produk yang kamu butuhkan.</p>
      </div>
      
      {(kategori === 'Pulsa' || kategori === 'Paket Data') ? (
        <PulsaGrid products={filteredProducts} />
      ) : (
        <ProductGrid products={filteredProducts} />
      )}
    </div>
  );
}
