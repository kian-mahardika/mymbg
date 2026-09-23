'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Role } from '@/lib/types';
import { getSession, useAppState } from '@/lib/store';
import { AppShell, type SessionUser } from './app-shell';
import { StudentApp } from './student-app';
import { TeacherApp } from './teacher-app';
import { VendorApp } from './vendor-app';
import { GovernmentApp } from './government-app';
import { AdminApp } from './admin-app';

const validRoles: Role[] = ['student','teacher','vendor','government','admin'];

export function RoleApp({ role, slug }: { role: string; slug?: string[] }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const store = useAppState();

  useEffect(() => {
    if (!validRoles.includes(role as Role)) { router.replace('/login'); return; }
    const session = getSession();
    if (!session) { router.replace('/login'); return; }
    if (session.role !== role) { router.replace(`/${session.role}`); return; }
    setUser(session); setChecking(false);
  }, [role, router]);

  if (checking || !user || !store.ready) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-50"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600"/><div className="mt-4 text-sm font-bold text-slate-600">Menyiapkan My MBG...</div></div></div>;
  }

  const path = slug || [];
  const props = { user, path, ...store };
  let content: React.ReactNode = null;
  if (role === 'student') content = <StudentApp {...props} />;
  if (role === 'teacher') content = <TeacherApp {...props} />;
  if (role === 'vendor') content = <VendorApp {...props} />;
  if (role === 'government') content = <GovernmentApp {...props} />;
  if (role === 'admin') content = <AdminApp {...props} />;

  return <AppShell user={user}>{content}</AppShell>;
}
