import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get('X-Hub-Signature');
  const secret = process.env.DIGIFLAZZ_WEBHOOK_SECRET;

  // 1. Verifikasi Signature (Keamanan)
  if (secret) {
    const expected = 'sha1=' + crypto.createHmac('sha1', secret).update(rawBody).digest('hex');
    if (signature !== expected) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
  }

  const payload = JSON.parse(rawBody);
  const data = payload.data;

  if (!data || !data.ref_id) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const adminSupabase = createAdminClient();

  // 2. Cari transaksi berdasarkan ref_id
  const { data: tx } = await adminSupabase.from('transactions').select('*').eq('ref_id', data.ref_id).single();
  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });

  // 3. Update status jika berubah
  if (tx.status !== 'success' && tx.status !== 'failed') {
    let finalStatus = 'pending';
    if (data.status === 'Sukses') finalStatus = 'success';
    if (data.status === 'Gagal') finalStatus = 'failed';

    await adminSupabase.from('transactions').update({
      status: finalStatus,
      serial_number: data.sn || tx.serial_number,
      supplier_message: data.message,
    }).eq('id', tx.id);

    // Jika dari pending berubah jadi gagal, kembalikan saldo
    if (finalStatus === 'failed') {
      const { data: profile } = await adminSupabase.from('profiles').select('balance').eq('id', tx.user_id).single();
      const newBalance = (profile?.balance || 0) + tx.amount;

      await adminSupabase.from('profiles').update({ balance: newBalance }).eq('id', tx.user_id);
      await adminSupabase.from('balance_ledger').insert({
        user_id: tx.user_id,
        transaction_id: tx.id,
        type: 'refund',
        amount: tx.amount,
        balance_after: newBalance,
        description: `Refund otomatis via Webhook: ${data.message}`
      });
    }
  }

  return NextResponse.json({ success: true });
}
