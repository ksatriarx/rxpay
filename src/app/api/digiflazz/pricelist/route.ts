import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;
  
  if (!username || !apiKey) {
    return NextResponse.json({ error: 'Kredensial Digiflazz belum diisi di .env.local' }, { status: 500 });
  }

  // Formula signature price list: md5(username + apiKey + "pricelist")
  const sign = crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');
  
  try {
    const res = await fetch('https://api.digiflazz.com/v1/price-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'prepaid', username, sign }),
    });
    const data = await res.json();
    
    if (!data.data) return NextResponse.json({ error: 'Respons Digiflazz tidak valid' }, { status: 500 });

    const supabase = await createClient();
    let count = 0;

    for (const p of data.data) {
      // Hanya simpan produk yang statusnya aktif
      if (!p.buyer_product_status || !p.seller_product_status) continue;

      const basePrice = p.price;
      const sellPrice = basePrice + 1500; // Margin default Rp 1.500

      const { error } = await supabase.from('products').upsert({
        buyer_sku_code: p.buyer_sku_code,
        product_name: p.product_name,
        category: p.category,
        brand: p.brand,
        type: p.type,
        base_price: basePrice,
        sell_price: sellPrice,
        reseller_price: basePrice + 500,
        is_active: true,
        seller_name: p.seller_name,
      }, { onConflict: 'buyer_sku_code' });

      if (!error) count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal sinkronisasi' }, { status: 500 });
  }
}
