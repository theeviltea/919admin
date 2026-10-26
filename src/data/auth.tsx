// Admin session. For now any email and password sign in (no backend check yet);
// with VITE_API_URL set, POST /admin/auth/login should return { token, name } — see README.
import { createContext, useContext, useState, type ReactNode } from 'react';

export type AdminUser = { email: string; name: string; initials: string };
const KEY = '919admin.session';

function read(): AdminUser | null {
  for (const store of [() => localStorage, () => sessionStorage]) {
    try {
      const v = store().getItem(KEY);
      if (v) return JSON.parse(v) as AdminUser;
    } catch {
      /* storage unavailable */
    }
  }
  return null;
}

function nameFrom(email: string) {
  const local = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  const name = local ? local.replace(/\b\w/g, (c) => c.toUpperCase()) : 'Admin';
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return { name, initials };
}

const Ctx = createContext<{ user: AdminUser | null; signIn: (email: string, password: string, remember: boolean) => Promise<void>; signOut: () => void } | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(read);
  const signIn = async (email: string, _password: string, remember: boolean) => {
    void _password;
    const u = { email, ...nameFrom(email) };
    try {
      (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(u));
    } catch {
      /* storage unavailable: session lives in memory */
    }
    setUser(u);
  };
  const signOut = () => {
    for (const s of [() => localStorage, () => sessionStorage]) {
      try {
        s().removeItem(KEY);
      } catch {
        /* storage unavailable */
      }
    }
    setUser(null);
  };
  return <Ctx.Provider value={{ user, signIn, signOut }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useAuth outside AuthProvider');
  return v;
}
