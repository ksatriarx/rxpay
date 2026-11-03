import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: adminProfile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (adminProfile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { depositId, action } = await req.json();
  const adminSupabase = createAdminClient();

  const { data: deposit } = await adminSupabase.from('deposits').select('*').eq('id', depositId).single();
  if (!deposit || deposit.status !== 'pending') return NextResponse.json({ error: 'Deposit tidak valid' }, { status: 400 });

  if (action === 'approve') {
    // 1. Update status deposit
    await adminSupabase.from('deposits').update({ status: 'paid', paid_at: new Date().toISOString() }).eq('id', depositId);
    
    // 2. Tambah saldo user
    const { data: profile } = await adminSupabase.from('profiles').select('balance').eq('id', deposit.user_id).single();
    const newBalance = Number(profile?.balance || 0) + Number(deposit.amount);
    await adminSupabase.from('profiles').update({ balance: newBalance }).eq('id', deposit.user_id);

    // 3. Catat Ledger
    await adminSupabase.from('balance_ledger').insert({
      user_id: deposit.user_id,
      transaction_id: null,
      type: 'deposit',
      amount: deposit.amount,
      balance_after: newBalance,
      description: `Deposit Manual Disetujui`
    });
  } else {
    await adminSupabase.from('deposits').update({ status: 'failed' }).eq('id', depositId);
  }

  return NextResponse.json({ success: true });
}
