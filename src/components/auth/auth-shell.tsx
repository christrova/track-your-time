"use client";

import Link from "next/link";

type AuthShellProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen w-full bg-linear-to-b from-gray-50 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center text-sm font-semibold text-gray-900"
          >
            Track My Time
          </Link>
        </div> */}

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <div className="px-6 pt-6 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
          </div>

          <div className="px-6 pb-6">{children}</div>

          {footer && (
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
