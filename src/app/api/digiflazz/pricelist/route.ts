import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { revalidateTag } from 'next/cache'; // Import fungsi revalidate

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;
    const fixieUrl = process.env.FIXIE_URL;

    if (!username || !apiKey || !fixieUrl) {
      return NextResponse.json({ success: false, error: 'Konfigurasi .env tidak lengkap' }, { status: 500 });
    }

    let cleanProxy = fixieUrl.trim().replace(/^https?:\/\//i, '');
    let finalProxyUrl = `http://${cleanProxy}`;
    const agent = new HttpsProxyAgent(finalProxyUrl);

    const sign = crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');

    const res = await fetch('https://api.digiflazz.com/v1/price-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'prepaid', username, sign }),
      agent: agent as any,
    });

    const rawText = await res.text();
    let data: any;
    
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return NextResponse.json({ success: false, error: `Proxy Error (HTTP ${res.status}): ${rawText.substring(0, 100)}` }, { status: 500 });
    }

    if (!data.data || !Array.isArray(data.data)) {
      return NextResponse.json({ success: false, error: `Ditolak Digiflazz: ${JSON.stringify(data)}` }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: existingProducts } = await supabase.from('products').select('buyer_sku_code');
    const existingCodes = new Set(existingProducts?.map(p => p.buyer_sku_code));

    const toUpdate = [];
    const toInsert = [];

    for (const p of data.data) {
      if (!p.buyer_product_status || !p.seller_product_status) continue;

      let mappedCategory = p.category;
      if (p.category === 'Games') mappedCategory = 'Game';
      if (p.category === 'E-Money') mappedCategory = 'E-Wallet';
      if (p.category === 'PLN') mappedCategory = 'Token Listrik';
      if (p.category === 'Data') mappedCategory = 'Paket Data';

      const basePrice = p.price;

      if (existingCodes.has(p.buyer_sku_code)) {
        toUpdate.push({
          buyer_sku_code: p.buyer_sku_code,
          product_name: p.product_name,
          category: mappedCategory,
          brand: p.brand,
          type: p.type,
          base_price: basePrice,
          seller_name: p.seller_name,
          is_active: true
        });
      } else {
        toInsert.push({
          buyer_sku_code: p.buyer_sku_code,
          product_name: p.product_name,
          category: mappedCategory,
          brand: p.brand,
          type: p.type,
          base_price: basePrice,
          sell_price: basePrice + 1500,
          reseller_price: basePrice + 500,
          is_active: true,
          seller_name: p.seller_name,
        });
      }
    }

    const chunkSize = 500;
    
    for (let i = 0; i < toUpdate.length; i += chunkSize) {
      await supabase.from('products').upsert(toUpdate.slice(i, i + chunkSize), { onConflict: 'buyer_sku_code' });
    }

    for (let i = 0; i < toInsert.length; i += chunkSize) {
      await supabase.from('products').insert(toInsert.slice(i, i + chunkSize));
    }

    // MAGIC: Hapus cache lama agar user langsung melihat produk terbaru!
    revalidateTag('products');

    return NextResponse.json({ success: true, count: toUpdate.length + toInsert.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: `Sistem Error: ${error.message}` }, { status: 500 });
  }
}
