'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Activity, AlertTriangle, BarChart3, Bell, BookOpen, Boxes, Building2, CheckSquare2,
  ChevronDown, ClipboardCheck, CircleDollarSign, FileClock, FileText, Gauge, Home,
  LayoutDashboard, LogOut, Map, Menu as MenuIcon, PanelLeftClose, PanelLeftOpen,
  CalendarDays, School, Settings, ShieldCheck, Sparkles, Store, Truck, Users, Utensils, Vote, X
} from 'lucide-react';
import { useState } from 'react';
import { clearSession } from '@/lib/store';
import type { Role } from '@/lib/types';
import { NavigationLoader } from './navigation-loader';

export type SessionUser = { role: Role; email: string; name: string; organization: string; subtitle: string };
type NavItem = { label: string; href: string; icon: React.ComponentType<{ className?: string }> };

const navs: Record<Role, NavItem[]> = {
  student: [
    { label: 'Beranda', href: '/student', icon: Home },
    { label: 'Menu MBG', href: '/student/menu', icon: Utensils },
    { label: 'Musyawarah', href: '/student/voting', icon: Vote },
    { label: 'Belajar Gizi', href: '/student/nutrition', icon: BookOpen },
    { label: 'Profil', href: '/student/profile', icon: Users }
  ],
  teacher: [
    { label: 'Beranda', href: '/teacher', icon: Home },
    { label: 'Jadwal Distribusi', href: '/teacher/schedule', icon: CalendarDays },
    { label: 'Sidak Nalar', href: '/teacher/sidak-nalar', icon: Sparkles },
    { label: 'Musyawarah Kelas', href: '/teacher/musyawarah', icon: Vote },
    { label: 'Riwayat Validasi', href: '/teacher/history', icon: FileClock },
    { label: 'Lapor Anomali', href: '/teacher/anomaly', icon: AlertTriangle },
    { label: 'SOP Gizi', href: '/teacher/sop', icon: BookOpen },
    { label: 'Profil', href: '/teacher/profile', icon: Users }
  ],
  vendor: [
    { label: 'Overview', href: '/vendor', icon: LayoutDashboard },
    { label: 'Distribusi', href: '/vendor/distribution', icon: Truck },
    { label: 'Rencana Menu', href: '/vendor/menu-plan', icon: CalendarDays },
    { label: 'Quality Control', href: '/vendor/qc', icon: ClipboardCheck },
    { label: 'Digital Clearance', href: '/vendor/clearance', icon: ShieldCheck },
    { label: 'Klaim', href: '/vendor/claims', icon: CircleDollarSign },
    { label: 'Logistik', href: '/vendor/logistics', icon: Boxes },
    { label: 'Anomali', href: '/vendor/anomalies', icon: AlertTriangle },
    { label: 'Riwayat', href: '/vendor/history', icon: FileClock },
    { label: 'Profil SPPG', href: '/vendor/profile', icon: Store }
  ],
  government: [
    { label: 'Executive Overview', href: '/government', icon: Gauge },
    { label: 'Peta Monitoring', href: '/government/map', icon: Map },
    { label: 'SPPG', href: '/government/sppg', icon: Building2 },
    { label: 'Distribusi', href: '/government/distributions', icon: Truck },
    { label: 'Food Waste & Preferensi', href: '/government/food-waste', icon: Utensils },
    { label: 'Anomali', href: '/government/anomalies', icon: AlertTriangle },
    { label: 'Corrective Action', href: '/government/corrective-actions', icon: CheckSquare2 },
    { label: 'Audit Trail', href: '/government/audit', icon: FileClock },
    { label: 'Clearance', href: '/government/clearance', icon: ShieldCheck },
    { label: 'Reports', href: '/government/reports', icon: FileText },
    { label: 'Analytics', href: '/government/analytics', icon: BarChart3 }
  ],
  admin: [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Schools', href: '/admin/schools', icon: School },
    { label: 'SPPG', href: '/admin/sppg', icon: Building2 },
    { label: 'Regions', href: '/admin/regions', icon: Map },
    { label: 'Menu Master', href: '/admin/menus', icon: Utensils },
    { label: 'System Logs', href: '/admin/logs', icon: Activity },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ]
};

const roleMeta: Record<Role, { label: string; short: string; section: string }> = {
  student: { label: 'Portal Siswa', short: 'Siswa', section: 'My MBG Kids' },
  teacher: { label: 'Portal Sekolah', short: 'Sekolah', section: 'Operasional Sekolah' },
  vendor: { label: 'Portal SPPG', short: 'SPPG', section: 'Operasional Mitra' },
  government: { label: 'Portal Pengawasan', short: 'Pengawas', section: 'Intelligence Center' },
  admin: { label: 'Portal Administrator', short: 'Admin', section: 'Administrasi Sistem' }
};

function isActive(path: string, href: string) {
  if (href.split('/').length === 2) return path === href;
  return path.startsWith(href);
}

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return (
    <>
      <NavigationLoader />
      {user.role === 'student' ? <StudentShell user={user}>{children}</StudentShell> : <InstitutionalShell user={user}>{children}</InstitutionalShell>}
    </>
  );
}

function InstitutionalShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const roleNav = navs[user.role];
  const mobileItems = user.role === 'teacher'
    ? roleNav.filter(x => ['Beranda','Sidak Nalar','Riwayat Validasi','Lapor Anomali','Profil'].includes(x.label))
    : roleNav.slice(0, 5);
  const meta = roleMeta[user.role];
  const logout = () => { clearSession(); router.replace('/login'); };

  const SidebarContent = () => (
    <>
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between gap-3">
          <div className={`font-black tracking-tight text-white ${collapsed ? 'text-xs' : 'text-lg'}`}>My MBG</div>
          <button className="hidden rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white lg:block" onClick={() => setCollapsed(!collapsed)} aria-label="Toggle sidebar">
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </div>
        {!collapsed && <div className="mt-4 rounded-xl border border-white/10 bg-white/[.06] px-3 py-2.5"><div className="text-[9px] font-black uppercase tracking-[.16em] text-emerald-300">{meta.label}</div><div className="mt-1 text-xs font-semibold text-slate-300">Sistem Informasi Audit & Monitoring MBG</div></div>}
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <div className={`mb-2 px-3 py-2 text-[9px] font-black uppercase tracking-[.16em] text-slate-500 ${collapsed ? 'text-center' : ''}`}>{collapsed ? '•' : 'Menu Utama'}</div>
        <nav className="space-y-1">
          {roleNav.map(item => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return <Link key={item.href} href={item.href} onClick={()=>setDrawer(false)} className={`relative flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-bold transition ${active ? 'bg-white text-navy-900 shadow-lg shadow-black/10' : 'text-slate-300 hover:bg-white/[.07] hover:text-white'} ${collapsed ? 'justify-center' : ''}`} title={item.label}>
              {active && !collapsed && <span className="absolute -left-1 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gov-500"/>}
              <Icon className={`h-[18px] w-[18px] shrink-0 ${active ? 'text-gov-600' : ''}`} />
              {!collapsed && <span>{item.label}</span>}
            </Link>;
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 p-3">
        {!collapsed && <div className="mb-2 rounded-xl border border-white/10 bg-white/[.05] p-3"><div className="truncate text-xs font-extrabold text-white">{user.name}</div><div className="mt-1 truncate text-[10px] text-slate-400">{user.organization}</div></div>}
        <button onClick={logout} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-300 transition hover:bg-red-500/10 hover:text-red-200 ${collapsed ? 'justify-center' : ''}`}><LogOut className="h-[18px] w-[18px]"/>{!collapsed && 'Keluar'}</button>
      </div>
    </>
  );

  return (
    <div className="institutional-shell min-h-screen">
      <div className="fixed inset-x-0 top-0 z-50 h-[3px] bg-gov-600"/>
      <aside className={`fixed inset-y-0 left-0 z-30 hidden flex-col bg-navy-950 lg:flex ${collapsed ? 'w-[82px]' : 'w-[272px]'} transition-all duration-300`}><SidebarContent/></aside>
      {drawer && <div className="fixed inset-0 z-40 bg-navy-950/55 backdrop-blur-sm lg:hidden" onClick={()=>setDrawer(false)}><aside className="h-full w-[286px] bg-navy-950" onClick={e=>e.stopPropagation()}><div className="absolute left-[294px] top-4"><button onClick={()=>setDrawer(false)} className="rounded-full bg-white p-2 text-slate-700 shadow-lg"><X className="h-5 w-5"/></button></div><SidebarContent/></aside></div>}

      <div className={`${collapsed ? 'lg:pl-[82px]' : 'lg:pl-[272px]'} transition-all duration-300`}>
        <header className="sticky top-[3px] z-20 flex h-[72px] items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur-xl md:px-6">
          <button className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden" onClick={()=>setDrawer(true)} aria-label="Buka menu"><MenuIcon className="h-5 w-5"/></button>
          <div className="text-sm font-black text-navy-900 lg:hidden">My MBG</div>
          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-2"><span className="text-sm font-black text-navy-900">{meta.section}</span><span className="h-1 w-1 rounded-full bg-slate-300"/><span className="text-[10px] font-bold uppercase tracking-[.12em] text-gov-600">{meta.short}</span></div>
            <div className="mt-0.5 truncate text-[11px] text-slate-500">{user.organization}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-extrabold text-emerald-700 md:flex"><span className="h-2 w-2 rounded-full bg-emerald-500"/>Sistem Aktif</div>
            <button onClick={()=>window.alert('2 notifikasi aktif: 1 anomali baru dan 1 status clearance diperbarui.')} className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50" aria-label="Notifikasi"><Bell className="h-5 w-5"/><span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"/></button>
            <Link href={`/${user.role}${user.role === 'vendor' || user.role === 'teacher' ? '/profile' : ''}`} className="hidden items-center gap-3 rounded-xl border border-transparent p-1.5 pl-2 hover:border-slate-200 hover:bg-slate-50 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy-900 text-xs font-black text-white">{user.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</div>
              <div className="max-w-[170px] text-left"><div className="truncate text-xs font-extrabold text-navy-900">{user.name}</div><div className="truncate text-[9px] font-bold uppercase tracking-[.08em] text-slate-400">{meta.label}</div></div>
              <ChevronDown className="h-4 w-4 text-slate-400"/>
            </Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1540px] p-4 pb-24 md:p-7 md:pb-12"><div key={pathname} className="page-enter">{children}</div></main>
      </div>

      <nav className="fixed inset-x-3 bottom-3 z-30 flex h-[66px] items-center justify-around rounded-2xl border border-slate-200 bg-white/95 px-2 shadow-2xl backdrop-blur-xl lg:hidden">
        {mobileItems.map(item => {
          const Icon = item.icon; const active = isActive(pathname, item.href);
          return <Link key={item.href} href={item.href} className={`flex min-w-[58px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[9px] font-extrabold ${active ? 'bg-gov-50 text-gov-700' : 'text-slate-400'}`}><Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`}/><span className="max-w-[70px] truncate">{item.label.replace(' Validasi','')}</span></Link>;
        })}
      </nav>
    </div>
  );
}

function StudentShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const roleNav = navs.student;
  const mobileItems = roleNav.filter(x => ['Beranda','Menu MBG','Belajar Gizi','Profil'].includes(x.label));
  const logout = () => { clearSession(); router.replace('/login'); };

  return (
    <div className="student-shell min-h-screen text-[#17345d]">
      <header className="sticky top-0 z-30 border-b border-sky-100/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex h-[74px] max-w-[1240px] items-center gap-3 px-4 md:px-6">
          <div className="text-lg font-black tracking-tight text-brand-800">My MBG</div>
          <nav className="ml-7 hidden items-center gap-1 lg:flex">
            {roleNav.map(item=>{const Icon=item.icon;const active=isActive(pathname,item.href);return <Link key={item.href} href={item.href} className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition ${active?'bg-brand-600 text-white shadow-md shadow-brand-200':'text-slate-500 hover:bg-sky-50 hover:text-brand-700'}`}><Icon className="h-4 w-4"/>{item.label}</Link>})}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden text-xs font-semibold text-slate-500 md:block">{user.subtitle}</div>
            <button onClick={()=>window.alert('Menu besok sudah tersedia. Jangan lupa cek voting minggu depan.')} className="relative rounded-lg bg-sky-50 p-2.5 text-brand-700" aria-label="Notifikasi"><Bell className="h-5 w-5"/><span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-coral ring-2 ring-white"/></button>
            <button onClick={()=>setDrawer(!drawer)} className="rounded-lg border border-sky-100 bg-white p-1 pr-3 shadow-sm"><span className="flex items-center gap-2"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-xs font-black text-white">{user.name.split(' ').map(x=>x[0]).slice(0,2).join('')}</span><span className="hidden text-left sm:block"><span className="block text-[11px] font-black text-navy-900">{user.name}</span><span className="block text-[9px] text-slate-400">{user.organization}</span></span></span></button>
          </div>
        </div>
        {drawer && <div className="absolute right-4 top-[68px] w-56 rounded-2xl border border-sky-100 bg-white p-2 shadow-2xl"><Link href="/student/profile" onClick={()=>setDrawer(false)} className="block rounded-xl px-3 py-2.5 text-xs font-extrabold hover:bg-sky-50">Lihat Profil</Link><button onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-extrabold text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4"/>Keluar</button></div>}
      </header>
      <main className="relative mx-auto max-w-[1240px] p-4 pb-28 md:px-6 md:py-7 lg:pb-12"><div key={pathname} className="page-enter">{children}</div></main>
      <nav className="fixed inset-x-3 bottom-3 z-30 flex h-[70px] items-center justify-around rounded-2xl border border-sky-100 bg-white/95 px-2 shadow-lg backdrop-blur-xl lg:hidden">
        {mobileItems.map(item => {const Icon=item.icon;const active=isActive(pathname,item.href);return <Link key={item.href} href={item.href} className={`relative flex min-w-[62px] flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[9px] font-black ${active?'text-brand-700':'text-slate-400'}`}>{active&&<span className="absolute -top-2 h-1.5 w-8 rounded-full bg-brand-500"/>}<span className={`rounded-xl p-1 ${active?'bg-sky-50':''}`}><Icon className={`h-5 w-5 ${active?'stroke-[2.8]':''}`}/></span><span className="max-w-[70px] truncate">{item.label}</span></Link>})}
      </nav>
    </div>
  );
}
