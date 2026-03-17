import { useState } from "react";
import { logger } from "@/utils/logger";
import { supabaseAvailable } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useAIStatus } from "@/hooks/useAIStatus";
import { getQualityTier } from "@/hooks/useQualityTier";

/**
 * Debug diagnostic panel — toggled with Ctrl+Shift+D in dev, or via URL param ?debug=true.
 * Shows system health, recent logs, and state.
 */
export function DiagnosticPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, authUnavailable } = useAuth();
  const aiStatus = useAIStatus();

  const showPanel = import.meta.env.DEV ||
    (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "true");

  if (!showPanel) return null;

  const logs = logger.getRecentLogs(30);
  const criticalLogs = logger.getLogsByLevel("critical");
  const errorLogs = logger.getLogsByLevel("error");

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] w-8 h-8 rounded-full text-[10px] font-bold border"
        style={{
          background: criticalLogs.length > 0 ? "hsl(0 70% 50%)" : errorLogs.length > 0 ? "hsl(40 90% 50%)" : "hsl(150 60% 40%)",
          color: "white",
          borderColor: "hsl(0 0% 30%)",
        }}
        title="Diagnostic Panel"
      >
        {criticalLogs.length > 0 ? "!" : errorLogs.length > 0 ? "?" : "OK"}
      </button>

      {isOpen && (
        <div
          className="fixed bottom-14 right-4 z-[9999] w-96 max-h-[60vh] overflow-y-auto rounded-xl p-4 space-y-3 text-[10px] font-mono shadow-2xl"
          style={{
            background: "hsl(225 18% 10% / 0.97)",
            border: "1px solid hsl(225 18% 20%)",
            color: "hsl(0 0% 80%)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-white">Diagnostics</span>
            <button onClick={() => setIsOpen(false)} className="text-white/50 hover:text-white">X</button>
          </div>

          {/* System Status */}
          <div className="space-y-1">
            <p className="font-bold text-white/70">System Status</p>
            <p>Supabase: {supabaseAvailable ? "connected" : "offline"}</p>
            <p>Auth: {user ? `authenticated (${user.id.slice(0, 8)}...)` : authUnavailable ? "unavailable" : "not logged in"}</p>
            <p>AI Coach: <span style={{ color: aiStatus.isAvailable ? "hsl(150 60% 60%)" : "hsl(40 90% 60%)" }}>
              {aiStatus.status}
            </span> {aiStatus.failCount > 0 ? `(${aiStatus.failCount} fails)` : ""}</p>
            <p>Quality Tier: {getQualityTier()}</p>
            <p>Online: {typeof navigator !== "undefined" && navigator.onLine ? "yes" : "no"}</p>
          </div>

          {/* Critical Errors */}
          {criticalLogs.length > 0 && (
            <div className="space-y-1">
              <p className="font-bold" style={{ color: "hsl(0 70% 65%)" }}>
                Critical Errors ({criticalLogs.length})
              </p>
              {criticalLogs.slice(-5).map((log, i) => (
                <div key={i} className="pl-2 border-l-2" style={{ borderColor: "hsl(0 70% 50%)" }}>
                  <p>[{log.context}] {log.message}</p>
                  <p className="text-white/30">{log.timestamp}</p>
                </div>
              ))}
            </div>
          )}

          {/* Recent Logs */}
          <div className="space-y-1">
            <p className="font-bold text-white/70">Recent Logs ({logs.length})</p>
            {logs.slice(-15).map((log, i) => (
              <div key={i} className="pl-2 border-l-2" style={{
                borderColor: log.level === "critical" ? "hsl(0 70% 50%)"
                  : log.level === "error" ? "hsl(40 90% 50%)"
                  : log.level === "warn" ? "hsl(45 80% 50%)"
                  : "hsl(210 30% 40%)",
              }}>
                <p>
                  <span className="text-white/40">{log.level.toUpperCase()}</span>{" "}
                  [{log.context}] {log.message}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={() => { logger.clear(); setIsOpen(false); setTimeout(() => setIsOpen(true), 100); }}
            className="text-white/40 hover:text-white text-[9px]"
          >
            Clear logs
          </button>
        </div>
      )}
    </>
  );
}
