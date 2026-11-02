import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Minta Vercel beri waktu 60 detik (jika didukung)

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

    // Array untuk menampung data yang akan dimasukkan sekaligus
    const toUpdate = [];
    const toInsert = [];

    for (const p of data.data) {
      if (!p.buyer_product_status || !p.seller_product_status) continue;

      // Penerjemah Kategori agar sinkron dengan Dashboard
      let mappedCategory = p.category;
      if (p.category === 'Games') mappedCategory = 'Game';
      if (p.category === 'E-Money') mappedCategory = 'E-Wallet';
      if (p.category === 'PLN') mappedCategory = 'Token Listrik';
      if (p.category === 'Data') mappedCategory = 'Paket Data';

      const basePrice = p.price;

      if (existingCodes.has(p.buyer_sku_code)) {
        // Update harga modal, JANGAN sentuh sell_price
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
        // Insert produk baru
        toInsert.push({
          buyer_sku_code: p.buyer_sku_code,
          product_name: p.product_name,
          category: mappedCategory,
          brand: p.brand,
          type: p.type,
          base_price: basePrice,
          sell_price: basePrice + 1500, // Margin default
          reseller_price: basePrice + 500,
          is_active: true,
          seller_name: p.seller_name,
        });
      }
    }

    // Eksekusi Bulk Upsert (Proses Cepat)
    // Bagi menjadi potongan kecil (chunk) agar tidak ditolak Supabase (limit 1000 per request)
    const chunkSize = 500;
    
    // 1. Proses Update
    for (let i = 0; i < toUpdate.length; i += chunkSize) {
      const chunk = toUpdate.slice(i, i + chunkSize);
      await supabase.from('products').upsert(chunk, { onConflict: 'buyer_sku_code' });
    }

    // 2. Proses Insert
    for (let i = 0; i < toInsert.length; i += chunkSize) {
      const chunk = toInsert.slice(i, i + chunkSize);
      await supabase.from('products').insert(chunk);
    }

    return NextResponse.json({ success: true, count: toUpdate.length + toInsert.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: `Sistem Error: ${error.message}` }, { status: 500 });
  }
}
