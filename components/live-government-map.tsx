'use client';

import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export type MapSppg = {
  id: string;
  name: string;
  code: string;
  region: string;
  province: string;
  lat: number;
  lon: number;
  compliance: number;
  anomalies: number;
  schools: number;
  risk: string;
};

declare global {
  interface Window { L?: any; }
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject(new Error('browser only'));
  if (window.L) return Promise.resolve(window.L);

  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = LEAFLET_CSS;
    css.crossOrigin = '';
    document.head.appendChild(css);
  }

  return new Promise((resolve, reject) => {
    const existing = document.getElementById('leaflet-runtime') as HTMLScriptElement | null;
    if (existing) {
      if (window.L) return resolve(window.L);
      existing.addEventListener('load', () => resolve(window.L), { once: true });
      existing.addEventListener('error', () => reject(new Error('Leaflet gagal dimuat')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'leaflet-runtime';
    script.src = LEAFLET_JS;
    script.async = true;
    script.crossOrigin = '';
    script.onload = () => resolve(window.L);
    script.onerror = () => reject(new Error('Leaflet gagal dimuat'));
    document.body.appendChild(script);
  });
}

function riskColor(risk: string) {
  const r = risk.toLowerCase();
  if (r === 'critical') return '#dc2626';
  if (r === 'warning') return '#f97316';
  if (r === 'watch') return '#d97706';
  return '#059669';
}

export function LiveGovernmentMap({ items, compact = false }: { items: MapSppg[]; compact?: boolean }) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const [status, setStatus] = useState<'loading'|'ready'|'error'>('loading');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');

    loadLeaflet().then((L) => {
      if (cancelled || !elRef.current) return;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const map = L.map(elRef.current, { zoomControl: true, scrollWheelZoom: !compact, attributionControl: true });
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const bounds: [number, number][] = [];
      items.forEach((item) => {
        bounds.push([item.lat, item.lon]);
        const color = riskColor(item.risk);
        const marker = L.circleMarker([item.lat, item.lon], {
          radius: compact ? 8 : 10,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: .95
        }).addTo(map);
        marker.bindPopup(`<div style="min-width:190px;font-family:Arial,sans-serif"><div style="font-weight:700;font-size:13px;color:#0b2241">${item.name}</div><div style="font-size:11px;color:#64748b;margin-top:2px">${item.code} • ${item.region}</div><div style="margin-top:8px;font-size:12px"><b>${item.compliance}%</b> compliance<br>${item.schools} sekolah • ${item.anomalies} anomali<br><span style="color:${color};font-weight:700">${item.risk}</span></div></div>`);
      });

      if (bounds.length > 1) map.fitBounds(bounds, { padding: compact ? [20,20] : [36,36], maxZoom: compact ? 9 : 10 });
      else if (bounds.length === 1) map.setView(bounds[0], 10);
      else map.setView([-6.3, 106.85], 9);

      window.setTimeout(() => map.invalidateSize(), 80);
      setStatus('ready');
    }).catch(() => {
      if (!cancelled) setStatus('error');
    });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [items, compact, retry]);

  return <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
    <div ref={elRef} className={compact ? 'h-64 w-full' : 'h-[520px] w-full'} />
    {status === 'loading' && <div className="absolute inset-0 flex items-center justify-center bg-white/86 backdrop-blur-sm"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 shadow-sm"><RefreshCw className="h-4 w-4 animate-spin"/>Memuat peta</div></div>}
    {status === 'error' && <div className="absolute inset-0 flex items-center justify-center bg-slate-50 p-6"><div className="max-w-sm text-center"><div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-amber-100 text-amber-700"><AlertTriangle className="h-5 w-5"/></div><div className="mt-3 text-sm font-extrabold text-slate-900">Peta belum dapat dimuat</div><p className="mt-1 text-xs leading-5 text-slate-500">Periksa koneksi internet untuk memuat tile OpenStreetMap.</p><button onClick={()=>setRetry(v=>v+1)} className="mt-3 rounded-lg bg-navy-900 px-4 py-2 text-xs font-bold text-white">Coba lagi</button></div></div>}
    <div className="pointer-events-none absolute bottom-3 left-3 z-[500] rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-[10px] font-bold text-slate-600 shadow-sm"><span className="text-emerald-600">● Normal</span> · <span className="text-amber-600">● Watch</span> · <span className="text-orange-600">● Warning</span> · <span className="text-red-600">● Critical</span></div>
  </div>;
}
