import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F2F4F7] flex flex-col items-center justify-center p-6">
      {/* Brand badge */}
      <div className="relative mb-8" style={{ width: 120, height: 120 }}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          <defs>
            <linearGradient id="gold-grad" x1="0" x2="1" y1="0" y2="1">
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
            stroke="url(#gold-grad)"
            strokeWidth="4"
            strokeDasharray="6 5"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
        <div className="absolute inset-[18%] rounded-full bg-[#0B1D3A] flex items-center justify-center shadow-[0_4px_18px_rgba(11,29,58,0.35)]">
          <svg
            viewBox="0 0 32 32"
            className="w-1/2 h-1/2"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 14 L16 5 L28 14 V26 a2 2 0 0 1 -2 2 H6 a2 2 0 0 1 -2 -2 Z" />
            <path d="M13 28 V20 a3 3 0 0 1 6 0 V28" />
            <circle cx="16" cy="13" r="1.4" fill="#D4AF37" stroke="none" />
          </svg>
        </div>
      </div>

      {/* 404 number */}
      <p className="text-[120px] font-black leading-none text-[#0B1D3A] opacity-10 select-none -mb-6">
        404
      </p>

      <h1 className="text-2xl font-bold text-[#0B1D3A] mt-4 mb-2">
        Page not found
      </h1>
      <p className="text-sm text-[#1A1F2B]/60 text-center max-w-xs mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E63B5] text-white text-sm font-medium hover:bg-[#1752a0] transition-colors"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
