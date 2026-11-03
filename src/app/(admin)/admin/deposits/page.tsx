'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatIDR, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<any[]>([]);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const supabase = createClient();

  const fetchDeposits = async () => {
    const { data } = await supabase
      .from('deposits')
      .select('*, profiles(full_name, phone)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });
    setDeposits(data || []);
  };

  useEffect(() => { fetchDeposits(); }, []);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setLoadingId(id);
    const res = await fetch('/api/admin/deposit-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ depositId: id, action })
    });
    
    const data = await res.json();
    setLoadingId(null);

    if (data.success) {
      toast.success(`Deposit berhasil di-${action === 'approve' ? 'setujui' : 'tolak'}!`);
      fetchDeposits();
    } else {
      toast.error(data.error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Validasi Deposit Manual</h1>
      
      {deposits.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-slate-100 text-center text-slate-500">
          Tidak ada antrean deposit saat ini.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deposits.map((d) => (
            <div key={d.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4">
              {/* Foto Bukti Transfer */}
              <a href={d.receipt_url} target="_blank" rel="noreferrer" className="w-24 h-32 bg-slate-100 rounded-lg overflow-hidden shrink-0 relative group">
                <img src={d.receipt_url} alt="Bukti Transfer" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ExternalLink className="w-6 h-6 text-white" />
                </div>
              </a>
              
              {/* Detail & Aksi */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-bold text-slate-800 text-lg">{formatIDR(d.amount)}</p>
                  <p className="text-xs text-slate-500">{formatDate(d.created_at)}</p>
                  <p className="text-sm font-semibold text-brand mt-2">{d.profiles?.full_name}</p>
                  <p className="text-xs text-slate-500">{d.profiles?.phone}</p>
                </div>
                <div className="flex gap-2 mt-4">
                  <button 
                    onClick={() => handleAction(d.id, 'approve')}
                    disabled={loadingId === d.id}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    {loadingId === d.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Setujui
                  </button>
                  <button 
                    onClick={() => handleAction(d.id, 'reject')}
                    disabled={loadingId === d.id}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <X className="w-4 h-4" /> Tolak
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
