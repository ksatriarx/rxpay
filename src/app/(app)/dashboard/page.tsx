import { createClient } from '@/lib/supabase/server';
import { formatIDR } from '@/lib/utils';
import { Wallet, Plus, Zap, Wifi, Smartphone, Gamepad2, Droplet, Tv, History } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user!.id).single();

  const menus = [
    { name: 'Pulsa', icon: Smartphone, color: 'bg-blue-100 text-blue-600', href: '/produk?kategori=Pulsa' },
    { name: 'Paket Data', icon: Wifi, color: 'bg-purple-100 text-purple-600', href: '/produk?kategori=Paket Data' },
    { name: 'Token PLN', icon: Zap, color: 'bg-yellow-100 text-yellow-600', href: '/produk?kategori=Token Listrik' },
    { name: 'E-Wallet', icon: Wallet, color: 'bg-green-100 text-green-600', href: '/produk?kategori=E-Wallet' },
    { name: 'Game', icon: Gamepad2, color: 'bg-red-100 text-red-600', href: '/produk?kategori=Game' },
    { name: 'PDAM', icon: Droplet, color: 'bg-cyan-100 text-cyan-600', href: '/produk?kategori=PDAM' },
    { name: 'TV', icon: Tv, color: 'bg-orange-100 text-orange-600', href: '/produk?kategori=TV' },
    { name: 'Lainnya', icon: Plus, color: 'bg-slate-100 text-slate-600', href: '/produk' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-slate-500 text-sm">Selamat datang,</p>
        <h1 className="text-xl font-bold text-slate-800">{profile?.full_name || 'Pengguna RX'}</h1>
      </div>

      <div className="bg-brand-gradient p-6 rounded-3xl text-white shadow-lg shadow-brand/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <p className="text-white/80 text-sm mb-1">Saldo RX Pay</p>
          <h2 className="text-3xl font-extrabold mb-6">{formatIDR(profile?.balance || 0)}</h2>
          <div className="flex gap-3">
            <Link href="/deposit" className="flex-1 bg-white text-brand text-center py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-colors flex items-center justify-center">
              Top Up
            </Link>
            <Link href="/transaksi" className="flex-1 bg-white/20 border border-white/30 text-white text-center py-2.5 rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors flex items-center justify-center gap-2">
              <History className="w-4 h-4" /> Riwayat
            </Link>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">Layanan Kami</h3>
        </div>
        <div className="grid grid-cols-4 gap-3 md:gap-6">
          {menus.map((menu, i) => (
            <Link key={i} href={menu.href} className="flex flex-col items-center gap-2 cursor-pointer">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${menu.color} hover:scale-105 transition-transform`}>
                <menu.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-medium text-slate-600 text-center">{menu.name}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* BANNER PROMO DENGAN NEXT/IMAGE */}
      <Link href="/produk" className="block relative rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-32 md:h-40">
        <Image
          src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800&h=200"
          alt="Promo Cashback"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority // Memuat gambar ini lebih dulu karena ada di atas layar
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center p-6">
          <div>
            <h4 className="font-bold text-white text-lg md:text-xl mb-1">Promo Cashback 10%</h4>
            <p className="text-white/80 text-sm">Khusus transaksi pertamamu hari ini!</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
