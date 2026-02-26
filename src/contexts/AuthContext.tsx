import { createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

// ─── DEV BYPASS: Mock user so we skip Supabase auth while editing the app ────
// TODO: Remove this mock and restore real auth when ready for production.
const MOCK_USER = {
  id: 'user-1',
  email: 'dev@medicconnect.local',
  created_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: { name: 'Alex Rivera' },
  aud: 'authenticated',
  role: 'authenticated',
} as unknown as User;
// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // DEV BYPASS: always return the mock user, no loading delay
  const signUp = async (_email: string, _password: string, _name?: string) => {
    return { error: null };
  };

  const signIn = async (_email: string, _password: string) => {
    return { error: null };
  };

  const signOut = async () => { };

  return (
    <AuthContext.Provider
      value={{
        user: MOCK_USER,
        session: null,
        loading: false,
        signUp,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
