import Link from 'next/link';
import { ArrowLeft, CreditCard, Landmark, ChevronRight } from 'lucide-react';

export default function DepositSelectionPage() {
  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm border border-slate-200">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Top Up Saldo</h1>
      </div>

      <p className="text-slate-500 mb-6">Pilih metode pembayaran yang ingin kamu gunakan.</p>

      <div className="space-y-4">
        {/* Pilihan Transfer Bank */}
        <Link href="/deposit/manual" className="block bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-brand transition-colors">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-brand rounded-xl flex items-center justify-center shrink-0">
              <Landmark className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">Transfer Bank (Manual)</h3>
              <p className="text-xs text-slate-500 mt-1">Transfer ke rekening SeaBank, lalu unggah bukti.</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        </Link>

        {/* Pilihan QRIS / Otomatis (Menyala nanti setelah Xendit aktif) */}
        <div className="block bg-slate-50 p-5 rounded-2xl border border-slate-100 opacity-60 cursor-not-allowed">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-600">QRIS / E-Wallet</h3>
              <p className="text-xs text-slate-400 mt-1">Otomatis masuk (Segera Hadir).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
