import type { AppState } from '@/lib/types';
import type { SessionUser } from './app-shell';

export type RoleAppProps = {
  user: SessionUser;
  path: string[];
  state: AppState;
  update: (updater: (prev: AppState) => AppState) => void;
  reset: () => void;
  ready: boolean;
};
