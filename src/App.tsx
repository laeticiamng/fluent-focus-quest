import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { CelebrationProvider } from "@/components/CelebrationProvider";
import { Component, type ReactNode } from "react";
import { logger } from "@/utils/logger";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import NotFound from "./pages/NotFound.tsx";
import { DiagnosticPanel } from "@/components/DiagnosticPanel";

// ── Global Error Boundary — prevents blank screens on any React crash ──
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.critical("AppErrorBoundary", error.message, {
      stack: error.stack,
      componentStack: errorInfo.componentStack ?? undefined,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center px-4">
          <div className="text-center max-w-md space-y-4">
            <div className="text-5xl">🔧</div>
            <h1 className="text-xl font-black text-foreground">Erreur inattendue</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Une erreur est survenue. Tes donnees et ta progression sont sauvegardees.
            </p>
            {this.state.error && (
              <p className="text-xs text-muted-foreground/60 bg-secondary/30 rounded-lg p-3 font-mono break-all">
                {this.state.error.message}
              </p>
            )}
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
            >
              Recharger l'application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading, authUnavailable } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3 animate-pulse">🏠</div>
          <p className="text-sm font-semibold text-foreground">Operation Bienne</p>
          <p className="text-xs text-muted-foreground mt-1">Chargement...</p>
        </div>
      </div>
    );
  }

  // Auth service is unreachable — show explicit error, not a silent fake state
  if (!user && authUnavailable) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="text-4xl">🔌</div>
          <h1 className="text-lg font-bold text-foreground">Connexion impossible</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Le service d'authentification est temporairement inaccessible. Verifie ta connexion internet et reessaie.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Reessayer
          </button>
        </div>
      </div>
    );
  }

  // No user session: always show the login page — never bypass it with env guards
  if (!user) return <Auth />;

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <AppErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <CelebrationProvider>
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </CelebrationProvider>
          <DiagnosticPanel />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </AppErrorBoundary>
);

export default App;
