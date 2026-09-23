'use client';

import Link from 'next/link';
import { AlertTriangle, BarChart3, Building2, CheckCircle2, CircleDollarSign, Download, FileClock, MapPin, ShieldCheck, TrendingDown, TrendingUp, Truck, Users2, Utensils } from 'lucide-react';
import { useState } from 'react';
import { menus, sppgs } from '@/lib/data';
import { LiveGovernmentMap } from './live-government-map';
import { makeAuditLog } from '@/lib/store';
import { claimForClearance, clearanceEvidence, decideClearanceWorkflow, recalculateClearances, reopenClaimsAfterResolution, resolveAnomalyWorkflow } from '@/lib/workflow';
import type { RoleAppProps } from './app-types';
import { Button, Card, KeyValue, LinkButton, MiniBars, PageHeader, PortalHero, Progress, SearchInput, SectionTitle, SimpleTable, StatCard, StatusBadge, Timeline, TrendChart } from './ui';

export function GovernmentApp(props: RoleAppProps) {
  const page = props.path[0] || 'home';
  if (page === 'map') return <GovernmentMap {...props}/>;
  if (page === 'sppg') return <GovernmentSppg {...props}/>;
  if (page === 'distributions') return <GovernmentDistributions {...props}/>;
  if (page === 'food-waste') return <GovernmentFoodWaste {...props}/>;
  if (page === 'anomalies') return <GovernmentAnomalies {...props}/>;
  if (page === 'corrective-actions') return <GovernmentCorrective {...props}/>;
  if (page === 'audit') return <GovernmentAudit {...props}/>;
  if (page === 'clearance') return <GovernmentClearance {...props}/>;
  if (page === 'reports') return <GovernmentReports {...props}/>;
  if (page === 'analytics') return <GovernmentAnalytics {...props}/>;
  return <GovernmentHome {...props}/>;
}

function governmentDailyMetrics(rows: RoleAppProps['state']['distributions']) {
  const groups = new Map<string, typeof rows>();
  rows.filter(d=>d.deliveredAt || d.qcScore!==undefined).forEach(d=>groups.set(d.date,[...(groups.get(d.date)||[]),d]));
  return [...groups.entries()].sort(([a],[b])=>a.localeCompare(b)).map(([date,ds])=>{
    const scored=ds.filter(d=>d.qcScore!==undefined);
    const arrived=ds.filter(d=>d.deliveredAt);
    const compliance=scored.length?scored.reduce((a,d)=>a+(d.qcScore||0),0)/scored.length:0;
    const validationRate=arrived.length?scored.length/arrived.length*100:0;
    return {date,compliance:Number(compliance.toFixed(1)),validationRate:Number(validationRate.toFixed(1)),portions:ds.reduce((a,d)=>a+d.deliveredPortions,0)};
  });
}

function mapRiskRank(risk:string){return risk==='Critical'?4:risk==='Warning'?3:risk==='Watch'?2:1}

function liveSppgs(state:RoleAppProps['state']) {
  return sppgs.map(s=>{
    const ds=state.distributions.filter(d=>d.sppg===s.name);
    const latest=governmentDailyMetrics(ds).at(-1);
    const active=state.anomalies.filter(a=>a.sppg===s.name&&!['RESOLVED','CLOSED'].includes(a.status));
    const compliance=latest?.compliance ?? s.compliance;
    const hasCritical=active.some(a=>a.severity==='Critical');
    const risk=hasCritical||compliance<85?'Critical':compliance<90||active.length>=4?'Warning':compliance<95||active.length>=2?'Watch':'Normal';
    return {...s,compliance,anomalies:active.length,risk};
  });
}

function provinceSummaries(items:ReturnType<typeof liveSppgs>){
  const groups=new Map<string,typeof items>();
  items.forEach(s=>groups.set(s.province,[...(groups.get(s.province)||[]),s]));
  return [...groups.entries()].map(([province,rows])=>({province,compliance:Number((rows.reduce((a,r)=>a+r.compliance,0)/rows.length).toFixed(1)),risk:[...rows].sort((a,b)=>mapRiskRank(b.risk)-mapRiskRank(a.risk))[0]?.risk||'Normal',count:rows.length})).sort((a,b)=>a.province.localeCompare(b.province));
}

function GovernmentHome({state}:RoleAppProps){
  const live=liveSppgs(state);
  const active=state.anomalies.filter(a=>!['RESOLVED','CLOSED'].includes(a.status));
  const trend=governmentDailyMetrics(state.distributions).slice(-7);
  const latestDate=trend.at(-1)?.date||'';
  const latestRows=state.distributions.filter(d=>d.date===latestDate&&(d.deliveredAt||d.qcScore!==undefined));
  const latest=trend.at(-1);
  const critical=active.filter(a=>a.severity==='Critical').length;
  const wasteFeedback=Object.values(state.mealFeedback);
  const wasteRate=wasteFeedback.length?Number((wasteFeedback.reduce((sum,x)=>sum+(x.level==='finished'?0:x.level==='partial'?35:70),0)/wasteFeedback.length).toFixed(1)):0;
  return <>
    <PortalHero eyebrow="Pusat Pengawasan & Intelijen Gizi" title="My MBG Intelligence Center" text="Monitoring berbasis risiko untuk melihat kinerja distribusi, kepatuhan SPPG, dan anomali prioritas secara cepat dan dapat ditelusuri.">
      <div className="grid grid-cols-2 gap-x-5 gap-y-2 rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 backdrop-blur"><div><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Wilayah Aktif</div><div className="mt-1 text-sm font-black">{new Set(sppgs.map(s=>s.province)).size} Provinsi</div></div><div><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Update</div><div className="mt-1 text-sm font-black text-emerald-300">{latestDate?shortGovDate(latestDate):'Terkini'}</div></div></div>
    </PortalHero>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6"><StatCard label="Porsi Dipantau" value={(latest?.portions||0).toLocaleString('id-ID')} note={latestDate?shortGovDate(latestDate):'Hari ini'} icon={<Users2 className="h-5 w-5"/>}/><StatCard label="Validation Rate" value={`${(latest?.validationRate||0).toFixed(1)}%`} tone="green" icon={<CheckCircle2 className="h-5 w-5"/>}/><StatCard label="Compliance" value={`${(latest?.compliance||0).toFixed(1)}%`} tone={(latest?.compliance||0)>=90?'green':'orange'} icon={<ShieldCheck className="h-5 w-5"/>}/><StatCard label="Anomali Aktif" value={active.length} tone="orange" icon={<AlertTriangle className="h-5 w-5"/>}/><StatCard label="Critical" value={critical} tone="red" icon={<AlertTriangle className="h-5 w-5"/>}/><StatCard label="Food Waste Signal" value={`${wasteRate}%`} tone="slate" icon={<TrendingUp className="h-5 w-5"/>}/></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[1.15fr_.85fr]"><Card><SectionTitle title="Tren Kepatuhan" subtitle="Rata-rata skor QC dari distribusi yang tercatat"/><TrendChart points={trend.map(d=>({label:shortGovDate(d.date),value:d.compliance}))} minValue={70}/></Card><Card><SectionTitle title="Perlu Perhatian" subtitle="Prioritas risiko tertinggi"/><div className="space-y-3">{active.sort((a,b)=>severityRank(b.severity)-severityRank(a.severity)).slice(0,5).map(a=><Link key={a.id} href={`/government/anomalies/${a.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-red-200 hover:bg-red-50/30"><div className="rounded-xl bg-red-50 p-2 text-red-700"><AlertTriangle className="h-4 w-4"/></div><div className="min-w-0 flex-1"><div className="truncate text-xs font-extrabold text-navy-900">{a.title}</div><div className="text-[11px] text-slate-400">{a.sppg} • {a.school}</div></div><StatusBadge status={a.severity}/></Link>)}</div></Card></div>
    <div className="mt-6 grid gap-5 xl:grid-cols-[.8fr_1.2fr]"><GovernmentMapPreview state={state}/><Card><SectionTitle title="Ringkasan Risiko SPPG" action={<Link href="/government/sppg" className="text-xs font-extrabold text-gov-700">Lihat semua</Link>}/><SimpleTable headers={['SPPG','Wilayah','Compliance','Anomali','Risk']} rows={live.slice(0,6).map(s=>[s.name,s.region,`${s.compliance}%`,s.anomalies,<StatusBadge key={s.id} status={s.risk}/>])}/></Card></div>
  </>
}

function shortGovDate(date:string){return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short'}).format(new Date(`${date}T00:00:00`))}

function GovernmentMapPreview({state}:{state:RoleAppProps['state']}){const items=liveSppgs(state);return <Card><SectionTitle title="Peta Monitoring" subtitle="Klik marker untuk melihat detail SPPG"/><LiveGovernmentMap items={items} compact/></Card>}

function GovernmentMap({state}:RoleAppProps){
  const [province,setProvince]=useState('Semua');
  const [risk,setRisk]=useState('Semua');
  const live=liveSppgs(state);
  const provinces=['Semua',...new Set(live.map(s=>s.province))];
  const filtered=live.filter(s=>(province==='Semua'||s.province===province)&&(risk==='Semua'||s.risk===risk));
  const summaries=provinceSummaries(live);
  return <><PageHeader title="Peta Monitoring" subtitle="Peta interaktif SPPG. Gunakan filter lalu klik marker untuk melihat compliance, jumlah sekolah, anomali, dan tingkat risiko."/>
    <div className="mb-4 flex flex-wrap items-center gap-2"><span className="mr-1 text-xs font-bold text-slate-500">Wilayah</span>{provinces.map(p=><button key={p} onClick={()=>setProvince(p)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${province===p?'border-navy-900 bg-navy-900 text-white':'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{p}</button>)}<span className="ml-2 mr-1 text-xs font-bold text-slate-500">Risiko</span>{['Semua','Normal','Watch','Warning','Critical'].map(r=><button key={r} onClick={()=>setRisk(r)} className={`rounded-lg border px-3 py-2 text-xs font-bold ${risk===r?'border-gov-700 bg-gov-700 text-white':'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{r}</button>)}</div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]"><Card className="p-3"><LiveGovernmentMap items={filtered}/></Card><Card><SectionTitle title="Ringkasan Wilayah" subtitle={`${filtered.length} SPPG tampil di peta`}/><div className="space-y-3">{summaries.map(x=><button key={x.province} onClick={()=>setProvince(x.province)} className={`w-full rounded-xl border p-3 text-left transition ${province===x.province?'border-gov-300 bg-gov-50':'border-slate-100 hover:border-slate-200 hover:bg-slate-50'}`}><div className="flex items-center justify-between"><div><div className="text-sm font-extrabold">{x.province}</div><div className="text-xs text-slate-400">{x.count} SPPG • Compliance {x.compliance}%</div></div><StatusBadge status={x.risk}/></div></button>)}</div></Card></div>
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{filtered.map(s=><Card key={s.id}><div className="flex items-start justify-between"><div><div className="text-xs font-bold text-slate-400">{s.code}</div><div className="mt-1 font-extrabold">{s.name}</div><div className="text-xs text-slate-500">{s.region}</div></div><StatusBadge status={s.risk}/></div><div className="mt-4"><Progress value={s.compliance} label="Compliance" tone={s.compliance>=95?'green':s.compliance>=90?'orange':'red'}/></div></Card>)}</div>
  </>
}

function GovernmentSppg({path,state}:RoleAppProps){
  const [q,setQ]=useState('');
  const detail=path[1]?sppgs.find(s=>s.id===path[1]):null;
  if(detail){
    const anomalies=state.anomalies.filter(a=>a.sppg===detail.name);
    const activeAnomalies=anomalies.filter(a=>!['RESOLVED','CLOSED'].includes(a.status));
    const vals=state.validations.filter(v=>v.sppg===detail.name);
    const ds=state.distributions.filter(d=>d.sppg===detail.name);
    const trend=governmentDailyMetrics(ds).slice(-7);
    const liveDetail=liveSppgs(state).find(s=>s.id===detail.id);
    const compliance=liveDetail?.compliance ?? detail.compliance;
    const risk=liveDetail?.risk ?? detail.risk;
    return <><PageHeader title={detail.name} subtitle={`${detail.code} • ${detail.region}`} action={<LinkButton href="/government/sppg" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Sekolah" value={detail.schools} icon={<Building2 className="h-5 w-5"/>}/><StatCard label="Compliance" value={`${compliance}%`} tone={compliance>=95?'green':'orange'} icon={<ShieldCheck className="h-5 w-5"/>}/><StatCard label="Validasi" value={vals.length} icon={<CheckCircle2 className="h-5 w-5"/>}/><StatCard label="Anomali Aktif" value={activeAnomalies.length} tone="orange" icon={<AlertTriangle className="h-5 w-5"/>}/><StatCard label="Risk" value={risk} tone={risk==='Critical'?'red':'slate'} icon={<TrendingUp className="h-5 w-5"/>}/></div><div className="mt-6 grid gap-5 xl:grid-cols-[1fr_1fr]"><Card><SectionTitle title="Tren Compliance" subtitle="Rata-rata skor QC distribusi yang tercatat"/><TrendChart points={trend.map(d=>({label:shortGovDate(d.date),value:d.compliance}))} minValue={Math.max(0,Math.floor(Math.min(...trend.map(x=>x.compliance),70)/5)*5-5)}/></Card><Card><SectionTitle title="Anomali Terbaru"/>{anomalies.length?<div className="space-y-3">{[...anomalies].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5).map(a=><Link key={a.id} href={`/government/anomalies/${a.id}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="min-w-0 flex-1"><div className="text-sm font-bold">{a.title}</div><div className="text-xs text-slate-400">{a.school}</div></div><StatusBadge status={a.status}/></Link>)}</div>:<div className="rounded-xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">Tidak ada anomali pada data operasional.</div>}</Card></div></>;
  }
  const filtered=sppgs.filter(s=>(s.name+s.code+s.region).toLowerCase().includes(q.toLowerCase()));
  return <><PageHeader title="Monitoring SPPG" subtitle="Cari dan bandingkan performa SPPG pada wilayah aktif."/><div className="mb-4 max-w-md"><SearchInput value={q} onChange={setQ} placeholder="Cari SPPG, kode, atau wilayah..."/></div><Card><SimpleTable headers={['SPPG','Wilayah','Sekolah','Compliance','Anomali','Risk','']} rows={filtered.map(s=>{const ds=state.distributions.filter(d=>d.sppg===s.name);const latest=governmentDailyMetrics(ds).at(-1);const active=state.anomalies.filter(a=>a.sppg===s.name&&!['RESOLVED','CLOSED'].includes(a.status)).length;const liveItem=liveSppgs(state).find(x=>x.id===s.id);return [<div key="n"><div className="font-bold">{s.name}</div><div className="text-[11px] text-slate-400">{s.code}</div></div>,s.region,s.schools,`${latest?.compliance??s.compliance}%`,active,<StatusBadge key="r" status={liveItem?.risk||s.risk}/>,<Link key="l" href={`/government/sppg/${s.id}`} className="font-bold text-brand-700">Detail</Link>]})}/></Card></>;
}

function GovernmentDistributions({state}:RoleAppProps){return <><PageHeader title="Monitoring Distribusi" subtitle="Rencana dan realisasi distribusi pada cakupan wilayah aktif."/><Card><SimpleTable headers={['ID','Tanggal','SPPG','Sekolah','Target','Realisasi','Tiba','Status']} rows={state.distributions.map(d=>[d.id,d.date,d.sppg,d.school,d.targetPortions,d.deliveredPortions,d.deliveredAt||'-',<StatusBadge key="s" status={d.status}/>])}/></Card></>}

function GovernmentFoodWaste({ state }: RoleAppProps) {
  const [period,setPeriod]=useState<'week'|'month'>('week');
  const cutoff=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(Date.now()-(period==='week'?7:30)*24*60*60*1000));
  const feedback=Object.values(state.mealFeedback).filter(x=>x.submittedAt>=cutoff);
  const counts={finished:feedback.filter(x=>x.level==='finished').length,partial:feedback.filter(x=>x.level==='partial').length,leftover:feedback.filter(x=>x.level==='leftover').length};
  const total=feedback.length;
  const wasteRate=total?Number(((counts.partial*.35+counts.leftover*.70)/total*100).toFixed(1)):0;
  const finishedRate=total?Number((counts.finished/total*100).toFixed(1)):0;
  const liveVotes=Object.values(state.votes);
  const preference=menus.slice(5,10).map(m=>({name:m.name,count:(m.votes||0)+liveVotes.filter(id=>id===m.id).length}));
  const voteTotal=preference.reduce((a,x)=>a+x.count,0);
  const favorite=[...preference].sort((a,b)=>b.count-a.count)[0];
  const regions=sppgs.map(s=>({name:s.region,waste:Math.max(0,Number(((100-s.compliance)/4).toFixed(1))),accept:Math.min(100,Math.round((s.compliance+90)/2))})).sort((a,b)=>b.waste-a.waste).slice(0,5);
  return <><PageHeader title="Food Waste & Preferensi" subtitle="Pantau sinyal sisa makanan dan penerimaan menu untuk mendukung perencanaan distribusi yang lebih presisi."/><div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1"><button onClick={()=>setPeriod('week')} className={`rounded-lg px-4 py-2 text-xs font-extrabold ${period==='week'?'bg-navy-900 text-white':'text-slate-500'}`}>7 Hari</button><button onClick={()=>setPeriod('month')} className={`rounded-lg px-4 py-2 text-xs font-extrabold ${period==='month'?'bg-navy-900 text-white':'text-slate-500'}`}>30 Hari</button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard label="Food Waste Signal" value={`${wasteRate}%`} tone="orange" icon={<TrendingDown className="h-5 w-5"/>}/><StatCard label="Porsi Dihabiskan" value={`${finishedRate}%`} tone="green" icon={<CheckCircle2 className="h-5 w-5"/>}/><StatCard label="Umpan Balik Siswa" value={total.toLocaleString('id-ID')} icon={<Users2 className="h-5 w-5"/>}/><StatCard label="Menu Favorit" value={favorite?.name||'-'} tone="blue" icon={<Utensils className="h-5 w-5"/>}/></div><div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_.9fr]"><Card><SectionTitle title="Sinyal Sisa per Wilayah" subtitle="Indikator relatif diturunkan dari compliance SPPG; bukan pengukuran berat limbah"/><div className="space-y-4">{regions.map(x=><div key={x.name}><div className="mb-1.5 flex items-center justify-between gap-3 text-xs"><span className="font-bold text-slate-700">{x.name}</span><span className="font-black text-slate-900">{x.waste}% sinyal</span></div><Progress value={Math.min(100,x.waste*20)} tone={x.waste>=4?'red':x.waste>=3?'orange':'green'}/><div className="mt-1 text-[10px] text-slate-400">Penerimaan indikatif {x.accept}%</div></div>)}</div></Card><Card><SectionTitle title="Preferensi Menu" subtitle={`${voteTotal.toLocaleString('id-ID')} suara tercatat`}/><div className="space-y-4">{preference.map(x=>{const val=voteTotal?Math.round(x.count/voteTotal*100):0;return <div key={x.name}><div className="mb-1 flex justify-between text-xs"><span className="font-bold text-slate-700">{x.name}</span><span className="font-black text-gov-700">{val}%</span></div><Progress value={val} tone={val>=22?'green':'blue'}/></div>})}</div><div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-900">Data preferensi digunakan sebagai sinyal perencanaan. Penilaian operasional tetap perlu dilihat bersama validasi, anomali, dan standar gizi.</div></Card></div></>;
}

function GovernmentAnomalies({user,path,state,update}:RoleAppProps){
  const detail=path[1]?state.anomalies.find(a=>a.id===path[1]):null;
  const act=(status:'AWAITING_VENDOR'|'RESOLVED')=>{
    if(!detail)return;
    update(prev=>{
      if(status==='RESOLVED') return resolveAnomalyWorkflow(prev,detail.id,user.name,'Bukti tindakan korektif telah diterima dan diverifikasi.');
      return {...prev,anomalies:prev.anomalies.map(a=>a.id===detail.id?{...a,status:'AWAITING_VENDOR' as const}:a),auditLogs:[makeAuditLog(user.name,'government','CLARIFICATION_REQUESTED','Anomaly',detail.id,detail.status,'AWAITING_VENDOR'),...prev.auditLogs]};
    });
  };
  if(detail)return <><PageHeader title={detail.id} subtitle={detail.title} action={<LinkButton href="/government/anomalies" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]"><Card><div className="flex flex-wrap gap-2"><StatusBadge status={detail.severity}/><StatusBadge status={detail.status}/></div><p className="mt-4 text-sm leading-6 text-slate-600">{detail.description}</p><div className="mt-5 grid grid-cols-2 gap-3"><KeyValue label="SPPG" value={detail.sppg}/><KeyValue label="Sekolah" value={detail.school}/><KeyValue label="Kategori" value={detail.category}/><KeyValue label="Reporter" value={detail.reporter}/></div>{detail.vendorResponse&&<div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4"><div className="text-xs font-black uppercase text-blue-700">Respons Vendor</div><p className="mt-2 text-sm leading-6 text-blue-900">{detail.vendorResponse}</p></div>}<div className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Selama anomali belum RESOLVED/CLOSED, clearance distribusi terkait tetap ON HOLD.</div><div className="mt-5 flex flex-wrap gap-2"><Button variant="secondary" onClick={()=>act('AWAITING_VENDOR')}>Minta Klarifikasi</Button><Button onClick={()=>act('RESOLVED')} disabled={detail.status==='RESOLVED'}><CheckCircle2 className="h-4 w-4"/>Resolve</Button></div></Card><Card><SectionTitle title="Timeline"/><Timeline items={[{title:'Anomali dibuat',time:detail.date,status:'OPEN'},...(detail.status!=='OPEN'?[{title:'Review pengawas',time:'Review pengawas',status:detail.status}]:[]),...(detail.vendorResponse?[{title:'Tindakan korektif vendor',text:detail.vendorResponse,time:'Vendor response',status:'CORRECTIVE ACTION'}]:[]),...(detail.resolutionNote?[{title:'Resolusi',text:detail.resolutionNote,time:'Final',status:'RESOLVED'}]:[])]}/></Card></div></>;
  const priority=[...state.anomalies].sort((a,b)=>severityRank(b.severity)-severityRank(a.severity));
  return <><PageHeader title="Anomaly Center" subtitle="Queue diprioritaskan berdasarkan severity agar pengawas fokus pada exception."/><Card><SimpleTable headers={['Ticket','Severity','SPPG','Sekolah','Kategori','Tanggal','Status','']} rows={priority.map(a=>[a.id,<StatusBadge key="sev" status={a.severity}/>,a.sppg,a.school,a.category,a.date,<StatusBadge key="st" status={a.status}/>,<Link key="l" href={`/government/anomalies/${a.id}`} className="font-bold text-brand-700">Review</Link>])}/></Card></>;
}

function GovernmentCorrective({user,state,update}:RoleAppProps){
  const approve=(id:string)=>update(prev=>{
    const item=prev.correctiveActions.find(c=>c.id===id);
    if(!item)return prev;
    const anomaly=prev.anomalies.find(a=>a.id===item.anomalyId);
    const anomalies=prev.anomalies.map(a=>a.id===item.anomalyId?{...a,status:'RESOLVED' as const,resolutionNote:'Tindakan korektif vendor telah ditinjau dan disetujui.'}:a);
    const remaining=anomaly?anomalies.some(a=>a.distributionId===anomaly.distributionId&&!['RESOLVED','CLOSED'].includes(a.status)):false;
    let next={...prev,correctiveActions:prev.correctiveActions.map(c=>c.id===id?{...c,status:'APPROVED' as const,resolutionNote:'Tindakan korektif telah ditinjau dan disetujui.'}:c),anomalies,distributions:prev.distributions.map(d=>anomaly&&d.id===anomaly.distributionId&&!remaining?{...d,status:'VALIDATED' as const}:d),auditLogs:[makeAuditLog(user.name,'government','CORRECTIVE_ACTION_APPROVED','CorrectiveAction',id,'SUBMITTED','APPROVED'),...(item?[makeAuditLog(user.name,'government','ANOMALY_RESOLVED','Anomaly',item.anomalyId,'CORRECTIVE_ACTION','RESOLVED')]:[]),...prev.auditLogs]};
    next=recalculateClearances(next);
    next=reopenClaimsAfterResolution(next);
    return next;
  });
  return <><PageHeader title="Corrective Actions" subtitle="Setelah tindakan korektif disetujui, sistem menghitung ulang clearance terkait."/><div className="grid gap-4 lg:grid-cols-2">{state.correctiveActions.map(c=><Card key={c.id}><div className="flex items-start justify-between gap-3"><div><div className="text-xs font-bold text-slate-400">{c.id} • {c.anomalyId}</div><div className="mt-1 font-extrabold">{c.assignedTo}</div></div><StatusBadge status={c.status}/></div><p className="mt-4 text-sm leading-6 text-slate-600">{c.description}</p><div className="mt-4 text-xs font-bold text-slate-500">Deadline: {c.deadline}</div>{c.resolutionNote&&<div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">{c.resolutionNote}</div>}{c.status==='SUBMITTED'&&<Button className="mt-4 w-full" onClick={()=>approve(c.id)}><CheckCircle2 className="h-4 w-4"/>Setujui Tindakan</Button>}</Card>)}</div></>;
}

function GovernmentAudit({state}:RoleAppProps){const [q,setQ]=useState('');const logs=state.auditLogs.filter(l=>(l.actor+l.action+l.entity+l.entityId).toLowerCase().includes(q.toLowerCase()));return <><PageHeader title="Audit Trail" subtitle="Log read-only dari perubahan material pada sistem."/><div className="mb-4 max-w-md"><SearchInput value={q} onChange={setQ} placeholder="Cari actor, action, entity..."/></div><Card><SimpleTable headers={['Timestamp','Actor','Role','Action','Entity','Old','New']} rows={logs.map(l=>[l.timestamp,l.actor,<span key="role" className="capitalize font-semibold">{l.role}</span>,l.action.replaceAll('_',' '),`${l.entity} • ${l.entityId}`,l.oldStatus||'-',l.newStatus?<StatusBadge key="new" status={l.newStatus}/>:<span key="dash">-</span>])}/></Card></>}

function GovernmentClearance({user,state,update,path}:RoleAppProps){
  const detail=path[1]?state.clearances.find(c=>c.id===path[1]):null;
  const [note,setNote]=useState('');
  const decide=(kind:'approve'|'hold'|'clarify')=>{
    if(!detail)return;
    update(prev=>decideClearanceWorkflow(prev,detail.id,kind,user.name,note));
  };
  if(detail){
    const evidence=clearanceEvidence(state,detail);
    const claim=claimForClearance(state,detail.id);
    const canApprove=Boolean(claim)&&evidence.allRequiredComplete&&evidence.blockingAnomalies.length===0&&detail.status!=='VERIFIED';
    return <><PageHeader title={detail.id} subtitle="Review clearance dan klaim berdasarkan bukti digital" action={<LinkButton href="/government/clearance" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><Card><SectionTitle title="Evidence Checklist" subtitle={`${detail.sppg} • ${detail.school||'-'}`}/><div className="space-y-3">{evidence.evidenceItems.map(item=><div key={item.key} className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${item.ok?'border-emerald-100 bg-emerald-50/60':'border-amber-100 bg-amber-50/60'}`}><div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${item.ok?'bg-emerald-100 text-emerald-700':'bg-amber-100 text-amber-700'}`}>{item.ok?'✓':'!'}</div><div><div className="text-sm font-bold text-slate-700">{item.label}</div><div className="mt-0.5 text-xs leading-5 text-slate-500">{item.detail}</div></div></div>)}</div>{detail.holdReason&&<div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900"><b>Alasan hold:</b><br/>{detail.holdReason}</div>}</Card><Card><SectionTitle title="Keputusan Clearance"/><div className="grid gap-3 sm:grid-cols-2"><KeyValue label="Status Clearance" value={<StatusBadge status={detail.status}/>}/><KeyValue label="Evidence Score" value={`${evidence.score}%`}/><KeyValue label="Status Klaim" value={claim?<StatusBadge status={claim.status}/>:<span className="text-slate-500">Belum diajukan</span>}/><KeyValue label="Nilai Klaim" value={claim?rupiah(claim.amount):(detail.amount?rupiah(detail.amount):'-')}/></div>{claim?.vendorClarification&&<div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><b>Klarifikasi Vendor:</b><br/>{claim.vendorClarification}</div>}<label className="mt-5 block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Catatan keputusan</span><textarea rows={3} value={note} onChange={e=>setNote(e.target.value)} placeholder="Isi alasan penahanan atau permintaan klarifikasi" className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"/></label><div className="mt-4 grid gap-2"><Button onClick={()=>decide('approve')} disabled={!canApprove}><CheckCircle2 className="h-4 w-4"/>Setujui Clearance</Button><Button variant="danger" onClick={()=>decide('hold')} disabled={!claim||detail.status==='VERIFIED'}><AlertTriangle className="h-4 w-4"/>Tahan Klaim</Button><Button variant="secondary" onClick={()=>decide('clarify')} disabled={!claim||detail.status==='VERIFIED'}>Minta Klarifikasi</Button></div>{!claim&&<div className="mt-3 text-xs leading-5 text-slate-500">Keputusan pembayaran belum tersedia karena vendor belum mengajukan klaim.</div>}{claim&&!evidence.allRequiredComplete&&<div className="mt-3 text-xs leading-5 text-amber-700">Clearance belum dapat disetujui karena masih ada bukti yang belum lolos.</div>}</Card></div></>;
  }
  const rank=(c:typeof state.clearances[number])=>{const claim=claimForClearance(state,c.id);if(claim?.status==='SUBMITTED')return 5;if(claim?.status==='UNDER_REVIEW')return 4;if(c.status==='ON_HOLD')return 3;if(c.status==='ELIGIBLE')return 2;if(c.status==='PENDING')return 1;return 0};
  const ordered=[...state.clearances].sort((a,b)=>rank(b)-rank(a)||(b.periodDate||'').localeCompare(a.periodDate||''));
  const waiting=state.claims.filter(c=>['SUBMITTED','UNDER_REVIEW'].includes(c.status)).length;
  const held=state.claims.filter(c=>c.status==='ON_HOLD').length;
  const ready=state.claims.filter(c=>c.status==='READY_FOR_PAYMENT').length;
  return <><PageHeader title="Clearance Monitoring" subtitle="Pengawas hanya dapat menyetujui klaim setelah bukti lengkap dan tidak ada anomali aktif."/><div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Menunggu Review" value={waiting} tone="blue" icon={<FileClock className="h-5 w-5"/>}/><StatCard label="Klaim Ditahan" value={held} tone="orange" icon={<AlertTriangle className="h-5 w-5"/>}/><StatCard label="Siap Pembayaran" value={ready} tone="green" icon={<CircleDollarSign className="h-5 w-5"/>}/></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{ordered.map(c=>{const evidence=clearanceEvidence(state,c);const claim=claimForClearance(state,c.id);return <Card key={c.id}><div className="flex justify-between gap-3"><div><div className="text-xs font-bold text-slate-400">{c.id}</div><div className="mt-1 font-black">{c.sppg}</div><div className="text-xs text-slate-500">{c.school||'-'} • {c.period}</div></div><StatusBadge status={c.status}/></div><div className="mt-4"><Progress value={evidence.score} label="Evidence Score" tone={evidence.score===100?'green':c.status==='ON_HOLD'?'orange':'blue'}/></div><div className="mt-4 flex items-center justify-between gap-3"><div><div className="text-[10px] font-bold uppercase text-slate-400">Klaim</div><div className="mt-1">{claim?<StatusBadge status={claim.status}/>:<span className="text-xs font-semibold text-slate-500">Belum diajukan</span>}</div></div><LinkButton href={`/government/clearance/${c.id}`} variant="secondary">Review</LinkButton></div></Card>})}</div></>;
}

function GovernmentReports({state}:RoleAppProps){
  const [downloaded,setDownloaded]=useState('');
  const live=liveSppgs(state);
  const download=(report:string)=>{
    let rows:(string|number)[][]=[];
    if(report==='Anomaly Report') rows=[['Ticket','Date','SPPG','School','Severity','Status'],...state.anomalies.map(a=>[a.id,a.date,a.sppg,a.school,a.severity,a.status])];
    else if(report==='Clearance Summary') rows=[['Clearance ID','SPPG','Period','Amount','Evidence Score','Status'],...state.clearances.map(c=>[c.id,c.sppg,c.period,c.amount,c.evidenceScore,c.status])];
    else if(report==='Daily Monitoring') rows=[['Distribution ID','Date','SPPG','School','Target','Delivered','Status'],...state.distributions.map(d=>[d.id,d.date,d.sppg,d.school,d.targetPortions,d.deliveredPortions,d.status])];
    else if(report==='Weekly Compliance') rows=[['SPPG','Region','Compliance','Anomalies','Risk'],...live.map(s=>[s.name,s.region,s.compliance,s.anomalies,s.risk])];
    else if(report==='Vendor Performance') rows=[['SPPG','Compliance','Anomalies','Risk'],...live.map(s=>[s.name,s.compliance,s.anomalies,s.risk])];
    else { const feedback=Object.values(state.mealFeedback); const waste=feedback.length?Number((feedback.filter(x=>x.level!=='finished').length/feedback.length*100).toFixed(1)):0; const arrived=state.distributions.filter(d=>d.deliveredAt).length; const scored=state.distributions.filter(d=>d.qcScore!==undefined).length; rows=[['Metric','Value'],['Food Waste Signal',`${waste}%`],['Validation Rate',`${arrived?Number((scored/arrived*100).toFixed(1)):0}%`],['Student Feedback',feedback.length],['Active Anomalies',state.anomalies.filter(a=>!['RESOLVED','CLOSED'].includes(a.status)).length]]; }
    const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`my-mbg-${report.toLowerCase().replaceAll(' ','-')}.csv`;a.click();URL.revokeObjectURL(url);setDownloaded(report);window.setTimeout(()=>setDownloaded(''),2200);
  };
  const reports=['Daily Monitoring','Weekly Compliance','Anomaly Report','Vendor Performance','Food Waste Summary','Clearance Summary'];
  return <><PageHeader title="Reports" subtitle="Laporan operasional untuk dokumentasi, monitoring, dan evaluasi."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map((r)=><Card key={r}><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-700"><FileClock className="h-5 w-5"/></div><div><div className="font-extrabold">{r}</div><div className="text-xs text-slate-400">Updated {new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'2-digit',month:'short',year:'numeric'}).format(new Date())}</div></div></div><Button variant="secondary" className="mt-4 w-full" onClick={()=>download(r)}><Download className="h-4 w-4"/>Unduh CSV</Button>{downloaded===r&&<div className="mt-2 text-xs font-bold text-emerald-700">File berhasil disiapkan.</div>}</Card>)}</div></>;
}

function GovernmentAnalytics({state}:RoleAppProps){
  const live=liveSppgs(state);
  const trend=governmentDailyMetrics(state.distributions).slice(-7);
  const categories=['Porsi','Kualitas','Keterlambatan','Kemasan'];
  const counts=categories.map(cat=>state.anomalies.filter(a=>a.category.toLowerCase().includes(cat.toLowerCase())).length);
  const totalValidations=state.validations.length;
  const locationVerified=totalValidations?state.validations.filter(v=>v.locationStatus==='Verified').length/totalValidations*100:0;
  const humanVerified=totalValidations?state.validations.filter(v=>['VERIFIED','REVIEW_REQUIRED','ANOMALY'].includes(v.finalStatus)).length/totalValidations*100:0;
  const actions=state.correctiveActions.length;
  const closedActions=state.correctiveActions.filter(c=>['APPROVED','RESOLVED'].includes(c.status)).length;
  const actionRate=actions?closedActions/actions*100:0;
  return <><PageHeader title="Analytics" subtitle="Visualisasi diturunkan dari distribusi, validasi, anomali, dan corrective action yang tersimpan di sistem."/><div className="grid gap-5 lg:grid-cols-2"><Card><SectionTitle title="Compliance Over Time" subtitle="Rata-rata skor QC per hari"/><TrendChart points={trend.map(d=>({label:shortGovDate(d.date),value:d.compliance}))} minValue={70}/></Card><Card><SectionTitle title="Anomaly by Type" subtitle="Jumlah tiket berdasarkan kategori"/><MiniBars values={counts} labels={['Porsi','Kualitas','Terlambat','Kemasan']}/></Card><Card><SectionTitle title="Validation Completion"/><div className="space-y-4"><Progress value={Number(locationVerified.toFixed(1))} label="GPS / lokasi terverifikasi" tone={locationVerified>=90?'green':'orange'}/><Progress value={Number(humanVerified.toFixed(1))} label="Human Verification" tone={humanVerified>=90?'green':'orange'}/><Progress value={Number(actionRate.toFixed(1))} label="Corrective Action selesai" tone={actionRate>=80?'green':'orange'}/></div></Card><Card><SectionTitle title="Prioritas Tindak Lanjut"/><div className="space-y-3">{live.filter(s=>s.risk!=='Normal').sort((a,b)=>mapRiskRank(b.risk)-mapRiskRank(a.risk)).slice(0,4).map(s=><div key={s.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><div><div className="text-sm font-extrabold text-navy-900">{s.name}</div><div className="text-xs text-slate-400">{s.region} • {s.compliance}% compliance</div></div><StatusBadge status={s.risk}/></div>)}</div></Card></div></>}

function severityRank(s:string){return s==='Critical'?4:s==='High'?3:s==='Medium'?2:1}
function rupiah(n:number){return new Intl.NumberFormat('id-ID',{style:'currency',currency:'IDR',maximumFractionDigits:0}).format(n)}
