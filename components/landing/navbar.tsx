"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <>
      <a className="sentra-skip-link" href="#sentra-main-content">
        Skip to content
      </a>
      <header className="fixed left-0 top-0 z-40 px-6 py-6 sm:px-10 sm:py-8">
        <Link
          aria-label="Sentra landing home"
          className="text-[2rem] font-semibold tracking-[-0.045em] text-white transition hover:text-white/82"
          href="/"
        >
          Sentra
        </Link>
      </header>
    </>
  );
}
