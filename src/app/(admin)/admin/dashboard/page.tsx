import { createClient } from '@/lib/supabase/server';
import { formatIDR } from '@/lib/utils';
import { Users, ReceiptText, TrendingUp } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Ambil data statistik
  const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { data: transactions } = await supabase.from('transactions').select('amount, profit');

  const totalTx = transactions?.length || 0;
  const totalProfit = transactions?.reduce((acc, curr) => acc + Number(curr.profit), 0) || 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Ringkasan Bisnis</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-brand rounded-xl flex items-center justify-center"><Users className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-slate-500">Total Pengguna</p>
            <p className="text-2xl font-bold text-slate-800">{userCount || 0}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center"><ReceiptText className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-slate-500">Total Transaksi</p>
            <p className="text-2xl font-bold text-slate-800">{totalTx}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center"><TrendingUp className="w-6 h-6" /></div>
          <div>
            <p className="text-sm text-slate-500">Total Keuntungan</p>
            <p className="text-2xl font-bold text-green-600">{formatIDR(totalProfit)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
