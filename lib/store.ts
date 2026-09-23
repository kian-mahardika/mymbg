'use client';

import { useCallback, useEffect, useState } from 'react';
import { initialState } from './data';
import type { AuditLog, Account, AppState, Role } from './types';

export const STATE_KEY = 'mymbg_state_v9';
const SESSION_KEY = 'mymbg_session_v1';

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STATE_KEY);
      if (stored) setState({ ...initialState, ...JSON.parse(stored) });
    } catch {
      setState(initialState);
    } finally {
      setReady(true);
    }
  }, []);

  const update = useCallback((updater: (prev: AppState) => AppState) => {
    setState(prev => {
      const next = updater(prev);
      window.localStorage.setItem(STATE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    window.localStorage.setItem(STATE_KEY, JSON.stringify(initialState));
    setState(initialState);
  }, []);

  return { state, update, reset, ready };
}


export function getManagedAccounts(): Account[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STATE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.managedUsers)
      ? parsed.managedUsers.filter((u: any) => u.status === 'Active').map((u: any) => ({
          role: u.role, email: u.email, password: u.password, name: u.name, organization: u.organization, subtitle: 'Pengguna My MBG'
        }))
      : [];
  } catch {
    return [];
  }
}

export function saveSession(account: Account) {
  const safe = { role: account.role, email: account.email, name: account.name, organization: account.organization, subtitle: account.subtitle };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
}

export function getSession(): { role: Role; email: string; name: string; organization: string; subtitle: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}

export function makeAuditLog(actor: string, role: Role, action: string, entity: string, entityId: string, oldStatus?: string, newStatus?: string): AuditLog {
  return {
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }),
    actor,
    role,
    action,
    entity,
    entityId,
    oldStatus,
    newStatus
  };
}
