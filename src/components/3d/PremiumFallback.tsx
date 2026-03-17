import { ReactNode } from "react";

/**
 * Premium 2D fallback for when WebGL is unavailable.
 * Maintains brand cohesion and visual quality without 3D.
 * Avoids looking like a "punishment" — still feels premium.
 */
export function PremiumFallback({
  sceneName,
  icon,
  title,
  subtitle,
  accentColor = "#d4a017",
  children,
  actions,
}: {
  sceneName: string;
  icon: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
  children?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: `linear-gradient(160deg, hsl(225 30% 8%), hsl(225 20% 12%), hsl(225 25% 8%))`,
        border: `1px solid color-mix(in srgb, ${accentColor} 15%, transparent)`,
        minHeight: "180px",
      }}
    >
      {/* Decorative gradient overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 30%, color-mix(in srgb, ${accentColor} 6%, transparent), transparent 70%)`,
        }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] rounded-full"
        style={{
          width: "40%",
          background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)`,
        }}
      />

      <div className="relative z-10 p-5 flex flex-col items-center gap-3">
        {/* Header */}
        <div className="text-center">
          <div
            className="text-2xl mb-1.5"
            style={{
              filter: `drop-shadow(0 0 8px color-mix(in srgb, ${accentColor} 40%, transparent))`,
            }}
          >
            {icon}
          </div>
          <h3
            className="text-sm font-bold tracking-wide"
            style={{
              color: "rgba(255,255,255,0.88)",
              textShadow: `0 0 12px color-mix(in srgb, ${accentColor} 30%, transparent)`,
            }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-[10px] text-white/40 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Content area */}
        {children && (
          <div className="w-full">{children}</div>
        )}

        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2 mt-1">{actions}</div>
        )}

        {/* Scene badge */}
        <div className="absolute top-2 right-3">
          <span
            className="text-[7px] font-mono px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(255,255,255,0.05)",
              color: "rgba(255,255,255,0.25)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            2D · {sceneName}
          </span>
        </div>
      </div>

      {/* Bottom accent */}
      <div
        className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
        style={{
          background: `linear-gradient(to top, hsl(225 25% 6%), transparent)`,
        }}
      />
    </div>
  );
}

/**
 * Fallback action button — styled to match premium theme.
 */
export function FallbackAction({
  onClick,
  children,
  accentColor = "#d4a017",
}: {
  onClick: () => void;
  children: ReactNode;
  accentColor?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 hover:scale-[1.02]"
      style={{
        background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
        color: accentColor,
        border: `1px solid color-mix(in srgb, ${accentColor} 20%, transparent)`,
      }}
    >
      {children}
    </button>
  );
}
