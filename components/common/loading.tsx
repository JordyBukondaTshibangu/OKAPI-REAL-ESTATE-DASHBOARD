"use client";

/**
 * OkapiLoader — branded loading spinner.
 *
 * Built from the Okapi Real Estate logo: a navy circle with a gold ring,
 * a small house silhouette in the centre, and zebra-style stripes that rotate
 * around the badge to suggest the okapi's striped legs.
 *
 * Pure CSS / SVG, no external deps.
 */
export default function OkapiLoader({
  size = 96,
  label = "Chargement...",
  className = "",
}: {
  size?: number;
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`inline-flex flex-col items-center justify-center gap-3 ${className}`}
    >
      <div
        className="relative"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {/* Outer rotating gold ring with stripe gaps (the okapi's stripes) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full okapi-spin-slow"
        >
          <defs>
            <linearGradient id="okapi-gold" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#F4E4A6" />
              <stop offset="55%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9C7A1E" />
            </linearGradient>
          </defs>
          {/* Striped ring built from dashed strokes */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#okapi-gold)"
            strokeWidth="4"
            strokeDasharray="6 5"
            strokeLinecap="round"
            opacity="0.95"
          />
        </svg>

        {/* Inner counter-rotating accent arc */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full okapi-spin-reverse"
        >
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="#1E63B5"
            strokeWidth="3"
            strokeDasharray="60 200"
            strokeLinecap="round"
            opacity="0.85"
          />
        </svg>

        {/* Static navy badge with the house glyph */}
        <div className="absolute inset-[18%] rounded-full bg-navy flex items-center justify-center shadow-[0_4px_18px_rgba(11,29,58,0.35)]">
          <svg
            viewBox="0 0 32 32"
            className="w-1/2 h-1/2 okapi-pulse"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Roof + walls */}
            <path d="M4 14 L16 5 L28 14 V26 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z" />
            {/* Door */}
            <path d="M13 28 V20 a3 3 0 0 1 6 0 V28" />
            {/* Window */}
            <circle cx="16" cy="13" r="1.4" fill="#D4AF37" stroke="none" />
          </svg>
        </div>
      </div>

      {label && (
        <p className="text-xs font-medium tracking-wide text-muted-foreground">
          {label}
        </p>
      )}
      <span className="sr-only">Chargement en cours</span>

      <style jsx>{`
        .okapi-spin-slow {
          animation: okapi-rotate 2.6s linear infinite;
          transform-origin: 50% 50%;
        }
        .okapi-spin-reverse {
          animation: okapi-rotate-rev 1.8s cubic-bezier(0.5, 0, 0.5, 1) infinite;
          transform-origin: 50% 50%;
        }
        .okapi-pulse {
          animation: okapi-pulse 1.6s ease-in-out infinite;
        }
        @keyframes okapi-rotate {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes okapi-rotate-rev {
          to {
            transform: rotate(-360deg);
          }
        }
        @keyframes okapi-pulse {
          0%,
          100% {
            opacity: 0.85;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  );
}

/** Full-screen variant used when the entire detail page is hydrating. */
export function Loading({ label }: { label?: string }) {
  return (
    <div className="absolute inset-0 w-full min-h-[60vh] flex items-center justify-center bg-white z-10">
      <OkapiLoader size={120} label={label ?? "Chargement du bien..."} />
    </div>
  );
}
