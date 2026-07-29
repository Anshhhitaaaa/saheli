import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../services/api';

export type OnboardingFocus =
  | 'periods'
  | 'pcos'
  | 'fertility'
  | 'pregnancy'
  | 'menopause'
  | 'general';

export interface SaheliUser {
  id: string;
  name: string;
  email: string;
  focus: OnboardingFocus;
  pregnancyMode: boolean;
  pregnancyWeek?: number;
  cycleAvgLength?: number;
  cycleAvgPeriod?: number;
  lastPeriodStart?: string; // ISO date
  hasCompletedOnboarding?: boolean;
  createdAt: string;
}

interface AuthContextValue {
  user: SaheliUser | null;
  loading: boolean;
  signIn: (email: string, password?: string) => Promise<void>;
  signUp: (params: { name: string; email: string; password?: string; focus?: OnboardingFocus }) => Promise<void>;
  signOut: () => void;
  updateUser: (patch: Partial<SaheliUser>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'saheli-auth';

// Mock user personas — pick one based on email for fallback realism.
const personas: Record<string, SaheliUser> = {
  'new@saheli.app': {
    id: 'u_new',
    name: 'Aanya',
    email: 'new@saheli.app',
    focus: 'general',
    pregnancyMode: false,
    createdAt: new Date().toISOString(),
  },
  'pcos@saheli.app': {
    id: 'u_pcos',
    name: 'Meera',
    email: 'pcos@saheli.app',
    focus: 'pcos',
    pregnancyMode: false,
    cycleAvgLength: 35,
    cycleAvgPeriod: 6,
    lastPeriodStart: '2026-06-18',
    createdAt: '2026-01-12T09:00:00.000Z',
  },
  'pregnant@saheli.app': {
    id: 'u_preg',
    name: 'Ishita',
    email: 'pregnant@saheli.app',
    focus: 'pregnancy',
    pregnancyMode: true,
    pregnancyWeek: 22,
    cycleAvgLength: 28,
    cycleAvgPeriod: 5,
    lastPeriodStart: '2026-02-14',
    createdAt: '2025-09-01T09:00:00.000Z',
  },
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SaheliUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const persist = (u: SaheliUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        try {
          const res = await api.auth.login(email, password);
          persist(res.user);
        } catch (err: any) {
          throw new Error(err.message || 'Invalid email or password.');
        }
      },
      signUp: async ({ name, email, password, focus = 'general' }) => {
        try {
          const res = await api.auth.signup({ name, email, password, focus });
          persist(res.user);
        } catch (err: any) {
          throw new Error(err.message || 'Could not create account.');
        }
      },
      signOut: () => persist(null),
      updateUser: (patch) => {
        if (user) {
          api.auth.update(user.email, patch).catch(() => {});
        }
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, ...patch };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
