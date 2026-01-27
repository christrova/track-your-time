"use client";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  topLink?: React.ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
  topLink,
}: AuthShellProps) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6">
      {topLink && (
        <div className="fixed left-4 top-4 z-10 sm:left-6 sm:top-6">
          {topLink}
        </div>
      )}
      <div className="w-full max-w-md">
        <div className="rounded-3xl border border-white/60 bg-white/70 shadow-[0_22px_70px_rgba(15,23,42,0.18)] backdrop-blur-xl overflow-hidden">
          <div className="px-6 pt-6 pb-4 border-b border-white/60 bg-white/50 backdrop-blur-sm">
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
            )}
          </div>

          <div className="px-6 pb-6 bg-slate-50/40">{children}</div>

          {footer && (
            <div className="px-6 py-4 border-t border-white/60 bg-white/60 backdrop-blur-sm rounded-b-3xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
