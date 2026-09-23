'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

export function NavigationLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || anchor.target === '_blank') return;
      try {
        const nextUrl = new URL(anchor.href, window.location.href);
        if (nextUrl.origin !== window.location.origin) return;
        if (nextUrl.pathname === window.location.pathname && nextUrl.search === window.location.search) return;
        setLoading(true);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setLoading(false), 1600);
      } catch {
        return;
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => {
      document.removeEventListener('click', handleClick, true);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  useEffect(() => {
    if (!loading) return;
    const done = window.setTimeout(() => setLoading(false), 360);
    return () => window.clearTimeout(done);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-live="polite" aria-label="Memuat halaman">
      <div className="absolute inset-x-0 top-0 h-[3px] overflow-hidden bg-slate-200/70">
        <div className="route-progress h-full bg-gov-600" />
      </div>
      <div className="absolute right-4 top-5 flex items-center gap-2 rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-xs font-bold text-slate-600 shadow-lg backdrop-blur md:right-6 md:top-6">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-gov-600" />
        Memuat
      </div>
    </div>
  );
}
