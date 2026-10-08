"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { ProtectedLayout } from "@/components/security/protected-layout";

export default function ProtectedAppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isQaDesignSystem = pathname?.startsWith("/app/design-system");

  if (isQaDesignSystem) {
    return <AppShell>{children}</AppShell>;
  }

  return (
    <RouteGuard redirectTo="/login" requireAuth>
      <ProtectedLayout>
        <AppShell>{children}</AppShell>
      </ProtectedLayout>
    </RouteGuard>
  );
}

