"use client";

import type { ReactNode } from "react";

import { AppShell } from "@/components/app/app-shell";
import { ProtectedLayout } from "@/components/security/protected-layout";

export function ProtectedWorkspaceShell({ children }: { children: ReactNode }) {
  return (
    <ProtectedLayout>
      <AppShell>{children}</AppShell>
    </ProtectedLayout>
  );
}
