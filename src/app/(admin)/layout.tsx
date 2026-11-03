import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { LayoutDashboard, Package, ReceiptText, LogOut, Users } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center font-bold">RX</div>
          <span className="font-bold text-xl">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-2">
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
          <Link href="/admin/produk" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"><Package className="w-5 h-5" /> Harga Produk</Link>
          <Link href="/admin/transaksi" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"><ReceiptText className="w-5 h-5" /> Transaksi</Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"><Users className="w-5 h-5" /> Pengguna</Link>
        </nav>
        <form action="/auth/logout" method="post">
          <button className="flex items-center gap-3 text-red-400 font-semibold px-4 py-3 w-full hover:bg-slate-800 rounded-xl transition-colors"><LogOut className="w-5 h-5" /> Keluar</button>
        </form>
      </aside>

      {/* Top Bar Mobile */}
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <span className="font-bold">Admin RX PAY</span>
        <form action="/auth/logout" method="post">
          <button className="text-red-400"><LogOut className="w-5 h-5" /></button>
        </form>
      </div>

      {/* Konten Utama */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8">
        {children}
      </main>

      {/* Bottom Nav Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full bg-slate-900 text-white flex justify-around py-3 z-50 rounded-t-2xl">
        <Link href="/admin/dashboard" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors">
          <LayoutDashboard className="w-5 h-5" /><span className="text-[10px]">Dashboard</span>
        </Link>
        <Link href="/admin/produk" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors">
          <Package className="w-5 h-5" /><span className="text-[10px]">Produk</span>
        </Link>
        <Link href="/admin/transaksi" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors">
          <ReceiptText className="w-5 h-5" /><span className="text-[10px]">Transaksi</span>
        </Link>
        <Link href="/admin/users" className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors">
          <Users className="w-5 h-5" /><span className="text-[10px]">Pengguna</span>
        </Link>
      </nav>
    </div>
  );
}
