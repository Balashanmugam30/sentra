import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";

import { MobileShell } from "../components/mobile/mobile-shell";

import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

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
    default: "Sentra Mobile",
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

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html className={`${geistSans.variable} ${geistMono.variable}`} lang="en" suppressHydrationWarning>
      <body>
        <MobileShell>{children}</MobileShell>
      </body>
    </html>
  );
}
