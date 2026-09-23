'use client';

import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { AlertTriangle, BookOpen, CalendarDays, Camera, CheckCircle2, ClipboardCheck, Clock3, FileClock, LocateFixed, MapPin, RotateCcw, ScanLine, Send, Sparkles, Truck, Upload, Vote } from 'lucide-react';
import { menus } from '@/lib/data';
import { makeAuditLog } from '@/lib/store';
import { ensureClearanceForDistribution, recalculateClearances } from '@/lib/workflow';
import type { Anomaly, Validation } from '@/lib/types';
import type { RoleAppProps } from './app-types';
import { AIBlock, Button, Card, EvidenceMeta, KeyValue, LinkButton, PageHeader, PortalHero, Progress, SectionTitle, SimpleTable, StatCard, StatusBadge, Timeline } from './ui';


function jakartaDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

async function compressEvidence(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024) throw new Error('Maksimum file 5 MB.');
  const source = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('File tidak dapat dibaca.'));
    reader.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Gambar tidak valid.'));
    image.src = source;
  });
  const max = 1280;
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return source;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', .78);
}

export function TeacherApp(props: RoleAppProps) {
  const page = props.path[0] || 'home';
  if (page === 'schedule') return <TeacherSchedule {...props}/>;
  if (page === 'sidak-nalar') return <SidakNalar {...props}/>;
  if (page === 'history') return <ValidationHistory {...props}/>;
  if (page === 'anomaly') return <TeacherAnomaly {...props}/>;
  if (page === 'musyawarah') return <TeacherVoting {...props}/>;
  if (page === 'sop') return <TeacherSop/>;
  if (page === 'profile') return <TeacherProfile {...props}/>;
  return <TeacherHome {...props}/>;
}

function TeacherHome({ user, state }: RoleAppProps) {
  const today=jakartaDate();
  const month=today.slice(0,7);
  const schoolDistributions=state.distributions.filter(d=>d.school===user.organization);
  const todayDistribution=schoolDistributions.find(d=>d.date===today && d.status==='VALIDATION_PENDING') || schoolDistributions.find(d=>d.date===today) || schoolDistributions.find(d=>d.status==='VALIDATION_PENDING');
  const ownThisMonth=state.validations.filter(v=>v.school===user.organization && v.date.startsWith(month));
  const open=state.anomalies.filter(a=>a.school===user.organization && !['RESOLVED','CLOSED'].includes(a.status));
  const scored=schoolDistributions.filter(d=>d.qcScore!==undefined);
  const compliance=scored.length?Number((scored.reduce((sum,d)=>sum+(d.qcScore||0),0)/scored.length).toFixed(1)):0;
  const agendaStatus=todayDistribution?.status || 'SCHEDULED';
  const agendaText=todayDistribution ? `${todayDistribution.sppg} • ${todayDistribution.targetPortions} porsi` : 'Belum ada distribusi terjadwal';
  const canValidate=!!todayDistribution && todayDistribution.status==='VALIDATION_PENDING';
  return <>
    <PortalHero eyebrow="Portal Operasional Sekolah" title={user.organization} text="Validasi distribusi MBG dengan alur singkat, bukti digital, dan bantuan AI tanpa menambah administrasi yang tidak perlu.">
      <div className="rounded-xl border border-white/10 bg-white/[.06] px-4 py-3 backdrop-blur"><div className="text-[9px] font-black uppercase tracking-[.14em] text-emerald-300">Tugas Hari Ini</div><div className="mt-1 text-lg font-black">{todayDistribution?`${todayDistribution.plannedTime} WIB`:'Tidak ada agenda'}</div><div className="mt-1 text-[10px] text-slate-300">{agendaText}</div></div>
    </PortalHero>
    <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
      <Card className="overflow-hidden border-emerald-100 bg-gradient-to-r from-white to-gov-50">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div><div className="text-[10px] font-black uppercase tracking-[.13em] text-gov-600">Agenda Pengawasan Prioritas</div><h2 className="mt-2 text-2xl font-black text-navy-900">{canValidate?'Distribusi MBG menunggu validasi':todayDistribution?'Distribusi hari ini sudah tercatat':'Belum ada distribusi hari ini'}</h2><p className="mt-2 text-sm text-slate-500">{canValidate?'Sampel cukup satu nampan. Foto, lokasi, dan waktu akan dicatat sebagai bukti.':'Buka jadwal untuk melihat agenda distribusi berikutnya.'}</p><div className="mt-3"><StatusBadge status={agendaStatus}/></div></div>
          <Link href={canValidate?'/teacher/sidak-nalar':'/teacher/schedule'} className="inline-flex min-h-12 min-w-[195px] items-center justify-center gap-2 rounded-xl bg-gov-600 px-5 text-sm font-black text-white shadow-md shadow-emerald-100 transition hover:bg-gov-700"><Sparkles className="h-4 w-4"/>{canValidate?'Mulai Sidak Nalar':'Lihat Jadwal'}</Link>
        </div>
      </Card>
      <Card><SectionTitle title="Ringkasan Bulan Ini" subtitle="Aktivitas pengawasan sekolah"/><div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl bg-blue-50 p-3"><div className="text-xl font-black text-blue-700">{ownThisMonth.length}</div><div className="text-[9px] font-black uppercase text-slate-400">Validasi</div></div><div className="rounded-xl bg-amber-50 p-3"><div className="text-xl font-black text-amber-700">{open.length}</div><div className="text-[9px] font-black uppercase text-slate-400">Anomali</div></div><div className="rounded-xl bg-emerald-50 p-3"><div className="text-xl font-black text-emerald-700">{compliance}%</div><div className="text-[9px] font-black uppercase text-slate-400">Kepatuhan</div></div></div></Card>
    </div>
    <div className="mt-6"><SectionTitle title="Akses Cepat" subtitle="Fitur yang paling sering digunakan di sekolah"/><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">{[
      ['/teacher/schedule','Jadwal Distribusi','Agenda harian',CalendarDays,'bg-slate-100 text-slate-700'],['/teacher/sidak-nalar','Sidak Nalar','AI QC',ScanLine,'bg-cyan-50 text-cyan-700'],['/teacher/musyawarah','Musyawarah','Voting kelas',Vote,'bg-violet-50 text-violet-700'],['/teacher/history','Riwayat Validasi','Arsip audit',FileClock,'bg-blue-50 text-blue-700'],['/teacher/sop','SOP Gizi','Panduan singkat',BookOpen,'bg-emerald-50 text-emerald-700'],['/teacher/anomaly/new','Lapor Anomali','Temuan lapangan',AlertTriangle,'bg-red-50 text-red-700']
    ].map(([href,title,sub,I,cls]:any)=><Link href={href} key={href} className="app-card group p-4 transition hover:-translate-y-0.5 hover:border-gov-200 hover:shadow-institutional"><div className={`inline-flex rounded-xl p-2.5 ${cls}`}><I className="h-5 w-5"/></div><div className="mt-3 text-sm font-black text-navy-900">{title}</div><div className="mt-1 text-[11px] text-slate-400">{sub}</div></Link>)}</div></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-2"><Card><SectionTitle title="Aktivitas Terbaru"/><Timeline items={state.auditLogs.filter(x=>x.actor===user.name).slice(0,4).map(x=>({title:x.action.replaceAll('_',' '),text:`${x.entity} • ${x.entityId}`,time:x.timestamp,status:x.newStatus}))}/></Card><Card><SectionTitle title="Distribusi Sekolah"/><div className="space-y-3">{[...schoolDistributions].sort((a,b)=>(b.date+b.plannedTime).localeCompare(a.date+a.plannedTime)).slice(0,3).map(d=><div key={d.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"><div className="rounded-xl bg-gov-50 p-2 text-gov-700"><ClipboardCheck className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="truncate text-sm font-extrabold text-navy-900">{d.id}</div><div className="text-xs text-slate-400">{d.sppg} • {d.targetPortions} porsi</div></div><StatusBadge status={d.status}/></div>)}</div></Card></div>
  </>;
}

function TeacherSchedule({ user, state }: RoleAppProps) {
  const own = [...state.distributions].filter(d=>d.school===user.organization).sort((a,b)=>(a.date+a.plannedTime).localeCompare(b.date+b.plannedTime));
  const today = jakartaDate();
  const upcoming = own.filter(d=>d.date>=today).slice(0,10);
  const todayRows = own.filter(d=>d.date===today);
  const validatedToday = todayRows.filter(d=>d.status==='VALIDATED').length;
  return <><PageHeader title="Jadwal Distribusi" subtitle="Agenda penerimaan dan validasi MBG sekolah untuk hari ini dan hari berikutnya."/><div className="grid gap-4 sm:grid-cols-3"><StatCard label="Agenda Hari Ini" value={todayRows.length} tone="orange" icon={<Clock3 className="h-5 w-5"/>}/><StatCard label="Porsi Terjadwal" value={todayRows.reduce((a,d)=>a+d.targetPortions,0).toLocaleString('id-ID')} icon={<Truck className="h-5 w-5"/>}/><StatCard label="Validasi Selesai" value={validatedToday} tone="green" icon={<CheckCircle2 className="h-5 w-5"/>}/></div><div className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_.8fr]"><Card><SectionTitle title="Kalender Distribusi" subtitle="Agenda berdasarkan distribusi yang tersimpan"/><div className="space-y-2">{upcoming.map((d)=>{const m=menus.find(x=>x.id===d.menuId);const canValidate=d.status==='VALIDATION_PENDING';return <div key={d.id} className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center ${d.date===today?'border-amber-200 bg-amber-50/50':'border-slate-100'}`}><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-center shadow-sm"><div><div className="text-[9px] font-bold uppercase text-slate-400">{m?.day?.slice(0,3)||'Hari'}</div><div className="text-sm font-black text-navy-900">{d.date.slice(-2)}</div></div></div><div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-navy-900">{m?.name||'Menu MBG'}</div><div className="mt-1 text-xs text-slate-500">{d.plannedTime} WIB • {d.targetPortions} porsi • {d.sppg}</div></div><StatusBadge status={d.status}/>{canValidate&&<Link href="/teacher/sidak-nalar" className="inline-flex h-10 items-center justify-center rounded-xl bg-gov-600 px-3 text-xs font-extrabold text-white">Mulai validasi</Link>}</div>})}</div></Card><Card><SectionTitle title="Checklist Hari Ini"/><div className="space-y-3">{[['Konfirmasi jadwal vendor',todayRows.length?'Selesai':'Menunggu'],['Penerimaan distribusi',todayRows.some(d=>d.deliveredAt)?'Selesai':'Menunggu'],['Sampling satu nampan',todayRows.some(d=>['VALIDATION_PENDING','VALIDATED'].includes(d.status))?'Selesai':'Menunggu'],['Sidak Nalar & GPS',validatedToday?'Selesai':'Menunggu'],['Simpan hasil validasi',validatedToday?'Selesai':'Menunggu']].map(([a,s])=><div key={a} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3"><span className="text-sm font-bold text-slate-700">{a}</span><StatusBadge status={s}/></div>)}</div></Card></div></>;
}

function SidakNalar({ user, state, update }: RoleAppProps) {
  const today = jakartaDate();
  const dist = state.distributions.find(d=>d.school===user.organization && d.date===today && d.status==='VALIDATION_PENDING') || state.distributions.find(d=>d.school===user.organization && d.status==='VALIDATION_PENDING') || state.distributions.find(d=>d.school===user.organization);
  const menu = menus.find(m=>m.id===dist?.menuId) || menus[1];
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState(menu.image);
  const [photoReady,setPhotoReady]=useState(false);
  const [gps, setGps] = useState<{status:'idle'|'loading'|'verified'|'unverified'; lat?:number; lon?:number}>({status:'idle'});
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed,setAnalyzed]=useState(false);
  const [decision, setDecision] = useState<'Sesuai'|'Perlu Review'|'Tidak Sesuai'>('Perlu Review');
  const [note, setNote] = useState('Porsi protein terlihat sedikit di bawah standar sampel.');
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savedClearanceStatus,setSavedClearanceStatus]=useState<'ELIGIBLE'|'PENDING'|'ON_HOLD'|null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const aiItems=menu.components.slice(0,4).map((name,i)=>({name,estimate:i===0?'150g':i===1?'76g':i===2?'68g':'1 porsi',standard:i===0?'150g':i===1?'80g':i===2?'70g':'1 porsi'}));

  const onFile = async (file?: File) => { if(!file) return; try { setPreview(await compressEvidence(file)); setPhotoReady(true); setAnalyzed(false); } catch (err) { window.alert(err instanceof Error ? err.message : 'Gambar tidak dapat diproses.'); } };
  const requestGps = () => {
    setGps({status:'loading'});
    if (!navigator.geolocation) { setGps({status:'unverified'}); return; }
    navigator.geolocation.getCurrentPosition(p=>setGps({status:'verified',lat:p.coords.latitude,lon:p.coords.longitude}),()=>setGps({status:'unverified'}),{enableHighAccuracy:false,timeout:5000});
  };
  const schoolGps = () => setGps({status:'unverified',lat:-6.302,lon:106.653});
  const runAi = () => { setAnalyzing(true); window.setTimeout(()=>{setAnalyzing(false);setAnalyzed(true)},900); };
  const submit = () => {
    if(!dist) return;
    const id=`VAL-${today.replaceAll('-','')}-${String(state.validations.length+11).padStart(4,'0')}`;
    const finalStatus: Validation['finalStatus'] = decision==='Sesuai'?'VERIFIED':decision==='Perlu Review'?'REVIEW_REQUIRED':'ANOMALY';
    const val: Validation = { id, distributionId:dist.id, date:today, teacher:user.name, school:dist.school, sppg:dist.sppg, menu:menu.name, aiScore:92, visualCompleteness:96, portionConformity:89, humanStatus:decision, finalStatus, locationStatus:gps.status==='verified'?'Verified':'Unverified', note, image:preview, capturedAt:new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta',hour:'2-digit',minute:'2-digit',second:'2-digit'}) };
    update(prev=>{
      const anomalies=[...prev.anomalies];
      if(decision!=='Sesuai'){
        const a:Anomaly={id:`ANM-${today.replaceAll('-','')}-${String(anomalies.length+5).padStart(3,'0')}`,date:today,distributionId:dist.id,validationId:id,school:dist.school,sppg:dist.sppg,category:'Porsi',severity:decision==='Tidak Sesuai'?'High':'Medium',title:'Porsi protein sampel di bawah standar',description:'Sidak Nalar menemukan estimasi porsi protein di bawah standar dan membutuhkan tindak lanjut.',status:'OPEN',reporter:user.name}; anomalies.unshift(a);
      }
      const distributionStatus = decision==='Sesuai' ? 'VALIDATED' as const : 'REVIEW_REQUIRED' as const;
      let next = {
        ...prev,
        validations:[val,...prev.validations],
        anomalies,
        distributions:prev.distributions.map(d=>d.id===dist.id?{...d,status:distributionStatus,qcScore:92}:d),
        auditLogs:[
          makeAuditLog(user.name,'teacher','VALIDATION_SUBMITTED','Validation',id,'AI_ANALYZED',finalStatus),
          makeAuditLog(user.name,'teacher','DISTRIBUTION_REVIEWED','Distribution',dist.id,dist.status,distributionStatus),
          ...prev.auditLogs
        ]
      };
      next = ensureClearanceForDistribution(next, {...dist,status:distributionStatus,qcScore:92});
      next = recalculateClearances(next);
      const clearance = next.clearances.find(c=>c.distributionIds?.includes(dist.id));
      if(clearance){
        next = {...next,auditLogs:[makeAuditLog(user.name,'teacher','CLEARANCE_RECALCULATED','Clearance',clearance.id,undefined,clearance.status),...next.auditLogs]};
      }
      return next;
    });
    setSavedClearanceStatus(decision!=='Sesuai'?'ON_HOLD':gps.status==='verified'&&photoReady&&analyzed?'ELIGIBLE':'PENDING');
    setSavedId(id);
  };

  if(!dist) return <><PageHeader title="Sidak Nalar" subtitle="Validasi sampel makanan berdasarkan distribusi sekolah."/><Card className="mx-auto max-w-2xl text-center"><ClipboardCheck className="mx-auto h-10 w-10 text-slate-300"/><h2 className="mt-4 text-lg font-black text-navy-900">Belum ada distribusi untuk sekolah ini</h2><p className="mt-2 text-sm text-slate-500">Sidak Nalar hanya dapat dimulai untuk distribusi yang terhubung ke sekolah akun Anda.</p><LinkButton href="/teacher/schedule" variant="secondary" className="mt-5">Lihat Jadwal Distribusi</LinkButton></Card></>;

  if(savedId) return <div className="mx-auto max-w-2xl"><Card className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-8 w-8"/></div><h1 className="mt-4 text-2xl font-black">Validasi berhasil disimpan</h1><p className="mt-2 text-sm text-slate-500">Bukti foto, metadata, analisis AI, dan keputusan manusia telah masuk ke riwayat sistem. Status clearance vendor dihitung ulang otomatis berdasarkan hasil ini.</p><div className="mx-auto mt-6 grid max-w-lg grid-cols-2 gap-3 text-left"><KeyValue label="Validation ID" value={savedId}/><KeyValue label="Status" value={<StatusBadge status={decision==='Sesuai'?'VERIFIED':decision==='Perlu Review'?'REVIEW REQUIRED':'ANOMALY'}/>}/><KeyValue label="Vendor" value={dist.sppg}/><KeyValue label="Sekolah" value={dist.school}/>{savedClearanceStatus&&<KeyValue label="Dampak Clearance" value={<StatusBadge status={savedClearanceStatus}/>}/>} </div><div className="mt-6 flex flex-wrap justify-center gap-2"><LinkButton href={`/teacher/history/${savedId}`}>Lihat Detail</LinkButton><LinkButton href="/teacher" variant="secondary">Kembali ke Beranda</LinkButton></div></Card></div>;

  const labels=['Distribusi','Foto','Lokasi','AI Analysis','Konfirmasi'];
  return <>
    <PageHeader title="Sidak Nalar" subtitle="Validasi sampel MBG berbasis foto, lokasi, analisis awal AI, dan konfirmasi manusia."/>
    <div className="mb-6 overflow-x-auto"><div className="flex min-w-[620px] items-center">{labels.map((l,i)=><div key={l} className="flex flex-1 items-center"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black ${step>=i+1?'bg-brand-600 text-white':'bg-slate-200 text-slate-500'}`}>{i+1}</div><div className={`ml-2 text-xs font-bold ${step>=i+1?'text-slate-800':'text-slate-400'}`}>{l}</div>{i<labels.length-1&&<div className={`mx-3 h-0.5 flex-1 ${step>i+1?'bg-brand-500':'bg-slate-200'}`}/>}</div>)}</div></div>

    {step===1&&<Card className="mx-auto max-w-3xl"><SectionTitle title="1. Konfirmasi Distribusi" subtitle="Pastikan distribusi yang akan diperiksa sudah benar."/><div className="grid gap-3 sm:grid-cols-2"><KeyValue label="Sekolah" value={dist.school}/><KeyValue label="Vendor / SPPG" value={dist.sppg}/><KeyValue label="Menu" value={menu.name}/><KeyValue label="Target Porsi" value={`${dist.targetPortions} porsi`}/><KeyValue label="Jadwal" value={`${dist.date} • ${dist.plannedTime} WIB`}/><KeyValue label="Status" value={<StatusBadge status={dist.status}/>}/></div><Button className="mt-6 w-full" onClick={()=>setStep(2)}>Lanjut Ambil Foto</Button></Card>}

    {step===2&&<Card className="mx-auto max-w-3xl"><SectionTitle title="2. Ambil Foto Sampel" subtitle="Fokuskan gambar pada makanan. Hindari wajah siswa dan pencahayaan terlalu gelap."/><div className="grid gap-5 md:grid-cols-[1fr_.9fr]"><div><img src={preview} alt="Preview sampel" className="h-72 w-full rounded-2xl border border-slate-200 object-cover"/></div><div><div className="space-y-2 text-sm text-slate-600"><p>• Letakkan satu nampan pada permukaan datar.</p><p>• Pastikan semua komponen terlihat.</p><p>• Ambil dari sudut yang konsisten.</p><p>• Maksimal 5 MB.</p></div><input ref={inputRef} type="file" accept="image/*" capture="environment" onChange={e=>onFile(e.target.files?.[0])} className="hidden"/><div className="mt-5 grid gap-2"><Button onClick={()=>inputRef.current?.click()}><Camera className="h-4 w-4"/>Ambil / Unggah Foto</Button><Button variant="secondary" onClick={()=>{setPreview(menu.image);setPhotoReady(true);setAnalyzed(false)}}><Upload className="h-4 w-4"/>Gunakan Foto Tersimpan</Button></div></div></div><div className="mt-6 flex justify-between"><Button variant="ghost" onClick={()=>setStep(1)}>Kembali</Button><Button onClick={()=>setStep(3)} disabled={!photoReady}>Lanjut Verifikasi Lokasi</Button></div></Card>}

    {step===3&&<Card className="mx-auto max-w-3xl"><SectionTitle title="3. GPS + Timestamp" subtitle="Lokasi menjadi bukti pendukung, bukan satu-satunya dasar keputusan."/><div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><div className="flex items-start gap-4"><div className={`rounded-2xl p-3 ${gps.status==='verified'?'bg-emerald-100 text-emerald-700':gps.status==='unverified'?'bg-amber-100 text-amber-700':'bg-brand-100 text-brand-700'}`}><LocateFixed className="h-6 w-6"/></div><div><div className="font-extrabold">{gps.status==='verified'?'Lokasi Terdeteksi ✓':gps.status==='unverified'?'Lokasi Belum Terverifikasi':'Verifikasi lokasi perangkat'}</div><p className="mt-1 text-xs leading-5 text-slate-500">{gps.status==='verified'?`${dist.school} • lokasi perangkat tercatat`:gps.status==='unverified'?'Lokasi perangkat belum terverifikasi. Titik sekolah dapat digunakan sebagai referensi, tetapi status tetap Unverified.':'Izinkan browser mengakses lokasi saat tombol ditekan.'}</p>{gps.lat&&<div className="mt-2 text-[11px] font-mono text-slate-400">{gps.lat.toFixed(5)}, {gps.lon?.toFixed(5)}</div>}</div></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2"><Button onClick={requestGps} disabled={gps.status==='loading'}><MapPin className="h-4 w-4"/>{gps.status==='loading'?'Mendeteksi...':'Deteksi Lokasi'}</Button><Button variant="secondary" onClick={schoolGps}>Gunakan Titik Sekolah</Button></div><div className="mt-4 rounded-xl bg-blue-50 p-3 text-xs font-semibold text-blue-800">Timestamp server akan dicatat saat validasi disimpan.</div><div className="mt-6 flex justify-between"><Button variant="ghost" onClick={()=>setStep(2)}>Kembali</Button><Button onClick={()=>setStep(4)}>Lanjut AI Analysis</Button></div></Card>}

    {step===4&&<Card className="mx-auto max-w-3xl"><SectionTitle title="4. AI-assisted Analysis" subtitle="Analisis awal terhadap komponen makanan, estimasi porsi, dan kondisi visual. Keputusan final tetap dilakukan pengawas."/>{analyzing?<div className="py-16 text-center"><div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-100 border-t-cyan-600"/><div className="mt-5 font-extrabold">AI sedang menganalisis sampel...</div><div className="mt-2 text-xs text-slate-500">Mendeteksi komponen • Estimasi porsi • Pemeriksaan visual</div></div>:analyzed?<AIBlock><div className="grid gap-3 sm:grid-cols-2">{aiItems.map((item)=><div key={item.name} className="rounded-xl bg-white/80 p-3"><div className="flex items-center justify-between"><span className="font-bold text-slate-800">{item.name}</span><span className="text-xs font-bold text-emerald-600">Detected ✓</span></div><div className="mt-2 text-xs text-slate-500">Estimasi <b className="text-slate-800">{item.estimate}</b> • Standar {item.standard}</div></div>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-3"><div><Progress value={96} label="Visual Completeness"/></div><div><Progress value={89} label="Portion Conformity" tone="orange"/></div><div><Progress value={92} label="AI Confidence"/></div></div><div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">Temuan: porsi protein diperkirakan sedikit di bawah standar.</div><div className="mt-3 text-[11px] font-semibold text-cyan-900">Hasil AI merupakan indikasi awal dan membutuhkan konfirmasi pengawas.</div></AIBlock>:<div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center"><Sparkles className="mx-auto h-7 w-7 text-cyan-700"/><div className="mt-3 font-extrabold text-slate-800">Bukti foto siap dianalisis</div><div className="mt-1 text-xs text-slate-500">Mulai analisis untuk membaca komponen, porsi, dan kondisi visual.</div></div>}<div className="mt-6 flex justify-between"><Button variant="ghost" onClick={()=>setStep(3)}>Kembali</Button><Button onClick={()=>analyzed?setStep(5):runAi()} disabled={analyzing}><Sparkles className="h-4 w-4"/>{analyzing?'Menganalisis...':analyzed?'Lanjut Konfirmasi':'Mulai Analisis'}</Button></div></Card>}

    {step===5&&<Card className="mx-auto max-w-4xl"><SectionTitle title="5. Human Verification" subtitle="Keputusan akhir berada pada pengawas. Bandingkan bukti lapangan dengan hasil AI."/><div className="grid gap-5 lg:grid-cols-[.9fr_1.1fr]"><div><img src={preview} alt="Sampel" className="h-64 w-full rounded-2xl border border-slate-200 object-cover"/><div className="mt-3"><EvidenceMeta school={dist.school} time={new Date().toLocaleTimeString('id-ID',{timeZone:'Asia/Jakarta'})} location={gps.status==='verified'?'GPS verified':'Location unverified'}/></div></div><div><AIBlock><div className="grid grid-cols-3 gap-2 text-center"><KeyValue label="AI Score" value="92%"/><KeyValue label="Visual" value="96%"/><KeyValue label="Porsi" value="89%"/></div><div className="mt-3 text-xs font-semibold text-amber-800">Protein sedikit di bawah standar sampel.</div></AIBlock><div className="mt-5 text-sm font-extrabold">Apakah sampel sesuai kondisi aktual?</div><div className="mt-3 grid gap-2 sm:grid-cols-3">{(['Sesuai','Perlu Review','Tidak Sesuai'] as const).map(x=><button key={x} onClick={()=>setDecision(x)} className={`min-h-12 rounded-xl border px-3 text-xs font-extrabold ${decision===x?'border-brand-500 bg-brand-50 text-brand-800':'border-slate-200 bg-white text-slate-600'}`}>{x}</button>)}</div><label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold text-slate-700">Catatan pengawas (opsional)</span><textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"/></label></div></div><div className="mt-6 flex justify-between"><Button variant="ghost" onClick={()=>setStep(4)}>Kembali</Button><Button onClick={submit}><Send className="h-4 w-4"/>Simpan Validasi</Button></div></Card>}
  </>;
}

function ValidationHistory({ user, path, state }: RoleAppProps) {
  const detail=path[1]?state.validations.find(v=>v.id===path[1] && v.school===user.organization):null;
  if(detail) return <><PageHeader title={detail.id} subtitle="Detail bukti dan riwayat validasi" action={<LinkButton href="/teacher/history" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-2"><Card><img src={detail.image||'/meal-teriyaki.png'} alt="Evidence" className="h-72 w-full rounded-2xl object-cover"/><div className="mt-4"><EvidenceMeta school={detail.school} time={`${detail.date} • ${detail.capturedAt}`} location={detail.locationStatus}/></div></Card><Card><SectionTitle title="Hasil Validasi"/><div className="grid grid-cols-2 gap-3"><KeyValue label="SPPG" value={detail.sppg}/><KeyValue label="Menu" value={detail.menu}/><KeyValue label="AI Score" value={`${detail.aiScore}%`}/><KeyValue label="Final Status" value={<StatusBadge status={detail.finalStatus}/>}/></div><div className="mt-5"><AIBlock><Progress value={detail.visualCompleteness} label="Visual Completeness"/><div className="mt-3"><Progress value={detail.portionConformity} label="Portion Conformity" tone={detail.portionConformity<90?'orange':'green'}/></div></AIBlock></div><div className="mt-5"><SectionTitle title="Timeline"/><Timeline items={[{title:'Foto bukti dicatat',time:`${detail.date} ${detail.capturedAt}`},{title:'AI analysis selesai',time:'Beberapa detik kemudian',status:`${detail.aiScore}% confidence`},{title:'Konfirmasi pengawas',text:detail.note,time:'Final',status:detail.finalStatus}]}/></div></Card></div></>;
  const rows=state.validations.filter(v=>v.school===user.organization);
  return <><PageHeader title="Riwayat Validasi" subtitle="Arsip digital Sidak Nalar sekolah yang dapat ditelusuri kembali."/><Card><SimpleTable headers={['Tanggal','Vendor','Menu','AI Score','Keputusan','Status','']} rows={rows.map(v=>[v.date,v.sppg,v.menu,<b key="score">{v.aiScore}%</b>,v.humanStatus,<StatusBadge key="status" status={v.finalStatus}/>,<Link key="link" href={`/teacher/history/${v.id}`} className="font-bold text-brand-700">Detail</Link>])}/></Card></>;
}

function TeacherAnomaly({ user, path, state, update }: RoleAppProps) {
  if(path[1]==='new') return <NewAnomaly user={user} state={state} update={update}/>;
  const detail=path[1]?state.anomalies.find(a=>a.id===path[1] && a.school===user.organization):null;
  if(detail) return <><PageHeader title={detail.id} subtitle={detail.title} action={<LinkButton href="/teacher/anomaly" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><Card><div className="flex flex-wrap items-center gap-2"><StatusBadge status={detail.severity}/><StatusBadge status={detail.status}/></div><h2 className="mt-4 text-xl font-black">{detail.title}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{detail.description}</p><div className="mt-5 grid grid-cols-2 gap-3"><KeyValue label="SPPG" value={detail.sppg}/><KeyValue label="Sekolah" value={detail.school}/><KeyValue label="Kategori" value={detail.category}/><KeyValue label="Reporter" value={detail.reporter}/></div></Card><Card><SectionTitle title="Timeline Penanganan"/><Timeline items={[{title:'Laporan dibuat',time:detail.date,status:'OPEN'},...(detail.vendorResponse?[{title:'Respons vendor',text:detail.vendorResponse,time:'Setelah verifikasi vendor',status:'CORRECTIVE ACTION'}]:[]),...(detail.resolutionNote?[{title:'Diselesaikan',text:detail.resolutionNote,time:'Final',status:'RESOLVED'}]:[])]}/></Card></div></>;
  return <><PageHeader title="Laporan Anomali" subtitle="Pantau laporan yang Anda kirim dan tindak lanjutnya." action={<LinkButton href="/teacher/anomaly/new"><AlertTriangle className="h-4 w-4"/>Lapor Anomali</LinkButton>}/><Card><SimpleTable headers={['Ticket','Tanggal','Kategori','Vendor','Severity','Status','']} rows={state.anomalies.filter(a=>a.reporter===user.name || a.school===user.organization).map(a=>[a.id,a.date,a.category,a.sppg,<StatusBadge key="sev" status={a.severity}/>,<StatusBadge key="st" status={a.status}/>,<Link key="link" href={`/teacher/anomaly/${a.id}`} className="font-bold text-brand-700">Detail</Link>])}/></Card></>;
}

function NewAnomaly({ user, state, update }: Pick<RoleAppProps,'user'|'state'|'update'>) {
  const ownDistributions=[...state.distributions].filter(d=>d.school===user.organization).sort((a,b)=>(b.date+b.plannedTime).localeCompare(a.date+a.plannedTime));
  const [distributionId,setDistributionId]=useState(ownDistributions[0]?.id||'');
  const [category,setCategory]=useState('Porsi');
  const [severity,setSeverity]=useState<Anomaly['severity']>('Medium');
  const [title,setTitle]=useState('');
  const [desc,setDesc]=useState('');
  const [evidenceName,setEvidenceName]=useState('');
  const [success,setSuccess]=useState('');
  const dist=ownDistributions.find(d=>d.id===distributionId)||ownDistributions[0];
  const submit=()=>{
    if(!dist||!title.trim()||!desc.trim()) return;
    const date=jakartaDate();
    const id=`ANM-${date.replaceAll('-','')}-${String(state.anomalies.length+5).padStart(3,'0')}`;
    const evidenceText=evidenceName ? ` Bukti tambahan: ${evidenceName}.` : '';
    const a:Anomaly={id,date,distributionId:dist.id,school:dist.school,sppg:dist.sppg,category,severity,title,description:`${desc}${evidenceText}`,status:'OPEN',reporter:user.name};
    update(prev=>({...prev,anomalies:[a,...prev.anomalies],auditLogs:[makeAuditLog(user.name,'teacher','ANOMALY_CREATED','Anomaly',id,undefined,'OPEN'),...prev.auditLogs]}));
    setSuccess(id);
  };
  if(success)return <div className="mx-auto max-w-xl"><Card className="text-center"><div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="h-8 w-8"/></div><h1 className="mt-4 text-2xl font-black">Laporan terkirim</h1><p className="mt-2 text-sm text-slate-500">Ticket {success} sudah tercatat dan dapat dipantau dari halaman anomali.</p><LinkButton href={`/teacher/anomaly/${success}`} className="mt-5">Lihat Laporan</LinkButton></Card></div>;
  return <><PageHeader title="Lapor Anomali" subtitle="Gunakan kanal ini untuk porsi, kualitas, keterlambatan, atau ketidaksesuaian prosedur."/><Card className="mx-auto max-w-3xl"><label className="block"><span className="mb-1 block text-xs font-bold">Distribusi terkait</span><select value={distributionId} onChange={e=>setDistributionId(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">{ownDistributions.map(d=><option value={d.id} key={d.id}>{d.date} • {d.sppg} • {d.id}</option>)}</select></label><div className="mt-4 grid gap-4 sm:grid-cols-2"><label><span className="mb-1 block text-xs font-bold">Kategori</span><select value={category} onChange={e=>setCategory(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">{['Kualitas makanan','Porsi','Keterlambatan','Makanan tidak sesuai menu','Indikasi basi/tidak layak','Jumlah porsi kurang','Kemasan','Lainnya'].map(x=><option key={x}>{x}</option>)}</select></label><label><span className="mb-1 block text-xs font-bold">Severity</span><select value={severity} onChange={e=>setSeverity(e.target.value as Anomaly['severity'])} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm">{['Low','Medium','High','Critical'].map(x=><option key={x}>{x}</option>)}</select></label></div>{dist&&<div className="mt-4 grid gap-3 sm:grid-cols-2"><KeyValue label="Sekolah" value={dist.school}/><KeyValue label="Vendor" value={dist.sppg}/></div>}<label className="mt-4 block"><span className="mb-1 block text-xs font-bold">Judul</span><input value={title} onChange={e=>setTitle(e.target.value)} className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm" placeholder="Ringkas temuan utama"/></label><label className="mt-4 block"><span className="mb-1 block text-xs font-bold">Deskripsi</span><textarea value={desc} onChange={e=>setDesc(e.target.value)} rows={5} className="w-full rounded-xl border border-slate-200 p-3 text-sm" placeholder="Jelaskan kondisi aktual dan bukti yang tersedia."/></label><label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5 text-center text-xs font-semibold text-slate-600 hover:bg-slate-100"><Upload className="h-5 w-5"/>{evidenceName||'Unggah bukti tambahan'}<input type="file" accept="image/*,.pdf" className="hidden" onChange={e=>setEvidenceName(e.target.files?.[0]?.name||'')}/></label><Button className="mt-5 w-full" onClick={submit} disabled={!dist||!title.trim()||!desc.trim()}><Send className="h-4 w-4"/>Kirim Laporan</Button></Card></>;
}

function TeacherVoting({ state }: RoleAppProps) {
  const options=menus.slice(5,10).filter(m=>state.menuActive[m.id]!==false).slice(0,3);
  const seeded:Record<string,number>={ [menus[5].id]:138, [menus[6].id]:112, [menus[7].id]:77 };
  const liveVotes=Object.values(state.votes);
  const counts=options.map(m=>(seeded[m.id]||0)+liveVotes.filter(id=>id===m.id).length);
  const total=counts.reduce((a,b)=>a+b,0);
  return <><PageHeader title="Musyawarah Kelas" subtitle="Guru melihat tingkat partisipasi dan rekap pilihan, tanpa mengubah suara siswa."/><div className="grid gap-5 lg:grid-cols-[.7fr_1.3fr]"><Card><SectionTitle title="Partisipasi"/><div className="text-4xl font-black text-brand-700">{total}<span className="text-lg text-slate-400"> / 420</span></div><p className="mt-2 text-xs text-slate-500">Siswa telah berpartisipasi.</p><div className="mt-4"><Progress value={Math.min(100,Math.round(total/420*100))} label="Response rate"/></div><div className="mt-4"><StatusBadge status="Voting Active"/></div></Card><Card><SectionTitle title="Rekap Pilihan"/><div className="space-y-4">{options.map((m,i)=>{const pct=total?Math.round(counts[i]/total*100):0;return <div key={m.id}><div className="mb-1 flex justify-between text-sm"><span className="font-bold">{m.name}</span><span className="font-black text-brand-700">{pct}%</span></div><Progress value={pct}/></div>})}</div></Card></div></>;
}

function TeacherSop(){return <><PageHeader title="SOP Gizi & Validasi" subtitle="Panduan singkat agar bukti lapangan konsisten dan mudah digunakan."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[['SOP Pengambilan Foto','Ambil sampel dari sudut yang konsisten, cukup cahaya, dan fokus pada seluruh komponen makanan.'],['SOP Validasi Porsi','Bandingkan kondisi aktual dengan standar menu. AI hanya membantu memberikan indikasi awal.'],['SOP Pelaporan Anomali','Catat kategori, severity, deskripsi faktual, dan bukti pendukung tanpa membuat kesimpulan di luar kewenangan.'],['Panduan Makanan Layak','Periksa perubahan warna, bau, tekstur, kemasan, serta kondisi penyajian sesuai SOP yang berlaku.'],['Human Verification','Keputusan final selalu ditetapkan pengguna berwenang setelah melihat foto, metadata, dan hasil analisis awal.']].map(([t,d],i)=><Card key={t}><div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-sm font-black text-brand-700">{i+1}</div><h3 className="font-extrabold">{t}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{d}</p></Card>)}</div></>}

function TeacherProfile({user,state}:RoleAppProps){const count=state.validations.filter(v=>v.teacher===user.name).length;const initials=user.name.split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase();return <><PageHeader title="Profil Pengawas" subtitle="Informasi akun dan statistik pengawasan."/><div className="mx-auto max-w-2xl"><Card><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-100 text-xl font-black text-brand-700">{initials||'G'}</div><div><h2 className="text-xl font-black">{user.name}</h2><p className="text-sm text-slate-500">{user.organization}</p><div className="mt-2"><StatusBadge status="Active"/></div></div></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><KeyValue label="Role" value="Guru / Pengawas"/><KeyValue label="Validasi Bulan Ini" value={count}/><KeyValue label="Keterangan" value={user.subtitle||'-'}/></div></Card></div></>}
