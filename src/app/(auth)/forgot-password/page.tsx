'use client';
import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
    } else {
      setMessage('Cek email kamu! Kami sudah mengirimkan link untuk mereset password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-card border border-slate-100">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gradient mb-2">Lupa Password</h1>
          <p className="text-slate-500 text-sm">Masukkan email untuk menerima link reset.</p>
        </div>
        
        {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">{error}</div>}
        {message && <div className="bg-green-50 text-green-600 p-3 rounded-xl mb-4 text-sm">{message}</div>}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand outline-none"
              placeholder="email@contoh.com" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-gradient text-white font-semibold shadow-card disabled:opacity-70 mt-2">
            {loading ? 'Mengirim...' : 'Kirim Link Reset'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 mt-6">
          Ingat password? <Link href="/login" className="text-brand font-semibold hover:underline">Kembali ke Login</Link>
        </p>
      </div>
    </div>
  );
}
