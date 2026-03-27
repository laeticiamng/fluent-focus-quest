// ── TabErrorBoundary ──
// Error boundary for individual tab content — prevents one tab crash from killing the whole app.

import { Component, type ReactNode } from "react";

interface TabErrorBoundaryState {
  hasError: boolean;
}

interface TabErrorBoundaryProps {
  tabName: string;
  children: ReactNode;
}

export class TabErrorBoundary extends Component<TabErrorBoundaryProps, TabErrorBoundaryState> {
  constructor(props: TabErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): TabErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error(`[TabError:${this.props.tabName}]`, error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-2xl p-8 text-center space-y-3 border border-border/30" style={{ background: "hsl(var(--card))" }}>
          <div className="text-3xl">🔧</div>
          <p className="text-sm font-bold">Cette section a rencontre une erreur</p>
          <p className="text-xs text-muted-foreground">Ta progression est sauvegardee. Essaie de changer d'onglet ou de recharger.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-1.5 rounded-lg bg-primary/15 text-primary text-xs font-medium hover:bg-primary/25 transition-colors"
          >
            Reessayer
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
