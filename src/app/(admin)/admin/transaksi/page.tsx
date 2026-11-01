import { createClient } from '@/lib/supabase/server';
import { formatIDR, formatDate } from '@/lib/utils';

export default async function AdminTransaksiPage() {
  const supabase = await createClient();
  const { data: transactions } = await supabase.from('transactions').select('*').order('created_at', { ascending: false }).limit(50);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Semua Transaksi (50 Terakhir)</h1>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4">Waktu</th>
              <th className="p-4">Produk</th>
              <th className="p-4">Tujuan</th>
              <th className="p-4">Status</th>
              <th className="p-4">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions?.map((tx) => (
              <tr key={tx.id}>
                <td className="p-4 text-slate-500 whitespace-nowrap">{formatDate(tx.created_at)}</td>
                <td className="p-4 font-semibold text-slate-800">{tx.product_name}</td>
                <td className="p-4">{tx.customer_no}</td>
                <td className="p-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase">{tx.status}</span></td>
                <td className="p-4 font-bold text-green-600">+{formatIDR(tx.profit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
