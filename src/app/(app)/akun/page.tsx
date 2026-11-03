import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Phone, Mail, Ticket, LogOut, Share2, Gift } from 'lucide-react';
import CopyButton from '@/components/app/copy-button';

export default async function AkunPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const referralLink = `https://rxpay-mrwy.vercel.app/register?ref=${profile?.referral_code}`;

  // Hitung berapa banyak downline yang berhasil diundang
  const { count: downlineCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by', user.id);

  // Hitung total komisi yang didapatkan
  const { data: commissionData } = await supabase
    .from('balance_ledger')
    .select('amount')
    .eq('user_id', user.id)
    .eq('type', 'referral_commission');
    
  const totalCommission = commissionData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profil Saya</h1>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{profile?.full_name || 'Pengguna'}</h2>
        <p className="text-slate-500 text-sm mb-4">{profile?.role === 'admin' ? 'Super Admin' : profile?.role === 'reseller' ? 'Reseller' : 'Member'}</p>
        
        {profile?.role === 'admin' && (
          <a href="/admin/dashboard" className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-semibold mb-2">
            Buka Panel Admin
          </a>
        )}
      </div>

      {/* KARTU REFERRAL */}
      <div className="bg-brand-gradient p-6 rounded-3xl shadow-lg mb-6 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
        <h3 className="font-bold mb-1 flex items-center gap-2"><Ticket className="w-5 h-5" /> Kode Referral Kamu</h3>
        <p className="text-3xl font-extrabold tracking-widest mb-4">{profile?.referral_code}</p>
        
        {/* STATISTIK REFERRAL */}
        <div className="grid grid-cols-2 gap-4 mb-4 bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
          <div>
            <p className="text-xs text-white/70">Total Downline</p>
            <p className="font-bold text-lg">{downlineCount || 0} Orang</p>
          </div>
          <div>
            <p className="text-xs text-white/70">Total Komisi</p>
            <p className="font-bold text-lg">Rp {totalCommission.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <p className="text-xs text-white/80 mb-4">Ajak teman pakai link ini. Dapatkan komisi Rp 100 dari setiap transaksi mereka!</p>
        
        <div className="flex gap-2">
          <CopyButton text={profile?.referral_code || ''} label="Salin Kode" />
          <CopyButton text={referralLink} label="Salin Link" icon={<Share2 className="w-4 h-4" />} />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <Mail className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="font-medium text-slate-800">{user.email}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4">
          <Phone className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Nomor HP</p>
            <p className="font-medium text-slate-800">{profile?.phone || '-'}</p>
          </div>
        </div>
      </div>

      <form action="/auth/logout" method="post">
        <button className="w-full bg-red-50 text-red-600 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
          <LogOut className="w-5 h-5" /> Keluar Akun
        </button>
      </form>
    </div>
  );
}
