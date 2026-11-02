import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import fetch from 'node-fetch';
import { HttpProxyAgent } from 'hpagent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;
    
    // JURUS PAKSA: Bersihkan spasi, hapus https/http, lalu paksa jadi http://
    let rawProxy = (process.env.FIXIE_URL || '').trim();
    let cleanProxy = rawProxy.replace(/^https?:\/\//i, ''); 
    let finalProxyUrl = `http://${cleanProxy}`;
    
    if (!username || !apiKey) {
      return NextResponse.json({ success: false, error: 'Username/API Key Digiflazz kosong' }, { status: 500 });
    }

    const sign = crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');
    
    // Gunakan URL yang sudah dijamin http://
    const agent = new HttpProxyAgent({ proxy: finalProxyUrl });

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
    // Jika masih error, tampilkan URL yang dipakai agar kita tahu
    return NextResponse.json({ 
      success: false, 
      error: `Gagal Koneksi Proxy. URL yang dipakai: [${process.env.FIXIE_URL}] -> Diubah jadi: [http://${(process.env.FIXIE_URL || '').replace(/^https?:\/\//i, '')}]. Error asli: ${error.message}` 
    }, { status: 500 });
  }
}
