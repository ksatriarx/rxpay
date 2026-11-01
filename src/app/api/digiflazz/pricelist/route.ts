import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;
  
  let products = [];

  // Jika kredensial kosong, pakai data DUMMY untuk testing
  if (!username || !apiKey) {
    products = [
      { buyer_sku_code: 'tsel10', product_name: 'Telkomsel 10.000', category: 'Pulsa', brand: 'TELKOMSEL', type: 'Umum', price: 10500, seller_name: 'Digiflazz', buyer_product_status: true, seller_product_status: true },
      { buyer_sku_code: 'tsel25', product_name: 'Telkomsel 25.000', category: 'Pulsa', brand: 'TELKOMSEL', type: 'Umum', price: 24500, seller_name: 'Digiflazz', buyer_product_status: true, seller_product_status: true },
      { buyer_sku_code: 'isat10', product_name: 'Indosat 10.000', category: 'Pulsa', brand: 'INDOSAT', type: 'Umum', price: 10200, seller_name: 'Digiflazz', buyer_product_status: true, seller_product_status: true },
      { buyer_sku_code: 'xl25', product_name: 'XL 25.000', category: 'Pulsa', brand: 'XL', type: 'Umum', price: 24000, seller_name: 'Digiflazz', buyer_product_status: true, seller_product_status: true },
      { buyer_sku_code: 'pln20', product_name: 'PLN Token 20.000', category: 'Token Listrik', brand: 'PLN', type: 'Umum', price: 20500, seller_name: 'Digiflazz', buyer_product_status: true, seller_product_status: true },
      { buyer_sku_code: 'ml100', product_name: 'Mobile Legends 100 Diamond', category: 'Voucher Game', brand: 'MOBILE LEGENDS', type: 'Umum', price: 28000, seller_name: 'Digiflazz', buyer_product_status: true, seller_product_status: true },
    ];
  } else {
    // Jika kredensial ada, tembak API Digiflazz asli
    const sign = crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');
    
    const res = await fetch('https://api.digiflazz.com/v1/price-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'prepaid', username, sign }),
    });
    const data = await res.json();
    products = data.data || [];
  }

  // Simpan ke database Supabase
  const supabase = await createClient();
  
  for (const p of products) {
    if (!p.buyer_product_status || !p.seller_product_status) continue; // Skip produk gangguan

    const basePrice = p.price;
    const sellPrice = basePrice + 1500; // Margin default Rp 1.500

    await supabase.from('products').upsert({
      buyer_sku_code: p.buyer_sku_code,
      product_name: p.product_name,
      category: p.category,
      brand: p.brand,
      type: p.type,
      base_price: basePrice,
      sell_price: sellPrice,
      reseller_price: basePrice + 500, // Margin reseller lebih murah
      is_active: true,
      seller_name: p.seller_name,
    }, { onConflict: 'buyer_sku_code' });
  }

  return NextResponse.json({ success: true, count: products.length });
}
