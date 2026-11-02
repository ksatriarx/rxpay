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
    let fixieUrl = process.env.FIXIE_URL;

    // DETEKTOR: Beritahu mana yang kosong
    if (!username || !apiKey || !fixieUrl) {
      return NextResponse.json({ 
        success: false, 
        error: `Cek Vercel! Username: ${username ? 'OK' : 'KOSONG'}, API Key: ${apiKey ? 'OK' : 'KOSONG'}, Fixie URL: ${fixieUrl ? 'OK' : 'KOSONG'}` 
      }, { status: 500 });
    }

    if (!fixieUrl.startsWith('http://') && !fixieUrl.startsWith('https://')) {
      fixieUrl = `http://${fixieUrl}`;
    }
    
    const agent = new HttpsProxyAgent(fixieUrl);
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
      return NextResponse.json({ 
        success: false, 
        error: `Proxy Error (HTTP ${res.status}). Pesan asli: ${rawText.substring(0, 100)}` 
      }, { status: 500 });
    }

    if (!data.data) {
      return NextResponse.json({ success: false, error: `Ditolak Digiflazz: ${JSON.stringify(data)}` }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: existingProducts } = await supabase.from('products').select('buyer_sku_code');
    const existingCodes = new Set(existingProducts?.map(p => p.buyer_sku_code));

    let count = 0;
    for (const p of data.data) {
      if (!p.buyer_product_status || !p.seller_product_status) continue;
      
      const basePrice = p.price;
      
      if (existingCodes.has(p.buyer_sku_code)) {
        await supabase.from('products').update({
          product_name: p.product_name, category: p.category, brand: p.brand, type: p.type,
          base_price: basePrice, seller_name: p.seller_name, is_active: true
        }).eq('buyer_sku_code', p.buyer_sku_code);
      } else {
        await supabase.from('products').insert({
          buyer_sku_code: p.buyer_sku_code, product_name: p.product_name, category: p.category, brand: p.brand, type: p.type,
          base_price: basePrice, sell_price: basePrice + 1500, reseller_price: basePrice + 500, is_active: true, seller_name: p.seller_name,
        });
      }
      count++;
    }

    return NextResponse.json({ success: true, count });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: `Sistem Error: ${error.message}` }, { status: 500 });
  }
}
