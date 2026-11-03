'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Loader2, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function DepositManualPage() {
  const [amount, setAmount] = useState<number | ''>('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const nominalTersedia = [10000, 20000, 50000, 100000, 200000, 500000];

  const handleDeposit = async () => {
    if (!amount || amount < 10000) return toast.error('Minimal deposit Rp 10.000');
    if (!file) return toast.error('Harap unggah bukti transfer');
    
    setLoading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('receipts').upload(fileName, file);

      if (uploadError) throw new Error('Gagal mengunggah foto bukti transfer');

      const { data: { publicUrl } } = supabase.storage.from('receipts').getPublicUrl(fileName);

      const res = await fetch('/api/deposit/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, receipt_url: publicUrl })
      });
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Gagal membuat permintaan deposit');

      setSuccess(true);
      toast.success('Permintaan deposit dikirim!');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 3000);

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Deposit Diajukan!</h1>
        <p className="text-slate-500 mb-6">Bukti transfer kamu sedang ditinjau oleh Admin. Saldo akan bertambah setelah disetujui.</p>
        <p className="text-sm text-slate-400">Mengalihkan ke Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/deposit" className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Transfer Manual</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6">
          <p className="text-sm font-semibold text-brand mb-1">Transfer Ke Rekening:</p>
          <p className="font-bold text-slate-800 text-lg">SeaBank: 901271940452</p>
          <p className="text-sm text-slate-600">a.n. Teuku fathahillah</p>
          <p className="text-xs text-red-500 mt-2">*Pastikan nominal transfer sama persis dengan yang diinputkan.</p>
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-2">Masukkan Nominal</label>
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
          <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-brand outline-none text-xl font-bold text-slate-800" placeholder="0" />
        </div>

        <p className="text-xs text-slate-500 mb-3">Pilih Nominal Cepat:</p>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {nominalTersedia.map((nom) => (
            <button key={nom} onClick={() => setAmount(nom)}
              className={`py-2 rounded-lg text-sm font-semibold border ${amount === nom ? 'bg-brand text-white border-brand' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
              {nom / 1000}rb
            </button>
          ))}
        </div>

        <label className="block text-sm font-medium text-slate-700 mb-2">Unggah Bukti Transfer</label>
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center mb-6 relative">
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 font-medium">{file ? file.name : 'Klik untuk memilih foto struk'}</p>
        </div>

        <button onClick={handleDeposit} disabled={loading || !amount || !file} className="w-full py-4 bg-brand text-white font-bold rounded-xl shadow-lg shadow-brand/30 flex justify-center items-center gap-2 hover:bg-brand-dark transition-colors disabled:opacity-50">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Kirim Permintaan Deposit'}
        </button>
      </div>
    </div>
  );
}
