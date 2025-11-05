import React from 'react';

const Header = ({ logoUrl, branchName, issuer, onToggleSidebar }) => {
  return (
  <header className="relative overflow-hidden bg-linear-to-br from-[#0b1220] via-slate-950 to-[#0f1a2c] rounded-3xl shadow-[0_20px_60px_-25px_rgba(6,11,20,0.9)] mb-8 p-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
  <div className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-emerald-500/40 to-teal-500/20 rounded-full -translate-x-48 -translate-y-48 blur-3xl"></div>
  <div className="absolute bottom-0 right-0 w-64 h-64 bg-linear-to-tl from-amber-500/40 to-rose-500/20 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
      </div>

      {onToggleSidebar && (
        <button
          onClick={onToggleSidebar}
          className="absolute right-6 top-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-white shadow-lg backdrop-blur-sm transition hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 lg:hidden"
          aria-label="Άνοιγμα μενού"
          type="button"
        >
          <span className="text-2xl">☰</span>
        </button>
      )}

      <div className="relative flex items-center gap-8">
        {/* Logo */}
  <div className="shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-br from-emerald-500 to-teal-600 rounded-2xl blur-lg opacity-40"></div>
            <img
              src={logoUrl}
              alt="S.E.G. Stournaras Entertainment Group Logo"
              className="relative w-28 h-28 object-contain rounded-2xl shadow-xl"
            />
          </div>
        </div>

        {/* Company Info */}
        <div className="flex-1">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(16,185,129,0.3)]">
                {branchName}
              </h1>
              <div className="space-y-2">
                <div className="flex items-center gap-3 group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 transition-all group-hover:bg-emerald-500/25 group-hover:scale-110">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-base font-medium text-slate-200 tracking-wide">{issuer.address}, {issuer.city}</span>
                </div>
                <div className="flex items-center gap-3 group">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/15 text-sky-300 transition-all group-hover:bg-sky-500/25 group-hover:scale-110">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-base font-medium text-slate-200 tracking-wide">{issuer.phone || '+30 28310 20010'}</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-slate-200 uppercase tracking-[0.4em]">myDATA</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Accent */}
  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-400 via-teal-500 to-amber-500 rounded-b-3xl"></div>
    </header>
  );
};

export default Header;