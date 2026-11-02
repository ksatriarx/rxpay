import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import fetch from 'node-fetch';
import { HttpProxyAgent } from 'hpagent';

export const runtime = 'nodejs';

export async function GET() {
  const username = process.env.DIGIFLAZZ_USERNAME;
  const apiKey = process.env.DIGIFLAZZ_API_KEY;
  // PAKSA JADI HTTP:// (Ganti https:// jika ada)
  const proxyUrl = (process.env.FIXIE_URL || '').replace('https://', 'http://');
  
  if (!username || !apiKey || !proxyUrl) {
    return NextResponse.json({ success: false, error: 'Variabel .env tidak lengkap' }, { status: 500 });
  }

  const sign = crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');
  const agent = new HttpProxyAgent({ proxy: proxyUrl });
  
  try {
    const res = await fetch('https://api.digiflazz.com/v1/price-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'prepaid', username, sign }),
      agent: agent as any,
    });
    
    const data = await res.json() as any;
    
    if (!data.data) {
      return NextResponse.json({ success: false, error: `Ditolak Digiflazz: ${JSON.stringify(data)}` }, { status: 400 });
    }

    const supabase = await createClient();
    let count = 0;

    for (const p of data.data) {
      if (!p.buyer_product_status || !p.seller_product_status) continue;
      const basePrice = p.price;
      const sellPrice = basePrice + 1500;

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
  } catch (error: any) {
    return NextResponse.json({ success: false, error: `Gagal Koneksi Proxy: ${error.message}` }, { status: 500 });
  }
}
