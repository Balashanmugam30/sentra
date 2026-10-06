import type { Metadata } from "next";
import type { ReactNode } from "react";

import { MobileShell } from "@/components/mobile/mobile-shell";

export const metadata: Metadata = {
  title: "Sentra Mobile Field Ops",
  description: "Mobile command, safety, route, SOS, and staff foundation for Sentra.",
};

export default function MobileLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <MobileShell>{children}</MobileShell>;
}
