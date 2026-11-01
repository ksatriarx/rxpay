import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-md w-full">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-brand-gradient flex items-center justify-center text-white text-3xl font-extrabold shadow-card mb-6">
          RX
        </div>
        <h1 className="text-4xl font-extrabold mb-2">
          <span className="text-gradient">RX PAY</span>
        </h1>
        <p className="text-slate-600 mb-8">
          Platform PPOB digital. Beli pulsa, paket data, token listrik, dan bayar tagihan — cepat, murah, aman.
        </p>
        <div className="flex gap-3">
          <Link href="/register" className="flex-1 py-3 rounded-2xl bg-brand-gradient text-white font-semibold shadow-card text-center">
            Daftar
          </Link>
          <Link href="/login" className="flex-1 py-3 rounded-2xl border border-slate-200 font-semibold text-slate-700 text-center">
            Masuk
          </Link>
        </div>
      </div>
    </main>
  );
}
