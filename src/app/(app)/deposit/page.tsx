'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatIDR } from '@/lib/utils';
import { ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const nominalTersedia = [10000, 20000, 50000, 100000, 200000, 500000];

  const handleDeposit = async () => {
    if (!amount || amount < 10000) return alert('Minimal deposit Rp 10.000');
    setLoading(true);

    const res = await fetch('/api/deposit', {
      method: 'POST',
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    setLoading(false);

    if (data.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 2000);
    } else {
      alert(data.error || 'Gagal deposit');
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Top Up Berhasil!</h1>
        <p className="text-slate-500 mb-6">Saldo Anda telah ditambahkan sebesar {formatIDR(Number(amount))}</p>
        <p className="text-sm text-slate-400">Mengalihkan ke Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Top Up Saldo</h1>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <label className="block text-sm font-medium text-slate-700 mb-2">Masukkan Nominal</label>
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">Rp</span>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 focus:border-brand outline-none text-xl font-bold text-slate-800"
            placeholder="0" 
          />
        </div>

        <p className="text-xs text-slate-500 mb-3">Pilih Nominal Cepat:</p>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {nominalTersedia.map((nom) => (
            <button 
              key={nom} 
              onClick={() => setAmount(nom)}
              className={`py-2 rounded-lg text-sm font-semibold border ${amount === nom ? 'bg-brand text-white border-brand' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
            >
              {nom / 1000}rb
            </button>
          ))}
        </div>

        <button 
          onClick={handleDeposit} 
          disabled={loading || !amount}
          className="w-full py-4 bg-brand-gradient text-white font-bold rounded-xl shadow-lg shadow-brand/30 flex justify-center items-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lanjutkan Pembayaran'}
        </button>
      </div>
    </div>
  );
}
