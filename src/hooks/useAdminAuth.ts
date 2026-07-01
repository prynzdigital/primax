import { useCallback, useEffect, useState } from 'react';
import { getSession, login as apiLogin, logout as apiLogout } from '../lib/api';
import type { AdminUser } from '../lib/types';

export type AdminState = 'loading' | 'signed-out' | 'admin';

export interface UseAdminAuthResult {
  state: AdminState;
  user: AdminUser | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export function useAdminAuth(): UseAdminAuthResult {
  const [state, setState] = useState<AdminState>('loading');
  const [user, setUser] = useState<AdminUser | null>(null);

  const refresh = useCallback(async () => {
    const { data } = await getSession();
    if (data) {
      setUser(data);
      setState('admin');
    } else {
      setUser(null);
      setState('signed-out');
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function signIn(email: string, password: string): Promise<string | null> {
    const { data, error } = await apiLogin(email, password);
    if (error || !data) {
      return error?.message ?? 'Invalid email or password.';
    }
    setUser(data);
    setState('admin');
    return null;
  }

  async function signOut() {
    await apiLogout();
    setUser(null);
    setState('signed-out');
  }

  return { state, user, signIn, signOut };
}
