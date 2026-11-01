import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount } = await req.json();
  const adminSupabase = createAdminClient();

  if (amount < 10000) {
    return NextResponse.json({ error: 'Minimal deposit Rp 10.000' }, { status: 400 });
  }

  // 1. Ambil saldo user saat ini
  const { data: profile } = await adminSupabase.from('profiles').select('balance').eq('id', user.id).single();
  const newBalance = (profile?.balance || 0) + amount;

  // 2. Update Saldo
  await adminSupabase.from('profiles').update({ balance: newBalance }).eq('id', user.id);

  // 3. Catat di Riwayat Deposit
  const externalId = `DEP-${Date.now()}`;
  await adminSupabase.from('deposits').insert({
    user_id: user.id,
    external_id: externalId,
    amount: amount,
    method: 'Simulasi QRIS',
    status: 'paid',
    paid_at: new Date().toISOString()
  });

  // 4. Catat Mutasi Saldo (Ledger)
  await adminSupabase.from('balance_ledger').insert({
    user_id: user.id,
    type: 'deposit',
    amount: amount,
    balance_after: newBalance,
    description: 'Deposit Saldo (Simulasi)'
  });

  return NextResponse.json({ success: true, message: 'Deposit Berhasil' });
}
