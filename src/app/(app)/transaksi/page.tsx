import { createClient } from '@/lib/supabase/server';
import { formatIDR, formatDate } from '@/lib/utils';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default async function TransaksiPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: transactions } = await supabase.from('transactions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Riwayat Transaksi</h1>
      
      <div className="space-y-3">
        {transactions?.map((tx) => (
          <Link href={`/transaksi/${tx.id}`} key={tx.id} className="block bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-brand transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{tx.product_name}</p>
                  <p className="text-xs text-slate-500">{tx.customer_no}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(tx.created_at)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="font-extrabold text-slate-900 text-sm">-{formatIDR(tx.amount)}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase">
                    {tx.status}
                  </span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          </Link>
        ))}
        {(!transactions || transactions.length === 0) && (
          <div className="text-center py-10 text-slate-500">Belum ada transaksi.</div>
        )}
      </div>
    </div>
  );
}
