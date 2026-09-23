
'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { APP_ACCOUNTS } from '@/lib/data';
import { getManagedAccounts, saveSession } from '@/lib/store';

export default function LoginPage() {
  const router = useRouter();
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    window.setTimeout(() => {
      const accounts = [...APP_ACCOUNTS, ...getManagedAccounts()];
      const matched = accounts.find(
        (item) => item.email.toLowerCase() === account.trim().toLowerCase() && item.password === password
      );
      if (!matched) {
        setError('Akun atau password tidak sesuai.');
        setLoading(false);
        return;
      }
      saveSession(matched);
      router.push(`/${matched.role}`);
    }, 250);
  };

  return (
    <main className="min-h-screen bg-[#eef2f5] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-md items-center justify-center">
        <div className="w-full rounded-[22px] border border-slate-200 bg-white p-6 shadow-[0_18px_48px_rgba(15,23,42,0.08)] sm:p-8">
          <h1 className="text-[30px] font-black tracking-[-0.03em] text-slate-950">Masuk</h1>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Akun</span>
              <input required value={account} onChange={(e) => setAccount(e.target.value)} type="text" autoComplete="username" placeholder="email akun" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"/>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-bold text-slate-700">Password</span>
              <span className="relative block">
                <input required value={password} onChange={(e) => setPassword(e.target.value)} type={show ? 'text' : 'password'} autoComplete="current-password" placeholder="password" className="h-12 w-full rounded-xl border border-slate-200 px-4 pr-11 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"/>
                <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}>{show ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}</button>
              </span>
            </label>
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">{error}</div>}
            <button disabled={loading} className="h-12 w-full rounded-xl bg-[#0b2241] text-sm font-extrabold text-white transition hover:bg-[#12315c] disabled:opacity-60">{loading ? 'Memverifikasi...' : 'Masuk'}</button>
          </form>
        </div>
      </div>
    </main>
  );
}
