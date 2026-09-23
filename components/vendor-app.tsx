'use client';

import Link from 'next/link';
import { AlertTriangle, Boxes, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardCheck, PackageCheck, Plus, Send, Store, Truck, Utensils } from 'lucide-react';
import { useState } from 'react';
import { menus, schools, sppgs } from '@/lib/data';
import { makeAuditLog } from '@/lib/store';
import { claimForClearance, clearanceEvidence, recalculateClearances, reopenClaimsAfterResolution, submitClaimForClearance } from '@/lib/workflow';
import type { Distribution } from '@/lib/types';
import type { RoleAppProps } from './app-types';
import { Button, Card, KeyValue, LinkButton, MiniBars, PageHeader, PortalHero, Progress, SectionTitle, SimpleTable, StatCard, StatusBadge, Timeline, TrendChart } from './ui';

export function VendorApp(props: RoleAppProps) {
  const page = props.path[0] || 'home';
  if (page === 'distribution') return <VendorDistribution {...props}/>;
  if (page === 'menu-plan') return <VendorMenuPlan {...props}/>;
  if (page === 'qc') return <VendorQC {...props}/>;
  if (page === 'clearance') return <VendorClearance {...props}/>;
  if (page === 'claims') return <VendorClaims {...props}/>;
  if (page === 'logistics') return <VendorLogistics {...props}/>;
  if (page === 'anomalies') return <VendorAnomalies {...props}/>;
  if (page === 'history') return <VendorHistory {...props}/>;
  if (page === 'profile') return <VendorProfile {...props}/>;
  return <VendorHome {...props}/>;
}

function ownDist(state: RoleAppProps['state'], org: string) { return state.distributions.filter(d=>d.sppg===org); }

function toMinutes(value?: string) {
  if (!value) return null;
  const [h,m] = value.split(':').map(Number);
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
}

function shortDate(date: string) {
  if(!date) return '-';
  const parsed=new Date(`${date}T00:00:00+07:00`);
  return Number.isNaN(parsed.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { timeZone:'Asia/Jakarta', day: '2-digit', month: 'short' }).format(parsed);
}

function jakartaDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function jakartaTime() {
  return new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date());
}

function foodWasteRate(state: RoleAppProps['state'], org: string) {
  const ownSchools=new Set(schools.filter(s=>s.sppg===org).map(s=>s.name));
  const rows=Object.values(state.mealFeedback).filter(x=>!x.school||ownSchools.has(x.school));
  if(!rows.length) return 0;
  const weighted=rows.reduce((sum,row)=>sum+(row.level==='finished'?0:row.level==='partial'?35:70),0);
  return Number((weighted/rows.length).toFixed(1));
}

function vendorFeedbackCount(state: RoleAppProps['state'], org: string) {
  const ownSchools=new Set(schools.filter(s=>s.sppg===org).map(s=>s.name));
  return Object.values(state.mealFeedback).filter(x=>!x.school||ownSchools.has(x.school)).length;
}

function vendorDailyMetrics(ds: Distribution[]) {
  const groups = new Map<string, Distribution[]>();
  ds.filter(d => d.deliveredAt || d.qcScore !== undefined).forEach(d => groups.set(d.date, [...(groups.get(d.date) || []), d]));
  return [...groups.entries()].sort(([a],[b]) => a.localeCompare(b)).map(([date, rows]) => {
    const scored = rows.filter(d => d.qcScore !== undefined);
    const arrived = rows.filter(d => d.deliveredAt);
    const qc = scored.length ? scored.reduce((sum,d)=>sum+(d.qcScore||0),0) / scored.length : 0;
    const ontimeRows = arrived.filter(d => {
      const actual = toMinutes(d.deliveredAt); const plan = toMinutes(d.plannedTime);
      return actual !== null && plan !== null && actual <= plan + 5;
    });
    const delivered = rows.reduce((sum,d)=>sum+d.deliveredPortions,0);
    const target = rows.reduce((sum,d)=>sum+d.targetPortions,0);
    return {
      date,
      qc: Number(qc.toFixed(1)),
      ontime: arrived.length ? Number((ontimeRows.length / arrived.length * 100).toFixed(1)) : 0,
      fulfillment: target ? Number((delivered / target * 100).toFixed(1)) : 0,
      distributions: rows.length
    };
  });
}

function VendorHome({ user, state }: RoleAppProps) {
  const [metric,setMetric]=useState<'qc'|'ontime'|'fulfillment'>('qc');
  const ds=ownDist(state,user.organization);
  const qc=state.validations.filter(v=>v.sppg===user.organization);
  const alerts=state.anomalies.filter(a=>a.sppg===user.organization&&!['RESOLVED','CLOSED'].includes(a.status));
  const trend=vendorDailyMetrics(ds).slice(-7);
  const latestDate=trend.at(-1)?.date || [...ds].sort((a,b)=>b.date.localeCompare(a.date))[0]?.date || '';
  const currentRows=ds.filter(d=>d.date===latestDate);
  const currentScored=currentRows.filter(d=>d.qcScore!==undefined);
  const currentCompliance=currentScored.length?currentScored.reduce((a,d)=>a+(d.qcScore||0),0)/currentScored.length:0;
  const servedSchools=new Set(currentRows.filter(d=>d.deliveredPortions>0).map(d=>d.school)).size;
  const passedQc=currentScored.filter(d=>(d.qcScore||0)>=90).length;
  const readyClearances=state.clearances.filter(c=>c.sppg===user.organization&&['ELIGIBLE','VERIFIED'].includes(c.status));
  const readyAmount=readyClearances.reduce((sum,c)=>sum+c.amount,0);
  const points=trend.map(d=>({label:shortDate(d.date),value:d[metric]}));
  const metricTitle=metric==='qc'?'Skor QC rata-rata':metric==='ontime'?'Ketepatan waktu':'Pemenuhan porsi';
  const latestValue=points.at(-1)?.value || 0;
  const previousValue=points.at(-2)?.value ?? latestValue;
  const delta=Number((latestValue-previousValue).toFixed(1));
  return <>
    <PortalHero eyebrow="Portal Mitra SPPG" title={user.organization} text="Pantau distribusi, hasil quality control, kelengkapan clearance, dan tindak lanjut temuan dalam satu dashboard operasional.">
      <div className="rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 text-right backdrop-blur"><div className="text-[9px] font-black uppercase tracking-[.14em] text-emerald-300">Compliance Operasional</div><div className="mt-1 text-3xl font-black">{currentCompliance.toFixed(1)}%</div><div className="text-[10px] text-slate-300">{shortDate(latestDate)} • {currentScored.length} QC tercatat</div></div>
    </PortalHero>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><StatCard label="Distribusi" value={currentRows.length} note={shortDate(latestDate)} icon={<Truck className="h-5 w-5"/>}/><StatCard label="Sekolah Terlayani" value={servedSchools} note="Realisasi terbaru" icon={<Store className="h-5 w-5"/>}/><StatCard label="Lolos QC" value={passedQc} note={`${currentScored.length} sudah dinilai`} tone="green" icon={<CheckCircle2 className="h-5 w-5"/>}/><StatCard label="Perlu Review" value={alerts.length} tone="orange" icon={<AlertTriangle className="h-5 w-5"/>}/><StatCard label="Siap Klaim" value={readyClearances.length} note={readyAmount?rupiah(readyAmount):'Belum ada clearance eligible'} tone="blue" icon={<CircleDollarSign className="h-5 w-5"/>}/><StatCard label="Food Waste" value={`${foodWasteRate(state,user.organization)}%`} note={`${vendorFeedbackCount(state,user.organization)} umpan balik`} tone="slate" icon={<Boxes className="h-5 w-5"/>}/></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
      <Card>
        <SectionTitle title="Tren Operasional 7 Hari" subtitle="Dihitung dari catatan distribusi dan hasil QC yang tersimpan" action={<div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">{([['qc','QC'],['ontime','On-time'],['fulfillment','Porsi']] as const).map(([key,label])=><button key={key} onClick={()=>setMetric(key)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold ${metric===key?'bg-white text-navy-900 shadow-sm':'text-slate-500'}`}>{label}</button>)}</div>}/>
        <div className="mb-2 flex items-end justify-between"><div><div className="text-xs font-bold text-slate-500">{metricTitle}</div><div className="mt-1 text-2xl font-black text-navy-900">{latestValue.toFixed(1)}%</div></div><div className={`rounded-full px-2.5 py-1 text-[10px] font-black ${delta>=0?'bg-emerald-50 text-emerald-700':'bg-red-50 text-red-700'}`}>{delta>=0?'+':''}{delta.toFixed(1)} pp vs hari sebelumnya</div></div>
        <TrendChart points={points} minValue={Math.max(0,Math.floor(Math.min(...points.map(p=>p.value),80)/5)*5-5)}/>
      </Card>
      <Card><SectionTitle title="Butuh Tindakan" subtitle={`${alerts.length} laporan aktif`}/><div className="space-y-3">{alerts.slice(0,4).map(a=><Link key={a.id} href={`/vendor/anomalies/${a.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-amber-200 hover:bg-amber-50/40"><div className="rounded-xl bg-amber-50 p-2 text-amber-700"><AlertTriangle className="h-4 w-4"/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-extrabold text-navy-900">{a.title}</div><div className="text-[11px] text-slate-400">{a.school}</div></div><StatusBadge status={a.severity}/></Link>)}</div></Card>
    </div>
    <div className="mt-6"><Card><SectionTitle title="Distribusi Terbaru" subtitle="Catatan distribusi paling baru" action={<Link href="/vendor/distribution" className="text-xs font-extrabold text-gov-700">Lihat semua</Link>}/><SimpleTable headers={['ID','Tanggal','Sekolah','Porsi','Tiba','QC','Status']} rows={[...ds].sort((a,b)=>(b.date+b.plannedTime).localeCompare(a.date+a.plannedTime)).slice(0,8).map(d=>[d.id,shortDate(d.date),d.school,`${d.deliveredPortions}/${d.targetPortions}`,d.deliveredAt||'-',d.qcScore?`${d.qcScore}%`:'Menunggu',<StatusBadge key="s" status={d.status}/>])}/></Card></div>
  </>;
}

function VendorDistribution({ user, state, update, path }: RoleAppProps) {
  const servedSchools=schools.filter(s=>s.sppg===user.organization);
  const today=jakartaDate();
  const todayMenu=menus.find(m=>m.date===today) || menus[0];
  const [show,setShow]=useState(false);
  const [school,setSchool]=useState(servedSchools[0]?.name||'');
  const [menuId,setMenuId]=useState(todayMenu.id);
  const [date,setDate]=useState(today);
  const [plannedTime,setPlannedTime]=useState('11:30');
  const [portions,setPortions]=useState(servedSchools[0]?.students||500);
  const ds=ownDist(state,user.organization);
  const detail=path[1]?state.distributions.find(d=>d.id===path[1] && d.sppg===user.organization):null;

  const advance=(next:Distribution['status'])=>{
    if(!detail) return;
    const old=detail.status;
    update(prev=>({...prev,
      distributions:prev.distributions.map(d=>d.id===detail.id?{
        ...d,
        status:next,
        ...(next==='DELIVERED'?{deliveredPortions:d.targetPortions,deliveredAt:jakartaTime()}:{})
      }:d),
      auditLogs:[makeAuditLog(user.name,'vendor','DISTRIBUTION_STATUS_CHANGED','Distribution',detail.id,old,next),...prev.auditLogs]
    }));
  };

  if(detail) {
    const transitions:Partial<Record<Distribution['status'],{label:string,next:Distribution['status']}>>={
      SCHEDULED:{label:'Mulai Persiapan',next:'PREPARING'},
      PREPARING:{label:'Berangkatkan Distribusi',next:'IN_TRANSIT'},
      IN_TRANSIT:{label:'Tandai Tiba di Sekolah',next:'DELIVERED'},
      DELIVERED:{label:'Kirim ke Validasi Sekolah',next:'VALIDATION_PENDING'}
    };
    const action=transitions[detail.status];
    return <><PageHeader title={detail.id} subtitle="Detail distribusi" action={<LinkButton href="/vendor/distribution" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-2"><Card><SectionTitle title="Informasi Distribusi"/><div className="grid grid-cols-2 gap-3"><KeyValue label="Sekolah" value={detail.school}/><KeyValue label="SPPG" value={detail.sppg}/><KeyValue label="Menu" value={menus.find(m=>m.id===detail.menuId)?.name||'-'}/><KeyValue label="Target" value={`${detail.targetPortions} porsi`}/><KeyValue label="Delivered" value={`${detail.deliveredPortions} porsi`}/><KeyValue label="Jadwal" value={`${detail.date} ${detail.plannedTime}`}/><KeyValue label="Status" value={<StatusBadge status={detail.status}/>}/></div>{action&&<Button className="mt-5 w-full" onClick={()=>advance(action.next)}><Truck className="h-4 w-4"/>{action.label}</Button>}</Card><Card><SectionTitle title="Evidence Status"/><Timeline items={[{title:'Distribusi dibuat',time:`${detail.date} • ${detail.plannedTime}`,status:'SCHEDULED'},{title:'Tiba di sekolah',time:detail.deliveredAt||'Menunggu',status:detail.deliveredAt?'DELIVERED':'PENDING'},{title:'Quality Control',time:detail.qcScore?`${detail.qcScore}% score`:'Belum dilakukan',status:detail.qcScore?'VERIFIED':'PENDING'}]}/></Card></div></>;
  }

  const create=()=>{
    if(!school||!date||!menuId||portions<1) return;
    const compact=date.replaceAll('-','');
    const id=`DST-${compact}-${String(Date.now()).slice(-5)}`;
    const d:Distribution={id,date,school,sppg:user.organization,menuId,targetPortions:Number(portions),deliveredPortions:0,plannedTime,status:'SCHEDULED'};
    update(prev=>({...prev,distributions:[d,...prev.distributions],auditLogs:[makeAuditLog(user.name,'vendor','DISTRIBUTION_CREATED','Distribution',id,undefined,'SCHEDULED'),...prev.auditLogs]}));
    setShow(false);
  };
  return <><PageHeader title="Distribusi" subtitle="Kelola jadwal dan bukti distribusi ke sekolah terlayani." action={<Button onClick={()=>setShow(!show)}><Plus className="h-4 w-4"/>Distribusi Baru</Button>}/>{show&&<Card className="mb-5 border-brand-200"><SectionTitle title="Buat Distribusi Baru"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><label><span className="mb-1 block text-xs font-bold">Sekolah</span><select value={school} onChange={e=>{setSchool(e.target.value);const selected=servedSchools.find(x=>x.name===e.target.value);if(selected)setPortions(selected.students)}} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">{servedSchools.map(s=><option key={s.id}>{s.name}</option>)}</select></label><label><span className="mb-1 block text-xs font-bold">Menu</span><select value={menuId} onChange={e=>setMenuId(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">{menus.filter(m=>state.menuActive[m.id]!==false).map(m=><option value={m.id} key={m.id}>{m.day} • {m.name}</option>)}</select></label><label><span className="mb-1 block text-xs font-bold">Tanggal</span><input type="date" value={date} onChange={e=>setDate(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"/></label><label><span className="mb-1 block text-xs font-bold">Jam</span><input type="time" value={plannedTime} onChange={e=>setPlannedTime(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"/></label><label><span className="mb-1 block text-xs font-bold">Target Porsi</span><input type="number" min="1" value={portions} onChange={e=>setPortions(Number(e.target.value))} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"/></label></div><div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={()=>setShow(false)}>Batal</Button><Button onClick={create}>Simpan Distribusi</Button></div></Card>}<Card><SimpleTable headers={['ID','Tanggal','Sekolah','Menu','Porsi','QC','Status','']} rows={[...ds].sort((a,b)=>(b.date+b.plannedTime).localeCompare(a.date+a.plannedTime)).map(d=>[d.id,d.date,d.school,menus.find(m=>m.id===d.menuId)?.name||'-',`${d.deliveredPortions}/${d.targetPortions}`,d.qcScore?`${d.qcScore}%`:'-',<StatusBadge key="st" status={d.status}/>,<Link key="ln" href={`/vendor/distribution/${d.id}`} className="font-bold text-brand-700">Detail</Link>])}/></Card></>;
}

function VendorMenuPlan({ user, state, update }: RoleAppProps) {
  const nextWeek=menus.slice(5,10).filter(m=>state.menuActive[m.id]!==false);
  const liveVotes=Object.values(state.votes);
  const voteCounts=nextWeek.map(m=>(m.votes||0)+liveVotes.filter(id=>id===m.id).length);
  const totalVotes=voteCounts.reduce((a,b)=>a+b,0);
  const scheduled=state.distributions.filter(d=>d.sppg===user.organization && d.date>=nextWeek[0]?.date).reduce((a,d)=>a+d.targetPortions,0);
  const topIndex=voteCounts.reduce((best,v,i)=>v>(voteCounts[best]??-1)?i:best,0);
  const toggle=(id:string)=>update(prev=>({...prev,vendorMenuReady:{...prev.vendorMenuReady,[id]:!prev.vendorMenuReady[id]},auditLogs:[makeAuditLog(user.name,'vendor',prev.vendorMenuReady[id]?'MENU_PRODUCTION_UNREADY':'MENU_PRODUCTION_READY','Menu',id),...prev.auditLogs]}));
  return <><PageHeader title="Rencana Menu & Produksi" subtitle="Ringkasan menu, preferensi siswa, dan kesiapan produksi untuk pekan berikutnya."/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Menu Terjadwal" value={nextWeek.length} icon={<CalendarDays className="h-5 w-5"/>}/><StatCard label="Porsi Terdata" value={scheduled.toLocaleString('id-ID')} icon={<Truck className="h-5 w-5"/>}/><StatCard label="Menu Siap Produksi" value={nextWeek.filter(m=>state.vendorMenuReady[m.id]).length} tone="green" icon={<CheckCircle2 className="h-5 w-5"/>}/><StatCard label="Preferensi Tertinggi" value={nextWeek[topIndex]?.name||'-'} tone="blue" icon={<Utensils className="h-5 w-5"/>}/></div><div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><Card><SectionTitle title="Rencana Pekan Depan" subtitle={`${nextWeek[0]?.date||'-'} – ${nextWeek.at(-1)?.date||'-'}`}/><div className="space-y-3">{nextWeek.map((m)=><div key={m.id} className="grid gap-3 rounded-xl border border-slate-100 p-3 sm:grid-cols-[84px_1fr_auto] sm:items-center"><img src={m.image} alt={m.name} className="h-16 w-20 rounded-xl object-cover"/><div><div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.day} • {m.date}</div><div className="mt-1 text-sm font-black text-navy-900">{m.name}</div><div className="mt-1 text-xs text-slate-500">{m.components.slice(0,3).join(' • ')}</div></div><button onClick={()=>toggle(m.id)} className={`h-10 rounded-xl px-3 text-xs font-extrabold ${state.vendorMenuReady[m.id]?'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-600'}`}>{state.vendorMenuReady[m.id]?'Siap produksi':'Tandai siap'}</button></div>)}</div></Card><Card><SectionTitle title="Preferensi Menu" subtitle={`${totalVotes.toLocaleString('id-ID')} suara tercatat`}/><div className="space-y-4">{nextWeek.map((m,i)=>{const pct=totalVotes?Math.round(voteCounts[i]/totalVotes*100):0;return <div key={m.id}><div className="mb-1 flex justify-between text-xs"><span className="font-bold text-slate-700">{m.name}</span><span className="font-black text-gov-700">{pct}%</span></div><Progress value={pct} tone={pct>=25?'green':'blue'}/></div>})}</div><div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs leading-5 text-slate-600"><b>Catatan produksi:</b> gunakan preferensi sebagai sinyal perencanaan, lalu sesuaikan dengan standar gizi dan jadwal distribusi.</div></Card></div></>;
}

function VendorQC({ user, state }: RoleAppProps){const vals=state.validations.filter(v=>v.sppg===user.organization);return <><PageHeader title="Quality Control" subtitle="Hasil Sidak Nalar tidak dapat diedit vendor; vendor hanya melihat dan menindaklanjuti."/><Card><SimpleTable headers={['Tanggal','Sekolah','Pengawas','AI Score','Keputusan','Final Status']} rows={vals.map(v=>[v.date,v.school,v.teacher,<b key="score">{v.aiScore}%</b>,v.humanStatus,<StatusBadge key="status" status={v.finalStatus}/>])}/></Card></>}

function VendorClearance({ user, state, path }: RoleAppProps){
  const cs=[...state.clearances].filter(c=>c.sppg===user.organization).sort((a,b)=>(b.periodDate||'').localeCompare(a.periodDate||''));
  const detail=path[1]?cs.find(c=>c.id===path[1]):null;
  if(detail){
    const evidence=clearanceEvidence(state,detail);
    const claim=claimForClearance(state,detail.id);
    return <><PageHeader title={detail.id} subtitle="Detail bukti distribusi yang menjadi dasar clearance" action={<LinkButton href="/vendor/clearance" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><Card><SectionTitle title="Evidence Checklist" subtitle={detail.school||evidence.distributions[0]?.school}/><div className="space-y-3">{evidence.evidenceItems.map(item=><div key={item.key} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${item.ok?'border-emerald-100 bg-emerald-50/60':'border-amber-100 bg-amber-50/60'}`}><div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.ok?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{item.ok?'✓':'!'}</div><div><div className="text-sm font-bold text-slate-700">{item.label}</div><div className="mt-0.5 text-xs leading-5 text-slate-500">{item.detail}</div></div></div>)}</div>{evidence.distributions.map(d=><div key={d.id} className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs text-slate-600"><b>{d.id}</b> • {d.school} • <StatusBadge status={d.status}/></div>)}</Card><Card><SectionTitle title="Clearance Summary"/><div className="space-y-2"><KeyValue label="SPPG" value={detail.sppg}/><KeyValue label="Sekolah" value={detail.school||evidence.distributions[0]?.school||'-'}/><KeyValue label="Periode" value={detail.period}/><KeyValue label="Evidence Score" value={`${evidence.score}%`}/><KeyValue label="Status" value={<StatusBadge status={detail.status}/>}/><KeyValue label="Status Klaim" value={claim?<StatusBadge status={claim.status}/>:<span className="text-slate-500">Belum diajukan</span>}/></div>{detail.holdReason&&<div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><b>Alasan tertahan:</b><br/>{detail.holdReason}</div>}{detail.status==='ELIGIBLE'&&!claim&&<LinkButton href="/vendor/claims" className="mt-5 w-full">Ajukan Klaim</LinkButton>}{detail.status==='PENDING'&&<div className="mt-5 rounded-xl bg-blue-50 p-3 text-xs leading-5 text-blue-800">Clearance belum dapat diajukan karena bukti belum lengkap.</div>}{detail.status==='ON_HOLD'&&<LinkButton href="/vendor/anomalies" variant="secondary" className="mt-5 w-full">Lihat Temuan</LinkButton>}</Card></div></>;
  }
  return <><PageHeader title="Digital Clearance" subtitle="Status clearance dihitung dari distribusi, foto, GPS/timestamp, AI QC, verifikasi manusia, dan anomali aktif."/><div className="grid gap-4 lg:grid-cols-2">{cs.map(c=>{const ev=clearanceEvidence(state,c);const claim=claimForClearance(state,c.id);return <Card key={c.id}><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold text-slate-400">{c.id}</div><div className="mt-1 text-lg font-black">{c.period}</div><div className="mt-1 text-xs text-slate-500">{c.school||ev.distributions[0]?.school||'-'}</div></div><StatusBadge status={c.status}/></div><div className="mt-4"><Progress value={ev.score} label="Evidence Completeness" tone={ev.score===100?'green':c.status==='ON_HOLD'?'orange':'blue'}/></div>{c.holdReason&&<div className="mt-3 text-xs font-semibold text-amber-700">{c.holdReason}</div>}<div className="mt-4 flex items-center justify-between gap-3"><div><div className="text-[10px] font-bold uppercase text-slate-400">Klaim</div><div className="mt-1">{claim?<StatusBadge status={claim.status}/>:<span className="text-xs font-bold text-slate-500">Belum diajukan</span>}</div></div><LinkButton href={`/vendor/clearance/${c.id}`} variant="secondary">Lihat Evidence</LinkButton></div></Card>})}</div></>;
}

function VendorClaims({user,state,update,path}:RoleAppProps){
  const myClaims=state.claims.filter(c=>c.sppg===user.organization);
  const myClearances=[...state.clearances].filter(c=>c.sppg===user.organization).sort((a,b)=>(b.periodDate||'').localeCompare(a.periodDate||''));
  const [amountDraft,setAmountDraft]=useState<Record<string,string>>({});
  const [clarification,setClarification]=useState('Dokumen pendukung dan penjelasan operasional telah dilengkapi.');
  const detail=path[1]?myClaims.find(c=>c.id===path[1]):null;
  const submitClarification=()=>{
    if(!detail)return;
    update(prev=>{
      const clearance=prev.clearances.find(c=>c.id===detail.clearanceId);
      const claim=prev.claims.find(c=>c.id===detail.id);
      if(!clearance||!claim||clearance.decision!=='CLARIFICATION'||claim.status!=='UNDER_REVIEW')return prev;
      let next={...prev,claims:prev.claims.map(c=>c.id===claim.id?{...c,status:'SUBMITTED' as const,vendorClarification:clarification,note:'Klarifikasi vendor telah dikirim. Menunggu review ulang pengawas.'}:c),clearances:prev.clearances.map(c=>c.id===clearance.id?{...c,decision:'AUTO' as const,holdReason:undefined,decisionNote:undefined}:c),auditLogs:[makeAuditLog(user.name,'vendor','CLAIM_CLARIFICATION_SUBMITTED','Claim',claim.id,'UNDER_REVIEW','SUBMITTED'),...prev.auditLogs]};
      next=recalculateClearances(next);
      return next;
    });
  };
  const submitClaim=(clearanceId:string)=>{
    const clearance=state.clearances.find(c=>c.id===clearanceId&&c.sppg===user.organization);
    if(!clearance||!['ELIGIBLE','VERIFIED'].includes(clearance.status)||claimForClearance(state,clearance.id))return;
    const amount=Number((amountDraft[clearance.id]||String(clearance.amount||0)).replace(/[^0-9.]/g,''));
    if(!Number.isFinite(amount)||amount<=0){window.alert('Masukkan nilai klaim yang valid.');return;}
    update(prev=>submitClaimForClearance(prev,clearance.id,amount,user.name));
  };
  if(detail){
    const clearance=state.clearances.find(c=>c.id===detail.clearanceId);
    const needsClarification=clearance?.decision==='CLARIFICATION'&&detail.status==='UNDER_REVIEW';
    return <><PageHeader title={detail.id} subtitle="Detail klaim vendor" action={<LinkButton href="/vendor/claims" variant="secondary">Kembali</LinkButton>}/><Card className="max-w-3xl"><div className="grid gap-3 sm:grid-cols-2"><KeyValue label="Periode" value={detail.period}/><KeyValue label="Nilai Klaim" value={rupiah(detail.amount)}/><KeyValue label="Clearance" value={clearance?<StatusBadge status={clearance.status}/>: '-'}/><KeyValue label="Status Klaim" value={<StatusBadge status={detail.status}/>}/></div>{detail.note&&<div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-6 text-slate-600">{detail.note}</div>}{detail.vendorClarification&&<div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><b>Klarifikasi vendor:</b><br/>{detail.vendorClarification}</div>}{needsClarification&&<div className="mt-5"><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Klarifikasi tambahan</span><textarea rows={4} value={clarification} onChange={e=>setClarification(e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"/></label><Button className="mt-3 w-full" onClick={submitClarification}>Kirim Klarifikasi</Button></div>}<div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">Klaim hanya dapat diajukan setelah clearance berstatus ELIGIBLE. Setelah diajukan, pengawas dapat menyetujui, menahan, atau meminta klarifikasi.</div></Card></>;
  }
  return <><PageHeader title="Klaim Vendor" subtitle="Ajukan klaim hanya setelah bukti distribusi lolos digital clearance."/><div className="grid gap-4 lg:grid-cols-2">{myClearances.map(c=>{const claim=claimForClearance(state,c.id);const canSubmit=['ELIGIBLE','VERIFIED'].includes(c.status)&&!claim;return <Card key={c.id}><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold text-slate-400">{c.id}</div><div className="mt-1 font-black">{c.period}</div><div className="text-xs text-slate-500">{c.school||'-'}</div></div><StatusBadge status={c.status}/></div>{claim?<div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="flex items-center justify-between gap-3"><div><div className="text-xs font-bold text-slate-400">{claim.id}</div><div className="mt-1 font-extrabold">{rupiah(claim.amount)}</div></div><StatusBadge status={claim.status}/></div><LinkButton href={`/vendor/claims/${claim.id}`} variant="secondary" className="mt-3 w-full">Lihat Klaim</LinkButton></div>:<div className="mt-4"><label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Nilai Klaim</span><input value={amountDraft[c.id]??(c.amount?String(c.amount):'')} onChange={e=>setAmountDraft({...amountDraft,[c.id]:e.target.value})} disabled={!canSubmit} inputMode="numeric" placeholder="Masukkan nilai klaim" className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm disabled:bg-slate-50"/></label><Button className="mt-3 w-full" disabled={!canSubmit} onClick={()=>submitClaim(c.id)}><CircleDollarSign className="h-4 w-4"/>Ajukan Klaim</Button>{!canSubmit&&<div className="mt-2 text-xs leading-5 text-slate-500">{c.status==='ON_HOLD'?'Klaim belum dapat diajukan karena clearance ditahan.':c.status==='PENDING'||c.status==='NOT_READY'?'Lengkapi proses validasi terlebih dahulu.':'Klaim sudah tercatat.'}</div>}</div>}</Card>})}</div></>;
}

function VendorLogistics({user,state}:RoleAppProps){
  const ds=ownDist(state,user.organization);
  const recent=vendorDailyMetrics(ds).slice(-7);
  const dateTotals=recent.map(d=>({label:shortDate(d.date),value:ds.filter(x=>x.date===d.date).reduce((a,x)=>a+x.deliveredPortions,0)}));
  const upcoming=ds.filter(d=>['SCHEDULED','PREPARING','IN_TRANSIT'].includes(d.status));
  const projected=upcoming.reduce((a,d)=>a+d.targetPortions,0);
  const estimatedHpp=projected*14920;
  const favorite=[...menus].sort((a,b)=>(b.votes||0)-(a.votes||0))[0];
  const base=Math.max(projected,1);
  const ingredients=[
    ['Beras',`${Math.round(base*.15)} kg`,`${Math.round(base*.16)} kg`,'Aman'],
    ['Protein utama',`${Math.round(base*.085)} kg`,`${Math.round(base*.078)} kg`,`Tambah ${Math.max(0,Math.round(base*.007))} kg`],
    ['Sayur',`${Math.round(base*.07)} kg`,`${Math.round(base*.074)} kg`,'Aman'],
    ['Buah',`${Math.round(base*.065)} kg`,`${Math.round(base*.069)} kg`,'Aman'],
    ['Susu UHT',`${base.toLocaleString('id-ID')} unit`,`${Math.round(base*1.03).toLocaleString('id-ID')} unit`,'Aman']
  ];
  return <><PageHeader title="Logistik & Forecast" subtitle="Proyeksi kebutuhan bahan baku dan realisasi porsi berdasarkan distribusi yang tersimpan."/><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Projected Portions" value={projected.toLocaleString('id-ID')} note={`${upcoming.length} distribusi aktif`} icon={<PackageCheck className="h-5 w-5"/>}/><StatCard label="Estimated HPP" value={new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',notation:'compact',maximumFractionDigits:1}).format(estimatedHpp)} icon={<CircleDollarSign className="h-5 w-5"/>}/><StatCard label="Expected Waste" value={`${foodWasteRate(state,user.organization)}%`} note={`${vendorFeedbackCount(state,user.organization)} umpan balik`} tone="green" icon={<Boxes className="h-5 w-5"/>}/><StatCard label="Menu Favorit" value={favorite?.name||'-'} tone="slate" icon={<ClipboardCheck className="h-5 w-5"/>}/></div><div className="mt-6 grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><Card><SectionTitle title="Realisasi Porsi 7 Hari" subtitle="Jumlah porsi terkirim per hari dari catatan distribusi"/><MiniBars values={dateTotals.map(x=>x.value)} labels={dateTotals.map(x=>x.label)}/></Card><Card><SectionTitle title="Radar Bahan Baku" subtitle="Kebutuhan dihitung dari rencana porsi aktif"/><SimpleTable headers={['Bahan','Kebutuhan','Stok','Saran']} rows={ingredients.map(r=>[...r.slice(0,3),<StatusBadge key={r[0]} status={r[3]==='Aman'?'Verified':'Review'}/>])}/></Card></div></>}

function VendorAnomalies({user,state,update,path}:RoleAppProps){
  const mine=state.anomalies.filter(a=>a.sppg===user.organization);
  const detail=path[1]?state.anomalies.find(a=>a.id===path[1] && a.sppg===user.organization):null;
  const [response,setResponse]=useState('Porsi ulang telah diverifikasi dan alat serving dikalibrasi sesuai SOP.');
  const submit=()=>{
    if(!detail)return;
    const canRespond=!detail.vendorResponse||detail.status==='AWAITING_VENDOR';
    if(!canRespond)return;
    update(prev=>{
      const responseText=detail.vendorResponse&&detail.status==='AWAITING_VENDOR'?`${detail.vendorResponse}\nKlarifikasi tambahan: ${response}`:response;
      let next={...prev,anomalies:prev.anomalies.map(a=>a.id===detail.id?{...a,vendorResponse:responseText,status:'CORRECTIVE_ACTION' as const}:a),correctiveActions:[{id:`CA-${Date.now()}`,anomalyId:detail.id,assignedTo:user.organization,description:response,deadline:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()+24*60*60*1000)),status:'SUBMITTED' as const},...prev.correctiveActions],auditLogs:[makeAuditLog(user.name,'vendor',detail.status==='AWAITING_VENDOR'?'ANOMALY_CLARIFICATION_SUBMITTED':'CORRECTIVE_ACTION_SUBMITTED','Anomaly',detail.id,detail.status,'CORRECTIVE_ACTION'),...prev.auditLogs]};
      next=recalculateClearances(next);
      next=reopenClaimsAfterResolution(next);
      return next;
    });
  };
  if(detail){const canRespond=!detail.vendorResponse||detail.status==='AWAITING_VENDOR';return <><PageHeader title={detail.id} subtitle={detail.title} action={<LinkButton href="/vendor/anomalies" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-2"><Card><div className="flex gap-2"><StatusBadge status={detail.severity}/><StatusBadge status={detail.status}/></div><p className="mt-4 text-sm leading-6 text-slate-600">{detail.description}</p><div className="mt-4 grid grid-cols-2 gap-3"><KeyValue label="Sekolah" value={detail.school}/><KeyValue label="Kategori" value={detail.category}/></div>{detail.vendorResponse&&<div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs leading-5 text-blue-900"><b>Respons terakhir:</b><br/>{detail.vendorResponse}</div>}<div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Selama temuan ini masih aktif, clearance yang terkait otomatis berstatus ON HOLD.</div></Card><Card><SectionTitle title={detail.status==='AWAITING_VENDOR'?'Klarifikasi Tambahan':'Respons / Corrective Action'}/><textarea rows={5} value={canRespond?response:(detail.vendorResponse||'')} onChange={e=>setResponse(e.target.value)} disabled={!canRespond} className="w-full rounded-xl border border-slate-200 p-3 text-sm disabled:bg-slate-50"/><Button onClick={submit} disabled={!canRespond} className="mt-3 w-full"><Send className="h-4 w-4"/>{!canRespond?'Sudah Dikirim':detail.status==='AWAITING_VENDOR'?'Kirim Klarifikasi':'Kirim Tindakan Korektif'}</Button></Card></div></>;} 
  return <><PageHeader title="Anomali SPPG" subtitle="Temuan aktif menahan clearance sampai tindakan korektif diverifikasi pengawas."/><Card><SimpleTable headers={['Ticket','Sekolah','Kategori','Severity','Status','']} rows={mine.map(a=>[a.id,a.school,a.category,<StatusBadge key="s" status={a.severity}/>,<StatusBadge key="st" status={a.status}/>,<Link key="l" href={`/vendor/anomalies/${a.id}`} className="font-bold text-brand-700">Tindak Lanjut</Link>])}/></Card></>;
}

function VendorHistory({user,state}:RoleAppProps){
  const logs=state.auditLogs.filter(l=>l.actor===user.name || state.distributions.some(d=>d.sppg===user.organization && d.id===l.entityId));
  return <><PageHeader title="Riwayat Aktivitas" subtitle="Jejak aktivitas vendor dan distribusi terkait pada sistem."/><Card><SimpleTable headers={['Timestamp','Actor','Action','Entity','Status']} rows={logs.map(l=>[l.timestamp,l.actor,l.action.replaceAll('_',' '),`${l.entity} • ${l.entityId}`,l.newStatus?<StatusBadge key="s" status={l.newStatus}/>:<span key="x">-</span>])}/></Card></>;
}

function VendorProfile({user,state}:RoleAppProps){
  const ds=ownDist(state,user.organization);
  const info=sppgs.find(s=>s.name===user.organization);
  const metrics=vendorDailyMetrics(ds);
  const latestCompliance=metrics.at(-1)?.qc ?? info?.compliance ?? 0;
  const served=new Set(ds.map(d=>d.school)).size || info?.schools || 0;
  return <><PageHeader title="Profil SPPG" subtitle="Identitas dan ringkasan kepatuhan SPPG."/><div className="mx-auto max-w-3xl"><Card><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-brand-700"><Store className="h-8 w-8"/></div><div><h2 className="text-xl font-black">{user.organization}</h2><p className="text-sm text-slate-500">{info?.code||'-'} • {info?.region||'-'}</p><div className="mt-2"><StatusBadge status="Active"/></div></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><KeyValue label="PIC" value={user.name}/><KeyValue label="Sekolah dengan Aktivitas" value={served}/><KeyValue label="Compliance" value={`${latestCompliance}%`}/></div><div className="mt-5"><Progress value={latestCompliance} label="Compliance Summary" tone={latestCompliance>=90?'green':'orange'}/></div></Card></div></>}

function rupiah(n:number){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)}
