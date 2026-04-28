"use client";

import { AuroraBackground } from "@/components/landing/aurora-background";
import { DotGrid } from "@/components/landing/dot-grid";
import { LoginForm } from "@/components/security/login-form";

export function LoginScreen() {
  return (
    <main className="sentra-login-page">
      <div className="absolute inset-0 z-0 bg-[#010101]" />
      <AuroraBackground className="z-10" placement="hero" />
      <div className="landing-hero-dot-mask pointer-events-none absolute inset-x-0 top-0 z-[15] h-[56vh] overflow-hidden">
        <DotGrid />
      </div>

      <div className="relative z-20 flex w-full items-center justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
