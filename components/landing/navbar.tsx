"use client";

import Link from "next/link";
import { SentraLogo } from "@/components/brand/sentra-logo";

export function Navbar() {
  return (
    <>
      <a className="sentra-skip-link" href="#sentra-main-content">
        Skip to content
      </a>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 py-4 transition-all">
        <nav
          aria-label="Main Navigation"
          className="mx-auto max-w-[1440px] flex items-center justify-between gap-6 px-5 py-3 rounded-2xl border border-slate-200/80 bg-white/80 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] backdrop-blur-xl"
        >
          <div className="flex items-center gap-8">
            <SentraLogo size="md" href="/" />

            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">
                Capabilities
              </a>
              <a href="#system" className="hover:text-blue-600 transition-colors">
                Architecture
              </a>
              <a href="#ai-engine" className="hover:text-blue-600 transition-colors">
                AI Engine
              </a>
              <a href="#open" className="hover:text-blue-600 transition-colors">
                Scenarios
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all hover:shadow active:scale-[0.98]"
            >
              Launch Console
            </Link>
          </div>
        </nav>
      </header>
    </>
  );
}
