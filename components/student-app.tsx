'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Apple, BookOpen, CalendarDays, Check, CheckCircle2, ChevronRight, Clock3,
  HeartPulse, Leaf, MessageSquare, Star, Utensils, Vote
} from 'lucide-react';
import { menus, nutritionArticles } from '@/lib/data';
import type { MealFeedback } from '@/lib/types';
import type { RoleAppProps } from './app-types';
import { Card, LinkButton, PageHeader, Progress, SectionTitle, StatusBadge } from './ui';


function jakartaDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function longDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'Asia/Jakarta', weekday: 'long', day: 'numeric', month: 'long' }).format(new Date(`${date}T12:00:00+07:00`));
}

function menuForDate(date: string) {
  return menus.find(m => m.date === date) || menus[2];
}

export function StudentApp({ user, path, state, update }: RoleAppProps) {
  const page = path[0] || 'home';
  if (page === 'menu') return <StudentMenu path={path} state={state} />;
  if (page === 'voting') return <StudentVoting userId={user.email} state={state} update={update} />;
  if (page === 'nutrition') return <StudentNutrition />;
  if (page === 'profile') return <StudentProfile user={user} />;
  return <StudentHome user={user} state={state} update={update} />;
}

function StudentHome({ user, state, update }: Pick<RoleAppProps, 'user'|'state'|'update'>) {
  const todayDate = jakartaDate();
  const activeMenus=menus.filter(m=>state.menuActive[m.id]!==false);
  const today = activeMenus.find(m=>m.date===todayDate) || activeMenus.find(m=>m.date>todayDate) || activeMenus.at(-1) || menuForDate(todayDate);
  const todayIndex = activeMenus.findIndex(m=>m.id===today.id);
  const tomorrow = activeMenus[Math.min(Math.max(todayIndex,0)+1, activeMenus.length-1)] || today;
  const voted = state.votes[user.email];
  const firstName = user.name.split(' ')[0];
  const feedbackKey = `${user.email}:${today.date}`;
  const feedback = state.mealFeedback[feedbackKey];

  return (
    <>
      <section className="mb-6 grid overflow-hidden rounded-2xl border border-sky-100 bg-white md:grid-cols-[1fr_.9fr]">
        <div className="flex flex-col justify-center p-6 sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[.16em] text-brand-600">{longDate(today.date)}</div>
          <h1 className="mt-3 text-3xl font-black tracking-[-.035em] text-navy-900 sm:text-4xl">Halo, {firstName}.</h1>
          <p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">Menu hari ini sudah tersedia. Cek isi piringmu, berikan umpan balik setelah makan, atau ikut memilih menu minggu depan.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={`/student/menu/${today.id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white hover:bg-brand-700"><Utensils className="h-4 w-4"/>Lihat menu hari ini</Link>
            <Link href="/student/voting" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-extrabold text-slate-700 hover:bg-slate-50"><Vote className="h-4 w-4"/>Voting menu</Link>
          </div>
        </div>
        <div className="bg-sky-50 p-3 sm:p-4">
          <img src={today.image} alt={today.name} className="h-64 w-full rounded-xl object-cover md:h-full md:min-h-[300px]"/>
        </div>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <StudentQuick icon={<Utensils className="h-5 w-5"/>} label="Menu hari ini" value={`${today.calories} kcal`} tone="blue" />
        <StudentQuick icon={<Vote className="h-5 w-5"/>} label="Voting menu" value={voted ? 'Sudah memilih' : 'Belum memilih'} tone="yellow" />
        <StudentQuick icon={<MessageSquare className="h-5 w-5"/>} label="Umpan balik" value={feedback ? 'Sudah dikirim' : 'Belum diisi'} tone="green" />
        <StudentQuick icon={<BookOpen className="h-5 w-5"/>} label="Belajar gizi" value={`${nutritionArticles.length} bacaan`} tone="blue" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card className="overflow-hidden p-0">
          <div className="grid md:grid-cols-[.95fr_1.05fr]">
            <div className="relative bg-slate-50 p-4">
              <div className="absolute left-6 top-6 z-10 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 shadow-sm"><CalendarDays className="h-3.5 w-3.5"/>{today.day}</div>
              <img src={today.image} alt={today.name} className="h-full min-h-[260px] w-full rounded-xl object-cover" />
            </div>
            <div className="p-5 sm:p-6">
              <div className="text-[11px] font-bold uppercase tracking-[.13em] text-brand-600">Menu hari ini</div>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-navy-900">{today.name}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{today.description}</p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Nutrient value={today.calories} unit="kcal" label="Energi" />
                <Nutrient value={today.protein} unit="g" label="Protein" />
                <Nutrient value={today.carbs} unit="g" label="Karbo" />
                <Nutrient value={today.fat} unit="g" label="Lemak" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link href={`/student/menu/${today.id}`} className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-4 text-sm font-extrabold text-white">Detail gizi</Link>
                <Link href="/student/menu" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 text-sm font-extrabold text-slate-700">Menu 2 minggu</Link>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-5">
          <Card>
            <SectionTitle title="Besok" subtitle={`${tomorrow.day}, ${new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'long'}).format(new Date(`${tomorrow.date}T12:00:00+07:00`))}`} />
            <div className="flex items-center gap-3">
              <img src={tomorrow.image} alt={tomorrow.name} className="h-20 w-24 rounded-xl object-cover" />
              <div className="min-w-0"><div className="text-sm font-black text-navy-900">{tomorrow.name}</div><div className="mt-1 text-xs text-slate-500">{tomorrow.calories} kcal • {tomorrow.protein}g protein</div><Link href={`/student/menu/${tomorrow.id}`} className="mt-2 inline-flex text-xs font-extrabold text-brand-700">Lihat detail</Link></div>
            </div>
          </Card>
          <Card>
            <SectionTitle title="Voting Minggu Depan" subtitle="Pilih sebelum Kamis, 17.00 WIB" />
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Vote className="h-6 w-6 text-amber-700"/>
              <div className="mt-3 text-base font-black text-navy-900">{voted ? 'Pilihanmu sudah tersimpan' : 'Menu mana yang kamu pilih?'}</div>
              <p className="mt-1 text-xs leading-5 text-slate-600">{voted ? `Pilihan saat ini: ${menus.find(m=>m.id===voted)?.name || 'menu'}.` : 'Bandingkan menu dan kandungan gizinya sebelum memilih.'}</p>
              <Link href="/student/voting" className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-500 px-4 text-sm font-extrabold text-white hover:bg-amber-600">{voted ? 'Lihat pilihan' : 'Pilih menu'}</Link>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[.85fr_1.15fr]">
        <MealFeedbackCard userId={user.email} school={user.organization} menuId={today.id} date={today.date} current={feedback} update={update} />
        <Card>
          <SectionTitle title="Menu Minggu Ini" subtitle="Senin–Jumat, lengkap dengan informasi gizi" action={<Link href="/student/menu" className="text-xs font-bold text-brand-700">Lihat semua</Link>} />
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
            {menus.slice(0,5).filter(m=>state.menuActive[m.id]!==false).map((m)=><Link href={`/student/menu/${m.id}`} key={m.id} className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition hover:border-brand-200 hover:shadow-sm"><img src={m.image} alt={m.name} className="h-24 w-full object-cover"/><div className="p-3"><div className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{m.day}</div><div className="mt-1 line-clamp-2 text-xs font-extrabold text-navy-900">{m.name}</div><div className="mt-2 text-[10px] font-semibold text-slate-500">{m.calories} kcal</div></div></Link>)}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.25fr_.75fr]">
        <Card>
          <SectionTitle title="Jadwal 2 Minggu" subtitle="Rencana menu sekolah" />
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {menus.filter(m=>state.menuActive[m.id]!==false).map((m)=><Link key={m.id} href={`/student/menu/${m.id}`} className={`rounded-xl border p-3 transition hover:border-brand-300 ${m.id===today.id?'border-brand-300 bg-brand-50':'border-slate-200 bg-white'}`}><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{m.day} • {m.date.slice(5).replace('-','/')}</div><div className="mt-1 text-xs font-black text-navy-900">{m.name}</div>{m.id===today.id&&<div className="mt-2 text-[9px] font-extrabold text-brand-700">Hari ini</div>}</Link>)}
          </div>
        </Card>
        <Card>
          <SectionTitle title="Belajar Gizi" subtitle="Bacaan singkat untuk siswa" />
          <div className="space-y-2">
            {nutritionArticles.slice(0,4).map((a)=><Link href="/student/nutrition" key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:bg-slate-50"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700"><Leaf className="h-4 w-4"/></div><div className="min-w-0 flex-1"><div className="text-xs font-extrabold text-navy-900">{a.title}</div><div className="mt-1 line-clamp-1 text-[10px] text-slate-500">{a.excerpt}</div></div><ChevronRight className="h-4 w-4 text-slate-300"/></Link>)}
          </div>
        </Card>
      </div>
    </>
  );
}

function MealFeedbackCard({ userId, school, menuId, date, current, update }: { userId: string; school: string; menuId: string; date: string; current?: MealFeedback; update: RoleAppProps['update'] }) {
  const [level,setLevel]=useState<MealFeedback['level']>(current?.level || 'finished');
  const [rating,setRating]=useState(current?.rating || 4);
  const [saved,setSaved]=useState(Boolean(current));
  const key=`${userId}:${date}`;
  const submit=()=>{
    update(prev=>({...prev,mealFeedback:{...prev.mealFeedback,[key]:{menuId,level,rating,submittedAt:new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date()),school}}}));
    setSaved(true);
  };
  return <Card><SectionTitle title="Setelah Makan" subtitle="Bantu sekolah memahami penerimaan menu"/>{saved&&current?<div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4"/>Umpan balik sudah tercatat. Kamu masih bisa memperbaruinya.</div>:null}<div className="text-xs font-bold text-slate-600">Berapa banyak yang kamu habiskan?</div><div className="mt-3 grid grid-cols-3 gap-2">{([['finished','Habis'],['partial','Sebagian'],['leftover','Banyak sisa']] as [MealFeedback['level'],string][]).map(([id,label])=><button key={id} type="button" onClick={()=>{setLevel(id);setSaved(false)}} className={`min-h-11 rounded-xl border px-2 text-xs font-extrabold ${level===id?'border-brand-500 bg-brand-50 text-brand-700':'border-slate-200 text-slate-600'}`}>{label}</button>)}</div><div className="mt-5 text-xs font-bold text-slate-600">Seberapa suka menu hari ini?</div><div className="mt-2 flex gap-1">{[1,2,3,4,5].map(n=><button key={n} type="button" aria-label={`${n} bintang`} onClick={()=>{setRating(n);setSaved(false)}} className="p-1"><Star className={`h-6 w-6 ${n<=rating?'fill-amber-400 text-amber-400':'text-slate-200'}`}/></button>)}</div><button onClick={submit} className="mt-4 h-11 w-full rounded-xl bg-navy-900 text-sm font-extrabold text-white hover:bg-navy-800">{saved?'Perbarui umpan balik':'Kirim umpan balik'}</button></Card>;
}

function StudentQuick({icon,label,value,tone}:{icon:React.ReactNode;label:string;value:string;tone:'blue'|'yellow'|'green'}) {
  const toneClass = {blue:'bg-sky-50 text-brand-700', yellow:'bg-amber-50 text-amber-700', green:'bg-emerald-50 text-emerald-700'}[tone];
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneClass}`}>{icon}</div><div className="mt-3 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div><div className="mt-1 text-sm font-black text-navy-900">{value}</div></div>;
}

function Nutrient({value,unit,label}:{value:number;unit:string;label:string}) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-3"><div className="text-lg font-black text-navy-900">{value}<span className="ml-1 text-[10px] font-bold text-slate-400">{unit}</span></div><div className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</div></div>;
}

function StudentMenu({ path, state }: { path: string[]; state: RoleAppProps['state'] }) {
  const [week, setWeek] = useState<'current'|'next'>('current');
  const detail = path[1] ? menus.find(m=>m.id===path[1] && state.menuActive[m.id]!==false) : null;
  if (detail) {
    return <><PageHeader title={detail.name} subtitle={`${detail.day}, ${detail.date}`} action={<LinkButton href="/student/menu" variant="secondary">Kembali</LinkButton>}/><div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]"><Card className="overflow-hidden p-3"><img src={detail.image} className="w-full rounded-xl object-cover" alt={detail.name}/><div className="mt-3 text-sm font-bold text-slate-600">{detail.calories} kcal per porsi</div></Card><div className="space-y-5"><Card><SectionTitle title="Isi Piring"/><div className="grid grid-cols-2 gap-2">{detail.components.map((x)=><div key={x} className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-bold text-navy-900">{x}</div>)}</div></Card><Card><SectionTitle title="Informasi Gizi"/><div className="grid grid-cols-2 gap-3 sm:grid-cols-4"><Nutrient value={detail.calories} unit="kcal" label="Energi"/><Nutrient value={detail.protein} unit="g" label="Protein"/><Nutrient value={detail.carbs} unit="g" label="Karbo"/><Nutrient value={detail.fat} unit="g" label="Lemak"/></div><div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900"><b>Kenapa menu ini seimbang?</b><br/>Protein membantu pertumbuhan, sayur dan buah memberi serat serta vitamin, sementara karbohidrat memberi energi untuk belajar dan beraktivitas.</div></Card></div></div></>;
  }
  const list = (week==='current' ? menus.slice(0,5) : menus.slice(5,10)).filter(m=>state.menuActive[m.id]!==false);
  return <><PageHeader title="Menu MBG" subtitle="Lihat rencana menu dua minggu lengkap dengan kandungan gizinya."/><div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-1"><button type="button" onClick={()=>setWeek('current')} className={`rounded-lg px-4 py-2 text-xs font-extrabold ${week==='current'?'bg-brand-600 text-white':'text-slate-500'}`}>Minggu Ini</button><button type="button" onClick={()=>setWeek('next')} className={`rounded-lg px-4 py-2 text-xs font-extrabold ${week==='next'?'bg-brand-600 text-white':'text-slate-500'}`}>Minggu Depan</button></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{list.map((m)=><Card key={m.id} className="overflow-hidden p-0"><img src={m.image} alt={m.name} className="h-48 w-full object-cover"/><div className="p-5"><div className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{m.day} • {m.date}</div><div className="mt-2 text-lg font-black text-navy-900">{m.name}</div><p className="mt-1 text-xs leading-5 text-slate-500">{m.description}</p><div className="mt-4 grid grid-cols-4 gap-1.5 text-center text-[9px]"><Nutrient value={m.calories} unit="" label="kcal"/><Nutrient value={m.protein} unit="g" label="protein"/><Nutrient value={m.carbs} unit="g" label="karbo"/><Nutrient value={m.fat} unit="g" label="lemak"/></div><Link href={`/student/menu/${m.id}`} className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">Lihat detail</Link></div></Card>)}</div></>;
}

function StudentVoting({ userId, state, update }: Pick<RoleAppProps,'state'|'update'> & { userId: string }) {
  const options = menus.slice(5,10).filter(m=>state.menuActive[m.id]!==false).slice(0,3);
  const selected = state.votes[userId];
  const total = options.reduce((a,m)=>a+(m.votes||0),0) + (selected ? 1 : 0);
  const vote = (id:string) => update(prev => ({...prev, votes: {...prev.votes, [userId]: id}}));
  return <><PageHeader title="Pilih Menu Minggu Depan" subtitle="Satu siswa satu suara. Pilihan dapat diubah sampai Kamis, 17.00 WIB."/><div className="grid gap-4 lg:grid-cols-3">{options.map((m)=>{const active=selected===m.id; const count=(m.votes||0)+(active?1:0); const pct=Math.round((count/Math.max(total,1))*100);return <Card key={m.id} className={`overflow-hidden p-0 ${active?'ring-2 ring-brand-500':''}`}><div className="relative"><img src={m.image} alt={m.name} className="h-48 w-full object-cover"/>{active&&<div className="absolute right-3 top-3 rounded-lg bg-brand-600 p-2 text-white"><Check className="h-4 w-4"/></div>}</div><div className="p-5"><div className="mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{m.day}, {m.date}</div><h3 className="text-lg font-black text-navy-900">{m.name}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{m.components.join(' • ')}</p><div className="mt-4 flex items-center justify-between text-xs"><span className="font-semibold text-slate-500">{m.calories} kcal • {m.protein}g protein</span><span className="font-black text-brand-700">{pct}%</span></div><Progress value={pct}/><button onClick={()=>vote(m.id)} className={`mt-4 h-11 w-full rounded-xl text-sm font-extrabold transition ${active?'bg-emerald-100 text-emerald-700':'bg-brand-600 text-white hover:bg-brand-700'}`}>{active?'Pilihan tersimpan':'Pilih menu ini'}</button></div></Card>})}</div>{selected&&<div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-800">Pilihanmu sudah tersimpan. Kamu masih bisa mengubahnya sebelum voting ditutup.</div>}</>;
}

function StudentNutrition() {
  const [selected, setSelected] = useState<string | null>(null);
  const icons=[Apple, HeartPulse, Leaf, BookOpen];
  const [filter,setFilter]=useState('Semua');
  const categories=['Semua',...Array.from(new Set(nutritionArticles.map(a=>a.category)))];
  const list=filter==='Semua'?nutritionArticles:nutritionArticles.filter(a=>a.category===filter);
  return <><PageHeader title="Belajar Gizi" subtitle="Bacaan singkat tentang makanan sehat, keamanan pangan, dan kebiasaan makan."/><div className="mb-5 flex flex-wrap gap-2">{categories.map(c=><button key={c} onClick={()=>setFilter(c)} className={`rounded-xl border px-3 py-2 text-xs font-bold ${filter===c?'border-brand-600 bg-brand-600 text-white':'border-slate-200 bg-white text-slate-600'}`}>{c}</button>)}</div><div className="grid gap-4 md:grid-cols-2">{list.map((a,i)=>{const Icon=icons[i%icons.length];const open=selected===a.id;return <Card key={a.id}><div className="flex gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><Icon className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="text-[10px] font-bold uppercase tracking-wider text-brand-600">{a.category}</div><h3 className="mt-1 text-lg font-black text-navy-900">{a.title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{a.excerpt}</p>{open&&<div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm leading-6 text-slate-600">{a.content}</div>}<button type="button" onClick={()=>setSelected(open?null:a.id)} className="mt-3 text-xs font-extrabold text-brand-700">{open?'Tutup':'Baca ringkas'}</button></div></div></Card>})}</div></>;
}

function StudentProfile({ user }: Pick<RoleAppProps,'user'>) {
  const initials=user.name.split(' ').filter(Boolean).map(x=>x[0]).slice(0,2).join('').toUpperCase();
  return <><PageHeader title="Profil" subtitle="Informasi akun siswa."/><div className="mx-auto max-w-2xl"><Card><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-xl bg-sky-50 text-lg font-black text-brand-700">{initials||'S'}</div><div><h2 className="text-xl font-black text-navy-900">{user.name}</h2><p className="mt-1 text-sm text-slate-500">{user.organization}</p><div className="mt-2"><StatusBadge status="Active"/></div></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Kelas / Keterangan</div><div className="mt-1 text-lg font-black text-navy-900">{user.subtitle||'-'}</div></div><div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><div className="text-[10px] font-bold uppercase text-slate-400">Akun</div><div className="mt-1 break-all text-sm font-black text-navy-900">{user.email}</div></div></div><div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-800"><HeartPulse className="mr-2 inline h-4 w-4"/>Data pribadi dibatasi pada informasi yang dibutuhkan untuk layanan sekolah.</div></Card></div></>;
}
