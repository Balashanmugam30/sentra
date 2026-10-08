"use client";

import { AppShell } from "@/components/app/app-shell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ProtectedLayout } from "@/components/security/protected-layout";

export default function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard redirectTo="/login" requireAuth>
      <ProtectedLayout>
        <AppShell>{children}</AppShell>
      </ProtectedLayout>
    </RouteGuard>
  );
}

