import Link from 'next/link';
import { Logo } from '@/components/ui';

export default function NotFound() {
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6"><div className="surface max-w-md p-8 text-center"><div className="flex justify-center"><Logo/></div><div className="mt-6 text-5xl font-black text-brand-700">404</div><h1 className="mt-2 text-xl font-black">Halaman tidak ditemukan</h1><p className="mt-2 text-sm leading-6 text-slate-500">Route ini belum tersedia di sistem My MBG.</p><Link href="/login" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-brand-600 px-4 text-sm font-bold text-white">Kembali ke Login</Link></div></main>;
}
