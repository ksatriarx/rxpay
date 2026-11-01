'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Clock, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const menus = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Produk', href: '/produk', icon: ShoppingBag },
    { name: 'Riwayat', href: '/transaksi', icon: Clock },
    { name: 'Akun', href: '/akun', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center pt-2 pb-4 px-2 z-50 md:hidden rounded-t-3xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
      {menus.map((menu) => {
        const isActive = pathname === menu.href;
        return (
          <Link key={menu.name} href={menu.href} className={`flex flex-col items-center gap-1 w-16 ${isActive ? 'text-brand' : 'text-slate-400'}`}>
            <menu.icon className={`w-6 h-6 ${isActive ? 'fill-brand/10' : ''}`} />
            <span className="text-[10px] font-medium">{menu.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
