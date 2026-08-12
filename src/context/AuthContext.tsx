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
  username: string;
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
  signIn: (usernameOrEmail: string, password?: string) => Promise<void>;
  signUp: (params: { name: string; username: string; email: string; password?: string; focus?: OnboardingFocus }) => Promise<void>;
  signOut: () => void;
  updateUser: (patch: Partial<SaheliUser>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'saheli-auth';

// Mock user personas — pick one based on email for fallback realism.
const personas: Record<string, SaheliUser> = {
  'new@saheli.app': {
    id: 'u_new',
    name: 'Aanya',
    username: 'aanya_health',
    email: 'new@saheli.app',
    focus: 'general',
    pregnancyMode: false,
    createdAt: new Date().toISOString(),
  },
  'pcos@saheli.app': {
    id: 'u_pcos',
    name: 'Meera',
    username: 'meera_pcos',
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
    username: 'ishita_preg',
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

  const persist = (u: SaheliUser | null) => {
    setUser(u);
    if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    else localStorage.removeItem(STORAGE_KEY);
  };

  const refreshUser = async () => {
    if (user?.email) {
      try {
        const res = await api.auth.getProfile(user.email);
        if (res && res.user) {
          persist(res.user);
        }
      } catch {}
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        if (parsed.email) {
          api.auth.getProfile(parsed.email).then((res) => {
            if (res && res.user) {
              persist(res.user);
            }
          }).catch(() => {});
        }
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      signIn: async (usernameOrEmail, password) => {
        try {
          const res = await api.auth.login(usernameOrEmail, password);
          persist(res.user);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Invalid username/email or password.';
          throw new Error(errorMsg);
        }
      },
      signUp: async ({ name, username, email, password, focus = 'general' }) => {
        try {
          const res = await api.auth.signup({ name, username, email, password, focus });
          persist(res.user);
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Could not create account.';
          throw new Error(errorMsg);
        }
      },
      signOut: () => persist(null),
      updateUser: async (patch) => {
        if (user) {
          const res = await api.auth.update(user.email, patch);
          if (res && res.user) {
            persist(res.user);
            return;
          }
        }
        setUser((prev) => {
          if (!prev) return prev;
          const next = { ...prev, ...patch };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
          return next;
        });
      },
      refreshUser,
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
