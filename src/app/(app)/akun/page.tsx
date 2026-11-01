import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { User, Phone, Mail, Ticket, LogOut, ChevronRight } from 'lucide-react';

export default async function AkunPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profil Saya</h1>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-6 flex flex-col items-center text-center">
        <div className="w-20 h-20 bg-brand/10 text-brand rounded-full flex items-center justify-center mb-4">
          <User className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">{profile?.full_name || 'Pengguna'}</h2>
        <p className="text-slate-500 text-sm mb-4">{profile?.role === 'admin' ? 'Super Admin' : 'Member'}</p>
        
        {profile?.role === 'admin' && (
          <a href="/admin/dashboard" className="bg-slate-900 text-white px-6 py-2 rounded-xl text-sm font-semibold mb-2">
            Buka Panel Admin
          </a>
        )}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6">
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <Mail className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Email</p>
            <p className="font-medium text-slate-800">{user.email}</p>
          </div>
        </div>
        <div className="p-4 border-b border-slate-50 flex items-center gap-4">
          <Phone className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Nomor HP</p>
            <p className="font-medium text-slate-800">{profile?.phone || '-'}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4">
          <Ticket className="w-5 h-5 text-slate-400" />
          <div>
            <p className="text-xs text-slate-400">Kode Referral</p>
            <p className="font-bold text-brand tracking-wider">{profile?.referral_code}</p>
          </div>
        </div>
      </div>

      <form action="/auth/logout" method="post">
        <button className="w-full bg-red-50 text-red-600 font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100">
          <LogOut className="w-5 h-5" /> Keluar Akun
        </button>
      </form>
    </div>
  );
}
