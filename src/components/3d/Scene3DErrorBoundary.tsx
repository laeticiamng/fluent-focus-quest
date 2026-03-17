import { Component, type ReactNode } from "react";
import { logger } from "@/utils/logger";

interface Props {
  children: ReactNode;
  fallback: ReactNode;
  sceneName?: string;
  onError?: (message: string) => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
  retryCount: number;
}

const MAX_RETRIES = 1;

export class Scene3DErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "", retryCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, errorMessage: error.message || "Unknown 3D error" };
  }

  componentDidCatch(error: Error) {
    const label = this.props.sceneName || "unknown";
    logger.error("3D", `Scene "${label}" crashed — falling back to 2D`, {
      error: error.message,
      stack: error.stack,
    });
    this.props.onError?.(error.message);
  }

  handleRetry = () => {
    if (this.state.retryCount < MAX_RETRIES) {
      this.setState(s => ({ hasError: false, errorMessage: "", retryCount: s.retryCount + 1 }));
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.state.retryCount >= MAX_RETRIES) {
        return <>{this.props.fallback}</>;
      }
      return (
        <div className="rounded-2xl p-6 text-center space-y-3" style={{
          background: "linear-gradient(145deg, hsl(var(--card)), hsl(225 18% 9%))",
          border: "1px solid hsl(var(--border) / 0.3)",
        }}>
          <div className="text-2xl">🔧</div>
          <p className="text-xs font-bold text-foreground/80">Scene 3D interrompue</p>
          <p className="text-[10px] text-muted-foreground">
            {this.state.errorMessage.slice(0, 100)}
          </p>
          <button
            onClick={this.handleRetry}
            className="px-4 py-1.5 rounded-lg bg-primary/15 text-primary text-[10px] font-medium hover:bg-primary/25 transition-colors"
          >
            Recharger la scene
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
