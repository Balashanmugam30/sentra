"use client";

import { WaveAccent } from "@/components/brand/wave-accent";
import { LoginForm } from "@/components/security/login-form";

export function LoginScreen() {
  return (
    <main className="sentra-login-page relative isolate flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#f8fafc] p-4">
      <WaveAccent variant="hero" />

      <div className="relative z-20 flex w-full items-center justify-center">
        <LoginForm />
      </div>
    </main>
  );
}
