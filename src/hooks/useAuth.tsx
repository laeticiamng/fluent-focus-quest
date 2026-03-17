import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, supabaseAvailable } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** true when auth system itself failed (env vars missing, network down, timeout) */
  authUnavailable: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, session: null, loading: true, authUnavailable: false, signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authUnavailable, setAuthUnavailable] = useState(false);

  useEffect(() => {
    // If Supabase env vars are missing, immediately go to offline mode
    if (!supabaseAvailable) {
      if (import.meta.env.DEV) {
        console.warn("[Auth] Supabase unavailable — entering offline mode");
      }
      setAuthUnavailable(true);
      setLoading(false);
      return;
    }

    // Timeout guard: if auth takes too long, enter offline mode
    const loadingTimeout = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.warn("[Auth] Timeout after 8s — entering offline mode");
      }
      setAuthUnavailable(true);
      setLoading(false);
    }, 8000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(loadingTimeout);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    }).catch((err) => {
      clearTimeout(loadingTimeout);
      if (import.meta.env.DEV) {
        console.warn("[Auth] getSession failed:", err);
      }
      setAuthUnavailable(true);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      clearTimeout(loadingTimeout);
      setSession(session);
      setUser(session?.user ?? null);
      setAuthUnavailable(false);
      setLoading(false);
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    if (supabaseAvailable) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, authUnavailable, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
