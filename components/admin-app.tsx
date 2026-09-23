'use client';

import { Activity, Building2, Map as MapIcon, Plus, Save, School, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import { menus, schools, sppgs, users } from '@/lib/data';
import { makeAuditLog } from '@/lib/store';
import type { ManagedUser, Role } from '@/lib/types';
import type { RoleAppProps } from './app-types';
import { Button, Card, KeyValue, PageHeader, PortalHero, SearchInput, SectionTitle, SimpleTable, StatCard, StatusBadge } from './ui';

export function AdminApp(props: RoleAppProps) {
  const page = props.path[0] || 'home';
  if (page === 'users') return <AdminUsers {...props}/>;
  if (page === 'schools') return <AdminSchools/>;
  if (page === 'sppg') return <AdminSppg/>;
  if (page === 'regions') return <AdminRegions/>;
  if (page === 'menus') return <AdminMenus {...props}/>;
  if (page === 'logs') return <AdminLogs {...props}/>;
  if (page === 'settings') return <AdminSettings {...props}/>;
  return <AdminHome {...props}/>;
}

function jakartaDate(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Jakarta',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}

function AdminHome({state}:RoleAppProps){
  const allUsers=[...users,...state.managedUsers];
  const govUsers=allUsers.filter(u=>u.role==='government'&&u.status==='Active').length;
  const today=jakartaDate();
  const todayActivity=state.auditLogs.filter(l=>l.timestamp.includes(today)||l.timestamp.includes(new Intl.DateTimeFormat('id-ID',{timeZone:'Asia/Jakarta',day:'numeric',month:'numeric',year:'numeric'}).format(new Date()))).length;
  return <>
    <PortalHero eyebrow="Administrator Sistem" title="Pusat Administrasi My MBG" text="Kelola master data, akses pengguna, konfigurasi menu, dan jejak aktivitas sistem dari satu ruang kerja.">
      <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/[.06] p-3 backdrop-blur"><div><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mode</div><div className="mt-1 text-sm font-black">OPERASIONAL</div></div><div><div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Audit Log</div><div className="mt-1 text-sm font-black text-emerald-300">● AKTIF</div></div></div>
    </PortalHero>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"><StatCard label="Total Users" value={allUsers.length} icon={<Users className="h-5 w-5"/>}/><StatCard label="Active Schools" value={schools.filter(s=>s.status==='Active').length} tone="green" icon={<School className="h-5 w-5"/>}/><StatCard label="Active SPPGs" value={sppgs.length} tone="blue" icon={<Building2 className="h-5 w-5"/>}/><StatCard label="Government Users" value={govUsers} tone="slate" icon={<ShieldCheck className="h-5 w-5"/>}/><StatCard label="Activities Today" value={todayActivity} tone="orange" icon={<Activity className="h-5 w-5"/>}/></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.25fr_.75fr]"><Card><SectionTitle title="Aktivitas Sistem Terbaru" subtitle="Jejak perubahan material pada sistem"/><SimpleTable headers={['Waktu','Actor','Action','Entity']} rows={state.auditLogs.slice(0,8).map(l=>[l.timestamp,l.actor,l.action.replaceAll('_',' '),`${l.entity} • ${l.entityId}`])}/></Card><Card><SectionTitle title="Ringkasan Konfigurasi" subtitle="Status konfigurasi pada browser ini"/><div className="space-y-3"><KeyValue label="Role Access" value="Enabled"/><KeyValue label="Audit Logging" value="Enabled"/><KeyValue label="Menu Aktif" value={`${Object.values(state.menuActive).filter(Boolean).length}/${menus.length}`}/><KeyValue label="Managed Users" value={state.managedUsers.length}/></div></Card></div>
  </>;
}

function AdminUsers({user,state,update}:RoleAppProps){
  const [q,setQ]=useState('');
  const [show,setShow]=useState(false);
  const [name,setName]=useState('');
  const [email,setEmail]=useState('');
  const [role,setRole]=useState<Role>('teacher');
  const [organization,setOrganization]=useState('SMPN 5 Tangerang Selatan');
  const [password,setPassword]=useState('mymbg2026');
  const core=users.map(u=>({...u,managed:false,password:''}));
  const managed=state.managedUsers.map(u=>({...u,managed:true}));
  const rows=[...managed,...core];
  const add=()=>{
    if(!name.trim()||!email.trim()||!organization.trim()||!password.trim()) return;
    if(rows.some(u=>u.email.toLowerCase()===email.trim().toLowerCase())){window.alert('Email sudah digunakan.');return;}
    const item:ManagedUser={id:`usr-${Date.now()}`,name:name.trim(),email:email.trim().toLowerCase(),password,role,organization:organization.trim(),status:'Active',lastLogin:'Belum pernah'};
    update(prev=>({...prev,managedUsers:[item,...prev.managedUsers],auditLogs:[makeAuditLog(user.name,'admin','USER_CREATED','User',item.id,undefined,'Active'),...prev.auditLogs]}));
    setName('');setEmail('');setRole('teacher');setOrganization('SMPN 5 Tangerang Selatan');setPassword('mymbg2026');setShow(false);
  };
  const toggle=(id:string)=>update(prev=>{const target=prev.managedUsers.find(u=>u.id===id);const next=target?.status==='Active'?'Inactive':'Active';return {...prev,managedUsers:prev.managedUsers.map(u=>u.id===id?{...u,status:next}:u),auditLogs:[makeAuditLog(user.name,'admin','USER_STATUS_CHANGED','User',id,target?.status,next),...prev.auditLogs]}});
  const data=rows.filter(u=>(u.name+u.email+u.organization+u.role).toLowerCase().includes(q.toLowerCase()));
  return <><PageHeader title="User Management" subtitle="Kelola akun tambahan, role, organisasi, dan status akses pengguna." action={<Button onClick={()=>setShow(v=>!v)}><Plus className="h-4 w-4"/>Tambah Pengguna</Button>}/>{show&&<Card className="mb-5"><SectionTitle title="Pengguna Baru"/><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Nama lengkap" className="h-11 rounded-xl border border-slate-200 px-3 text-sm"/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="h-11 rounded-xl border border-slate-200 px-3 text-sm"/><select value={role} onChange={e=>setRole(e.target.value as Role)} className="h-11 rounded-xl border border-slate-200 px-3 text-sm"><option value="student">Student</option><option value="teacher">Teacher</option><option value="vendor">Vendor</option><option value="government">Government</option><option value="admin">Admin</option></select><input value={organization} onChange={e=>setOrganization(e.target.value)} placeholder="Organisasi" className="h-11 rounded-xl border border-slate-200 px-3 text-sm"/><input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password awal" className="h-11 rounded-xl border border-slate-200 px-3 text-sm"/></div><div className="mt-4 flex justify-end gap-2"><Button variant="ghost" onClick={()=>setShow(false)}>Batal</Button><Button onClick={add}>Simpan</Button></div></Card>}<div className="mb-4 max-w-md"><SearchInput value={q} onChange={setQ} placeholder="Cari user..."/></div><Card><SimpleTable headers={['Nama','Email','Role','Organisasi','Status','Last Login','']} rows={data.map(u=>[u.name,u.email,<span key="role" className="capitalize font-bold">{u.role}</span>,u.organization,<StatusBadge key="s" status={u.status}/>,u.lastLogin,u.managed?<button key="a" onClick={()=>toggle(u.id)} className="text-xs font-extrabold text-brand-700">{u.status==='Active'?'Nonaktifkan':'Aktifkan'}</button>:<span key="core" className="text-[10px] font-bold text-slate-400">Akun inti</span>])}/></Card></>;
}

function AdminSchools(){
  const [q,setQ]=useState('');
  const data=schools.filter(s=>(s.name+s.code+s.region+s.sppg).toLowerCase().includes(q.toLowerCase()));
  return <><PageHeader title="Direktori Sekolah" subtitle="Sekolah yang terhubung dengan My MBG."/><div className="mb-4 max-w-md"><SearchInput value={q} onChange={setQ} placeholder="Cari sekolah..."/></div><Card><SimpleTable headers={['Kode','Sekolah','Wilayah','SPPG','Siswa','Status']} rows={data.map(s=>[s.code,s.name,s.region,s.sppg,s.students,<StatusBadge key="s" status={s.status}/>])}/></Card></>;
}

function AdminSppg(){
  const [q,setQ]=useState('');
  const data=sppgs.filter(s=>(s.name+s.code+s.region).toLowerCase().includes(q.toLowerCase()));
  return <><PageHeader title="Direktori SPPG" subtitle="Unit SPPG dan cakupan wilayah yang tersedia pada sistem."/><div className="mb-4 max-w-md"><SearchInput value={q} onChange={setQ} placeholder="Cari SPPG..."/></div><Card><SimpleTable headers={['Kode','Nama','Wilayah','Sekolah','Compliance','Risk']} rows={data.map(s=>[s.code,s.name,s.region,s.schools,`${s.compliance}%`,<StatusBadge key="r" status={s.risk}/>])}/></Card></>;
}

function AdminRegions(){
  const regions = Array.from(new globalThis.Map<string, [string, string, string]>(sppgs.map(s => [`${s.province}-${s.region}`, [s.province, s.region, 'Active']])).values());
  return <><PageHeader title="Wilayah" subtitle="Hierarki wilayah yang digunakan pada filter dan monitoring."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{regions.map(([p,c,s])=><Card key={c}><div className="flex items-center gap-3"><div className="rounded-xl bg-brand-50 p-3 text-brand-700"><MapIcon className="h-5 w-5"/></div><div><div className="font-extrabold">{c}</div><div className="text-xs text-slate-500">{p}</div></div><div className="ml-auto"><StatusBadge status={s}/></div></div></Card>)}</div></>;
}

function AdminMenus({user,state,update}:RoleAppProps){
  const toggle=(id:string)=>{
    const active=state.menuActive[id]!==false;
    const activeCount=menus.filter(m=>state.menuActive[m.id]!==false).length;
    if(active&&activeCount<=1){window.alert('Minimal satu menu harus tetap aktif.');return;}
    update(prev=>{const old=prev.menuActive[id]!==false;const next=!old;return {...prev,menuActive:{...prev.menuActive,[id]:next},auditLogs:[makeAuditLog(user.name,'admin',next?'MENU_ACTIVATED':'MENU_DEACTIVATED','Menu',id,old?'Active':'Inactive',next?'Active':'Inactive'),...prev.auditLogs]}});
  };
  return <><PageHeader title="Menu Master" subtitle="Aktifkan atau nonaktifkan menu yang tersedia untuk perencanaan dan distribusi."/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{menus.map(m=>{const active=state.menuActive[m.id]!==false;return <Card key={m.id} className="overflow-hidden p-0"><img src={m.image} alt={m.name} className="h-36 w-full object-cover"/><div className="p-4"><div className="text-[10px] font-bold uppercase text-brand-600">{m.day} • {m.date}</div><div className="mt-1 font-extrabold">{m.name}</div><div className="mt-2 text-xs text-slate-500">{m.calories} kcal • {m.protein}g protein • {m.carbs}g karbo</div><div className="mt-3 flex items-center justify-between"><StatusBadge status={active?'Active':'Inactive'}/><button type="button" onClick={()=>toggle(m.id)} className="text-xs font-extrabold text-brand-700">{active?'Nonaktifkan':'Aktifkan'}</button></div></div></Card>})}</div></>;
}

function AdminLogs({state}:RoleAppProps){return <><PageHeader title="System Logs" subtitle="Aktivitas material pada sistem. Riwayat bersifat read-only."/><Card><SimpleTable headers={['Timestamp','Actor','Role','Action','Entity','Status Baru']} rows={state.auditLogs.map(l=>[l.timestamp,l.actor,<span key="r" className="capitalize font-semibold">{l.role}</span>,l.action.replaceAll('_',' '),`${l.entity} • ${l.entityId}`,l.newStatus?<StatusBadge key="s" status={l.newStatus}/>:<span key="dash">-</span>])}/></Card></>}

function AdminSettings({user,state,update}:RoleAppProps){
  const [emailNotif,setEmailNotif]=useState(state.adminSettings.emailNotif);
  const [criticalAlert,setCriticalAlert]=useState(state.adminSettings.criticalAlert);
  const [saved,setSaved]=useState(false);
  const save=()=>{update(prev=>({...prev,adminSettings:{emailNotif,criticalAlert},auditLogs:[makeAuditLog(user.name,'admin','SETTINGS_UPDATED','Settings','notification'),...prev.auditLogs]}));setSaved(true);window.setTimeout(()=>setSaved(false),2200)};
  return <><PageHeader title="Settings" subtitle="Atur preferensi notifikasi dan eskalasi sistem."/><div className="grid gap-5 lg:grid-cols-2"><Card><SectionTitle title="Notifikasi"/><label className="flex items-center justify-between border-b border-slate-100 py-3"><span><span className="block text-sm font-bold">Email operasional</span><span className="text-xs text-slate-500">Ringkasan aktivitas dan status layanan.</span></span><input type="checkbox" checked={emailNotif} onChange={e=>setEmailNotif(e.target.checked)} className="h-5 w-5"/></label><label className="flex items-center justify-between py-3"><span><span className="block text-sm font-bold">Critical anomaly alert</span><span className="text-xs text-slate-500">Prioritaskan notifikasi untuk anomali critical.</span></span><input type="checkbox" checked={criticalAlert} onChange={e=>setCriticalAlert(e.target.checked)} className="h-5 w-5"/></label><Button onClick={save} className="mt-4"><Save className="h-4 w-4"/>Simpan Pengaturan</Button>{saved&&<div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">Pengaturan berhasil disimpan.</div>}</Card><Card><SectionTitle title="Konfigurasi Aktif"/><div className="space-y-3"><KeyValue label="Email Operasional" value={state.adminSettings.emailNotif?'Aktif':'Nonaktif'}/><KeyValue label="Critical Alert" value={state.adminSettings.criticalAlert?'Aktif':'Nonaktif'}/><KeyValue label="Audit Logging" value="Enabled"/><KeyValue label="Role Access" value="Enabled"/></div></Card></div></>;
}
