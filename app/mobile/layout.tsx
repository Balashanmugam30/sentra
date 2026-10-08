import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { MobileShell } from "@/components/mobile/mobile-shell";

export const metadata: Metadata = {
  applicationName: "Sentra Mobile",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Sentra",
  },
  description: "Mobile command, safety, route, SOS, and staff foundation for Sentra.",
  icons: {
    apple: "/icons/sentra-icon.svg",
    icon: "/icons/sentra-icon.svg",
  },
  manifest: "/manifest.json",
  title: {
    default: "Sentra Mobile Field Ops",
    template: "%s | Sentra Mobile",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#030712",
  viewportFit: "cover",
  width: "device-width",
};

export default function MobileLayout({ children }: Readonly<{ children: ReactNode }>) {
  return <MobileShell>{children}</MobileShell>;
}
