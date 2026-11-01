import { createClient } from '@/lib/supabase/server';
import { formatIDR, formatDate } from '@/lib/utils';
import { CheckCircle2, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function StrukPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: tx } = await supabase.from('transactions').select('*').eq('id', params.id).eq('user_id', user!.id).single();
  
  if (!tx) notFound();

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/transaksi" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Detail Transaksi</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-brand-gradient p-6 text-center text-white">
          <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
          <h2 className="text-xl font-bold">Transaksi Berhasil</h2>
          <p className="text-white/80 text-sm">{formatDate(tx.created_at)}</p>
        </div>
        
        <div className="p-6 space-y-4 text-sm">
          <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
            <span className="text-slate-500">Total Pembayaran</span>
            <span className="font-extrabold text-lg text-slate-800">{formatIDR(tx.amount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Produk</span>
            <span className="font-semibold text-slate-800 text-right">{tx.product_name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Nomor Tujuan</span>
            <span className="font-semibold text-slate-800">{tx.customer_no}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Ref ID</span>
            <span className="font-mono text-xs text-slate-800">{tx.ref_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Serial Number (SN)</span>
            <span className="font-mono text-xs font-bold text-brand bg-brand/10 px-2 py-1 rounded">{tx.serial_number || '-'}</span>
          </div>
        </div>
        
        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <button className="w-full flex items-center justify-center gap-2 text-brand font-semibold">
            <Download className="w-4 h-4" /> Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
