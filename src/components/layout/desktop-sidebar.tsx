'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Clock, User, LogOut } from 'lucide-react';

export default function DesktopSidebar() {
  const pathname = usePathname();
  const menus = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Produk', href: '/produk', icon: ShoppingBag },
    { name: 'Transaksi', href: '/transaksi', icon: Clock },
    { name: 'Akun', href: '/akun', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white h-screen fixed left-0 top-0 border-r border-slate-100 p-6 z-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 rounded-xl bg-brand-gradient flex items-center justify-center text-white text-xl font-bold">RX</div>
        <span className="font-extrabold text-xl text-gradient">RX PAY</span>
      </div>
      <nav className="flex-1 space-y-2">
        {menus.map((menu) => {
          const isActive = pathname.startsWith(menu.href);
          return (
            <Link 
              key={menu.name} 
              href={menu.href} 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
                isActive ? 'bg-blue-50 text-brand' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <menu.icon className="w-5 h-5" />
              {menu.name}
            </Link>
          );
        })}
      </nav>
      <form action="/auth/logout" method="post">
        <button className="flex items-center gap-3 text-red-500 font-semibold px-4 py-3 w-full hover:bg-red-50 rounded-xl">
          <LogOut className="w-5 h-5" /> Keluar
        </button>
      </form>
    </aside>
  );
}
