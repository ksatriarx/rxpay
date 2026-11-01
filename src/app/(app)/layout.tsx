import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import BottomNav from '@/components/layout/bottom-nav';
import DesktopSidebar from '@/components/layout/desktop-sidebar';
import { Bell } from 'lucide-react';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 md:pl-64">
      {/* Top Bar Mobile */}
      <header className="bg-white px-4 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm md:hidden">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center text-white font-bold">RX</div>
          <span className="font-bold text-lg text-slate-800">RX PAY</span>
        </div>
        <div className="flex items-center gap-3">
          <Bell className="w-5 h-5 text-slate-500" />
        </div>
      </header>

      {/* Sidebar Desktop */}
      <DesktopSidebar />

      <main className="max-w-4xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
