import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;
    const fixieUrl = process.env.FIXIE_URL;

    if (!username || !apiKey || !fixieUrl) {
      return NextResponse.json({ success: false, error: 'Variabel .env tidak lengkap' }, { status: 500 });
    }

    let cleanProxy = fixieUrl.trim().replace(/^https?:\/\//i, '');
    let finalProxyUrl = `http://${cleanProxy}`;
    const agent = new HttpsProxyAgent(new URL(finalProxyUrl));

    const sign = crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');

    const res = await fetch('https://api.digiflazz.com/v1/price-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'prepaid', username, sign }),
      agent: agent as any,
    });

    // BACA SEBAGAI TEKS DULU
    const rawText = await res.text();
    let data: any;

    try {
      // Coba parse langsung
      data = JSON.parse(rawText);
    } catch (parseError) {
      // Jika gagal, bersihkan karakter aneh di awal/akhir
      const cleanText = rawText.replace(/^\uFEFF/, '').replace(/^\s+/, '').replace(/\s+$/, '');
      try {
        data = JSON.parse(cleanText);
      } catch (secondError: any) {
        return NextResponse.json({ 
          success: false, 
          error: `Respons tidak valid. Isi mentah: "${rawText.substring(0, 100)}..."` 
        }, { status: 500 });
      }
    }

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
