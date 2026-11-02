import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient, createAdminClient } from '@/lib/supabase/server';
import fetch from 'node-fetch';
import { HttpsProxyAgent } from 'https-proxy-agent';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sesi login habis. Silakan login ulang.' }, { status: 401 });

    const { productId, customerNo } = await req.json();
    const adminSupabase = createAdminClient();
    const username = process.env.DIGIFLAZZ_USERNAME;
    const apiKey = process.env.DIGIFLAZZ_API_KEY;
    let fixieUrl = process.env.FIXIE_URL;

    if (!username || !apiKey || !fixieUrl) {
      return NextResponse.json({ error: 'Konfigurasi server belum lengkap.' }, { status: 500 });
    }

    if (!fixieUrl.startsWith('http://') && !fixieUrl.startsWith('https://')) {
      fixieUrl = `http://${fixieUrl}`;
    }
    const agent = new HttpsProxyAgent(fixieUrl);

    const { data: product } = await adminSupabase.from('products').select('*').eq('id', productId).single();
    const { data: profile } = await adminSupabase.from('profiles').select('*').eq('id', user.id).single();

    if (!product) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 });
    if (!profile) return NextResponse.json({ error: 'Data profil tidak ditemukan.' }, { status: 404 });

    if (Number(profile.balance) < Number(product.sell_price)) {
      return NextResponse.json({ error: `Saldo Anda tidak mencukupi. (Sisa: Rp ${profile.balance})` }, { status: 400 });
    }

    const refId = `RXPAY-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    const newBalance = Number(profile.balance) - Number(product.sell_price);
    await adminSupabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

    const { data: tx, error: txError } = await adminSupabase.from('transactions').insert({
      user_id: user.id, product_id: product.id, ref_id: refId, customer_no: customerNo, product_name: product.product_name,
      amount: product.sell_price, cost: product.base_price, profit: product.sell_price - product.base_price, status: 'pending',
    }).select().single();

    if (txError) throw new Error(`Database Error: ${txError.message}`);

    await adminSupabase.from('balance_ledger').insert({
      user_id: user.id, transaction_id: tx.id, type: 'purchase', amount: -product.sell_price, balance_after: newBalance, description: `Pembelian ${product.product_name}`
    });

    const sign = crypto.createHash('md5').update(`${username}${apiKey}${refId}`).digest('hex');
    
    let res, rawText, data;
    try {
      res = await fetch('https://api.digiflazz.com/v1/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, buyer_sku_code: product.buyer_sku_code, customer_no: customerNo, ref_id: refId, sign, testing: false }),
        agent: agent as any,
      });
      rawText = await res.text();
      data = JSON.parse(rawText);
    } catch (e: any) {
      await adminSupabase.from('profiles').update({ balance: profile.balance }).eq('id', user.id);
      await adminSupabase.from('transactions').update({ status: 'failed' }).eq('id', tx.id);
      return NextResponse.json({ error: `Proxy Digiflazz Error: ${e.message}` }, { status: 500 });
    }

    const result = data.data;
    if (!result) {
      await adminSupabase.from('profiles').update({ balance: profile.balance }).eq('id', user.id);
      await adminSupabase.from('transactions').update({ status: 'failed' }).eq('id', tx.id);
      return NextResponse.json({ error: `Ditolak Digiflazz: ${JSON.stringify(data)}` }, { status: 500 });
    }

    let finalStatus = 'pending';
    if (result.status === 'Sukses') finalStatus = 'success';
    if (result.status === 'Gagal') finalStatus = 'failed';

    await adminSupabase.from('transactions').update({
      status: finalStatus, serial_number: result.sn || null, supplier_message: result.message, supplier_ref: result.ref_id
    }).eq('id', tx.id);

    if (finalStatus === 'failed') {
      await adminSupabase.from('profiles').update({ balance: profile.balance }).eq('id', user.id);
      await adminSupabase.from('balance_ledger').insert({
        user_id: user.id, transaction_id: tx.id, type: 'refund', amount: product.sell_price, balance_after: profile.balance, description: `Refund: ${result.message}`
      });
      return NextResponse.json({ error: `Transaksi Gagal: ${result.message}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, tx: { ...tx, status: finalStatus, serial_number: result.sn } });

  } catch (error: any) {
    return NextResponse.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
