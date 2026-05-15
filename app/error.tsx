"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
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
    <html lang="en">
      <body className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center p-6 font-sans antialiased">
        {/* Brand badge */}
        <div className="relative mb-8" style={{ width: 120, height: 120 }}>
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
            <defs>
              <linearGradient id="gold-grad-err" x1="0" x2="1" y1="0" y2="1">
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
              stroke="url(#gold-grad-err)"
              strokeWidth="4"
              strokeDasharray="6 5"
              strokeLinecap="round"
              opacity="0.6"
            />
          </svg>
          <div className="absolute inset-[18%] rounded-full bg-[#0B1D3A] flex items-center justify-center shadow-[0_4px_18px_rgba(11,29,58,0.35)]">
            {/* Exclamation mark instead of house to signal error */}
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

        <h1 className="text-2xl font-bold text-[#0B1D3A] mb-2">
          Something went wrong
        </h1>
        <p className="text-sm text-[#1A1F2B]/60 text-center max-w-xs mb-8">
          An unexpected error occurred. Try again or return to the dashboard.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E63B5] text-white text-sm font-medium hover:bg-[#1752a0] transition-colors"
          >
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#0B1D3A]/20 text-[#0B1D3A] text-sm font-medium hover:bg-[#0B1D3A]/5 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-[#1A1F2B]/40 font-mono">
            Error ID: {error.digest}
          </p>
        )}
      </body>
    </html>
  );
}
