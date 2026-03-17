import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { supabaseAvailable } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** true when auth session could not be established (network down, timeout) */
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
    // If Supabase is not configured, skip auth entirely
    if (!supabaseAvailable) {
      logger.warn("Auth", "Supabase not configured — auth unavailable");
      setAuthUnavailable(true);
      setLoading(false);
      return;
    }

    // Timeout guard: if auth takes too long, stop loading but still allow login
    const loadingTimeout = setTimeout(() => {
      logger.error("Auth", "Session check timed out after 8s");
      setAuthUnavailable(true);
      setLoading(false);
    }, 8000);

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      clearTimeout(loadingTimeout);
      setSession(s);
      setUser(s?.user ?? null);
      if (s) {
        logger.info("Auth", "Session restored", { userId: s.user.id });
      } else {
        logger.info("Auth", "No existing session");
      }
      setLoading(false);
    }).catch((err) => {
      clearTimeout(loadingTimeout);
      logger.critical("Auth", "getSession failed", {
        error: err instanceof Error ? err.message : String(err),
      });
      setAuthUnavailable(true);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      clearTimeout(loadingTimeout);
      setSession(s);
      setUser(s?.user ?? null);
      setAuthUnavailable(false);
      setLoading(false);
      logger.info("Auth", `Auth state changed: ${event}`, {
        userId: s?.user?.id ?? null,
      });
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        logger.error("Auth", "Sign out failed", { error: error.message });
      } else {
        logger.info("Auth", "User signed out");
      }
    } catch (err) {
      logger.critical("Auth", "Sign out threw exception", {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, authUnavailable, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
