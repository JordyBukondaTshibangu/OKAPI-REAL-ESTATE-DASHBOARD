"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 text-center px-4">
      {/* Inline brand badge — smaller, no animation */}
      <div className="relative" style={{ width: 72, height: 72 }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="gold-db-err" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#F4E4A6" />
              <stop offset="55%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#9C7A1E" />
            </linearGradient>
          </defs>
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="url(#gold-db-err)"
            strokeWidth="4"
            strokeDasharray="6 5"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
        <div className="absolute inset-[18%] rounded-full bg-[#0B1D3A] flex items-center justify-center shadow-[0_4px_18px_rgba(11,29,58,0.25)]">
          <svg
            viewBox="0 0 32 32"
            className="w-1/2 h-1/2"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="16" y1="9" x2="16" y2="20" />
            <circle cx="16" cy="24.5" r="1.2" fill="#D4AF37" stroke="none" />
          </svg>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-[#0B1D3A] mb-1">
          Something went wrong
        </h2>
        <p className="text-sm text-muted-foreground max-w-sm">
          An unexpected error occurred while loading this page.
        </p>
      </div>

      <button
        onClick={reset}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E63B5] text-white text-sm font-medium hover:bg-[#1752a0] transition-colors"
      >
        Try again
      </button>

      {error.digest && (
        <p className="text-xs text-muted-foreground font-mono">
          Error ID: {error.digest}
        </p>
      )}
    </div>
  );
}
