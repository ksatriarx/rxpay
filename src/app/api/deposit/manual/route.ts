import { NextResponse } from 'next/server';
import { createClient, createAdminClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { amount, receipt_url } = await req.json();
  if (!amount || !receipt_url) return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 });

  const adminSupabase = createAdminClient();
  const externalId = `MANUAL-${Date.now()}-${user.id.slice(0, 5)}`;

  const { error } = await adminSupabase.from('deposits').insert({
    user_id: user.id,
    external_id: externalId,
    amount: amount,
    method: 'Manual Transfer',
    status: 'pending',
    receipt_url: receipt_url,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
