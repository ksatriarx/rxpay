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
      return NextResponse.json({ success: false, error: 'Konfigurasi .env tidak lengkap' }, { status: 500 });
    }

    // PERBAIKAN: Parsing URL Proxy secara manual dan aman
    let formattedProxyUrl = fixieUrl.trim();
    if (!formattedProxyUrl.startsWith('http://') && !formattedProxyUrl.startsWith('https://')) {
      formattedProxyUrl = `http://${formattedProxyUrl}`;
    }
    
    // Parse URL dan encode password agar karakter '!' aman
    const parsedProxy = new URL(formattedProxyUrl);
    parsedProxy.password = encodeURIComponent(parsedProxy.password);
    const safeProxyUrl = parsedProxy.toString();

    const agent = new HttpsProxyAgent(safeProxyUrl);
    const sign = crypto.createHash('md5').update(`${username}${apiKey}pricelist`).digest('hex');

    const res = await fetch('https://api.digiflazz.com/v1/price-list', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cmd: 'prepaid', username, sign }),
      agent: agent as any,
    });

    const rawText = await res.text();
    let data: any;

    // Tampilkan error mentah jika proxy menolak
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return NextResponse.json({ 
        success: false, 
        error: `Proxy Error (HTTP ${res.status}). Cek IP Whitelist/Vercel. Pesan asli: ${rawText.substring(0, 100)}` 
      }, { status: 500 });
    }

    if (!data.data) {
      return NextResponse.json({ success: false, error: `Ditolak Digiflazz: ${JSON.stringify(data)}` }, { status: 400 });
    }

    const supabase = await createClient();
    
    // PERBAIKAN: Ambil daftar SKU yang sudah ada untuk mencegah duplikasi & menimpa harga
    const { data: existingProducts } = await supabase.from('products').select('buyer_sku_code');
    const existingCodes = new Set(existingProducts?.map(p => p.buyer_sku_code));

    let count = 0;
    for (const p of data.data) {
      if (!p.buyer_product_status || !p.seller_product_status) continue;
      
      const basePrice = p.price;
      
      if (existingCodes.has(p.buyer_sku_code)) {
        // JIKA PRODUK SUDAH ADA: Update harga modal dan info saja. JANGAN sentuh sell_price!
        await supabase.from('products').update({
          product_name: p.product_name,
          category: p.category,
          brand: p.brand,
          type: p.type,
          base_price: basePrice,
          seller_name: p.seller_name,
          is_active: true
        }).eq('buyer_sku_code', p.buyer_sku_code);
      } else {
        // JIKA PRODUK BARU: Baru kita tentukan harga jual default (margin 1500)
        const sellPrice = basePrice + 1500;
        await supabase.from('products').insert({
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
        });
      }
      count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: `Sistem Error: ${error.message}` }, { status: 500 });
  }
}
