'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  Sparkles,
  XCircle
} from 'lucide-react';

export function Logo({ compact = false, inverse = false, playful = false }: { compact?: boolean; inverse?: boolean; playful?: boolean }) {
  if (compact) {
    return <div className={`text-sm font-black tracking-tight ${inverse ? 'text-white' : playful ? 'text-brand-700' : 'text-navy-900'}`}>My MBG</div>;
  }

  return (
    <div className="flex items-center gap-3">
      <div>
        <div className={`text-lg font-black tracking-tight ${inverse ? 'text-white' : playful ? 'text-brand-800' : 'text-slate-900'}`}>My MBG</div>
        <div className={`text-[9px] font-bold uppercase tracking-[.18em] ${inverse ? 'text-slate-300' : playful ? 'text-brand-600' : 'text-slate-500'}`}>Audit & Monitoring MBG</div>
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="page-header mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-[30px]">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-3xl text-sm leading-6 text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`app-card p-5 ${className}`}>{children}</div>;
}

export function StatCard({ label, value, note, icon, tone = 'blue' }: { label: string; value: string | number; note?: string; icon?: React.ReactNode; tone?: 'blue'|'green'|'orange'|'red'|'slate' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    orange: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-red-50 text-red-700 ring-red-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200'
  };
  const bars = { blue:'bg-blue-600', green:'bg-gov-600', orange:'bg-amber-500', red:'bg-red-500', slate:'bg-slate-500' };
  return (
    <Card className="relative overflow-hidden p-5">
      <span className={`absolute inset-x-0 top-0 h-[3px] ${bars[tone]}`}/>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] font-extrabold uppercase tracking-[.11em] text-slate-400">{label}</div>
          <div className="mt-2 truncate text-[27px] font-black tracking-[-.035em] text-navy-900">{value}</div>
          {note && <div className="mt-1 text-xs text-slate-500">{note}</div>}
        </div>
        {icon && <div className={`rounded-xl p-2.5 ring-1 ${tones[tone]}`}>{icon}</div>}
      </div>
    </Card>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  let cls = 'bg-slate-50 text-slate-700 border-slate-200';
  let Icon = Clock3;
  if (s.includes('verif') || s.includes('complete') || s.includes('eligible') || s.includes('ready') || s.includes('active') || s === 'normal' || s.includes('sesuai') || s.includes('resolved') || s.includes('approved') || s.includes('aktif')) {
    cls = 'bg-emerald-50 text-emerald-700 border-emerald-200'; Icon = CheckCircle2;
  } else if (s.includes('critical') || s.includes('reject') || s.includes('anomaly') || s.includes('tidak sesuai')) {
    cls = 'bg-red-50 text-red-700 border-red-200'; Icon = XCircle;
  } else if (s.includes('review') || s.includes('warning') || s.includes('hold') || s.includes('await') || s.includes('watch') || s.includes('corrective')) {
    cls = 'bg-amber-50 text-amber-700 border-amber-200'; Icon = AlertTriangle;
  } else if (s.includes('pending') || s.includes('draft') || s.includes('scheduled') || s.includes('transit') || s.includes('voting')) {
    cls = 'bg-blue-50 text-blue-700 border-blue-200'; Icon = Clock3;
  }
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[.04em] ${cls}`}><Icon className="h-3.5 w-3.5" />{status.replaceAll('_', ' ')}</span>;
}

export function Button({ children, className = '', variant = 'primary', type = 'button', onClick, disabled }: { children: React.ReactNode; className?: string; variant?: 'primary'|'secondary'|'danger'|'ghost'; type?: 'button'|'submit'; onClick?: () => void; disabled?: boolean }) {
  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
    secondary: 'bg-white text-navy-900 border border-slate-200 hover:border-slate-300 hover:bg-slate-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100'
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}>{children}</button>;
}

export function LinkButton({ href, children, variant = 'primary', className = '' }: { href: string; children: React.ReactNode; variant?: 'primary'|'secondary'|'ghost'; className?: string }) {
  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
    secondary: 'border border-slate-200 bg-white text-navy-900 hover:border-slate-300 hover:bg-slate-50',
    ghost: 'text-gov-700 hover:bg-gov-50'
  };
  return <Link href={href} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${variants[variant]} ${className}`}>{children}</Link>;
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="section-title mb-4 flex items-center justify-between gap-4">
      <div>
        <h2 className="text-[15px] font-black text-slate-900">{title}</h2>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Progress({ value, label, tone = 'blue' }: { value: number; label?: string; tone?: 'blue'|'green'|'orange'|'red' }) {
  const colors = { blue: 'bg-brand-600', green: 'bg-gov-600', orange: 'bg-amber-500', red: 'bg-red-500' };
  return (
    <div>
      {label && <div className="mb-1.5 flex justify-between text-xs text-slate-500"><span>{label}</span><span className="font-extrabold text-slate-700">{value}%</span></div>}
      <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${colors[tone]} transition-all duration-500`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
    </div>
  );
}

export function AIBlock({ children, title = 'AI Analysis' }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="rounded-xl border border-cyan-200 bg-cyan-50/60 p-5">
      <div className="mb-4 flex items-center gap-2 text-sm font-black text-cyan-900"><span className="rounded-lg bg-cyan-100 p-1.5"><Sparkles className="h-4 w-4" /></span>{title}<span className="ml-auto rounded-full border border-cyan-200 bg-white px-2 py-1 text-[9px] font-black tracking-wider text-cyan-700">AI-ASSISTED</span></div>
      {children}
    </div>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return <Card className="py-12 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><Search className="h-5 w-5" /></div><div className="font-black text-slate-800">{title}</div><p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p></Card>;
}

export function MiniBars({ values, labels }: { values: number[]; labels?: string[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex h-36 items-end gap-2">
      {values.map((v, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-md bg-gradient-to-t from-navy-900 to-gov-500" style={{ height: `${Math.max(10, (v/max)*110)}px` }} title={`${v}`} />
          {labels && <span className="text-[10px] font-semibold text-slate-400">{labels[i]}</span>}
        </div>
      ))}
    </div>
  );
}

export function TrendChart({ points, suffix = '%', minValue }: { points: { label: string; value: number }[]; suffix?: string; minValue?: number }) {
  if (!points.length) return <div className="flex h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center"><div><div className="text-sm font-extrabold text-slate-700">Belum ada data tren</div><div className="mt-1 text-xs text-slate-400">Grafik akan terisi setelah aktivitas operasional tercatat.</div></div></div>;
  const width = 620, height = 210, padL = 42, padR = 18, padT = 18, padB = 38;
  const values = points.map(p => p.value);
  const rawMin = Math.min(...values, 0), rawMax = Math.max(...values, 100);
  const min = minValue ?? Math.max(0, Math.floor((Math.min(...values) - 5) / 5) * 5);
  const max = Math.min(100, Math.max(rawMax >= 100 ? 100 : Math.ceil((Math.max(...values) + 3) / 5) * 5, min + 10));
  const range = Math.max(max - min, 1);
  const coords = points.map((p, i) => {
    const x = padL + (i * (width - padL - padR)) / Math.max(points.length - 1, 1);
    const y = padT + (1 - (p.value - min) / range) * (height - padT - padB);
    return { ...p, x, y };
  });
  const poly = coords.map(p => `${p.x},${p.y}`).join(' ');
  const area = `${padL},${height-padB} ${poly} ${width-padR},${height-padB}`;
  const ticks = [0, .25, .5, .75, 1].map(t => Math.round(max - (max-min)*t));
  return <div className="w-full overflow-hidden">
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[220px] w-full" role="img" aria-label="Grafik tren operasional">
      <defs>
        <linearGradient id="trend-area" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0f7c5d" stopOpacity=".20"/><stop offset="1" stopColor="#0f7c5d" stopOpacity="0"/></linearGradient>
      </defs>
      {ticks.map((tick,i)=>{const y=padT+(i*(height-padT-padB)/4);return <g key={tick}><line x1={padL} x2={width-padR} y1={y} y2={y} stroke="#e6edf3" strokeWidth="1"/><text x={padL-8} y={y+4} textAnchor="end" fontSize="10" fill="#8291a5">{tick}{suffix}</text></g>})}
      <polyline points={area} fill="url(#trend-area)" stroke="none"/>
      <polyline points={poly} fill="none" stroke="#0f7c5d" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
      {coords.map((p,i)=><g key={`${p.label}-${i}`}><circle cx={p.x} cy={p.y} r="4.5" fill="white" stroke="#0f7c5d" strokeWidth="2.5"><title>{p.label}: {p.value.toFixed(1)}{suffix}</title></circle><text x={p.x} y={height-12} textAnchor="middle" fontSize="10" fill="#66788f">{p.label}</text></g>)}
    </svg>
  </div>;
}

export function TrendLine({ values }: { values: number[] }) {
  const width = 500, height = 150, pad = 14;
  const max = Math.max(...values), min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const pts = values.map((v, i) => {
    const x = pad + (i * (width - pad*2)) / Math.max(values.length - 1, 1);
    const y = height - pad - ((v-min)/range)*(height-pad*2);
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-40 w-full" role="img" aria-label="Grafik tren">
      <defs><linearGradient id="linefill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#0f7c5d" stopOpacity=".20"/><stop offset="1" stopColor="#0f7c5d" stopOpacity="0"/></linearGradient></defs>
      <polyline points={`${pad},${height-pad} ${pts} ${width-pad},${height-pad}`} fill="url(#linefill)" stroke="none" />
      <polyline points={pts} fill="none" stroke="#0f7c5d" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {values.map((v,i)=>{ const [x,y]=pts.split(' ')[i].split(','); return <circle key={i} cx={x} cy={y} r="4" fill="white" stroke="#0f7c5d" strokeWidth="2.5"/>; })}
    </svg>
  );
}

export function EvidenceMeta({ school, time, location = 'Terverifikasi' }: { school: string; time: string; location?: string }) {
  return <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2"><div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gov-600" />{school}</div><div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-gov-600" />{time} • {location}</div></div>;
}

export function SimpleTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full min-w-[700px] border-separate border-spacing-0 text-left text-sm">
        <thead><tr>{headers.map(h => <th key={h} className="sticky top-0 border-b border-slate-200 bg-[#f7f9fb] px-4 py-3 text-[10px] font-black uppercase tracking-[.09em] text-slate-500">{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, i) => <tr key={i} className="group transition hover:bg-[#f8fbfa]">{row.map((cell, j) => <td key={j} className="border-b border-slate-100 px-4 py-3.5 align-middle text-slate-700">{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder = 'Cari...' }: { value: string; onChange: (value: string) => void; placeholder?: string }) {
  return <label className="relative block"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none ring-gov-100 transition focus:border-gov-500 focus:ring-4"/></label>;
}

export function MetricRow({ label, value, note }: { label: string; value: React.ReactNode; note?: string }) {
  return <div className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0"><div><div className="text-sm font-semibold text-slate-700">{label}</div>{note && <div className="text-xs text-slate-400">{note}</div>}</div><div className="text-right font-black text-navy-900">{value}</div></div>;
}

export function Timeline({ items }: { items: { title: string; text?: string; time: string; status?: string }[] }) {
  return <div className="space-y-0">{items.map((it,i)=><div key={i} className="relative flex gap-4 pb-5 last:pb-0"><div className="relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full bg-gov-600 ring-4 ring-gov-50" />{i<items.length-1 && <div className="absolute left-[5px] top-4 h-full w-px bg-slate-200"/>}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-extrabold text-slate-800">{it.title}</span>{it.status && <StatusBadge status={it.status}/>}</div>{it.text && <p className="mt-1 text-xs leading-5 text-slate-500">{it.text}</p>}<div className="mt-1 text-[11px] font-semibold text-slate-400">{it.time}</div></div></div>)}</div>;
}

export function KeyValue({ label, value }: { label: string; value: React.ReactNode }) {
  return <div className="rounded-xl border border-slate-100 bg-[#f8fafc] p-3"><div className="text-[9px] font-black uppercase tracking-[.10em] text-slate-400">{label}</div><div className="mt-1 text-sm font-black text-navy-900">{value}</div></div>;
}

export function ChevronLink({ href, title, subtitle }: { href: string; title: string; subtitle?: string }) {
  return <Link href={href} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-gov-200 hover:bg-gov-50/50"><div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold text-slate-800">{title}</div>{subtitle&&<div className="truncate text-xs text-slate-500">{subtitle}</div>}</div><ChevronRight className="h-4 w-4 text-slate-400"/></Link>;
}

export function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex items-center gap-1 text-xs font-extrabold text-gov-700 hover:text-gov-800">{children}<ArrowRight className="h-3.5 w-3.5"/></Link>;
}

export function PortalHero({ eyebrow, title, text, children }: { eyebrow: string; title: string; text: string; children?: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white px-5 py-6 sm:px-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl border-l-4 border-gov-600 pl-4">
          <div className="text-[10px] font-bold uppercase tracking-[.16em] text-gov-700">{eyebrow}</div>
          <h1 className="mt-2 text-2xl font-black tracking-[-.025em] text-navy-900 sm:text-[30px]">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{text}</p>
        </div>
        {children && <div className="shrink-0">{children}</div>}
      </div>
    </section>
  );
}
