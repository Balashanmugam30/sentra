import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { AppProviders } from "@/app/providers";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { appConfig } from "@/config/app";
import SmoothScroll from "@/lib/smooth-scroll";
import { SENTRA_POSITIONING } from "@/lib/product-positioning";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: `Sentra | ${SENTRA_POSITIONING.identity}`,
    template: "%s | Sentra",
  },
  description: SENTRA_POSITIONING.oneLine,
  keywords: [
    "Sentra",
    "AI crisis intelligence",
    "incident command platform",
    "digital twin operations",
    "enterprise risk dashboard",
    "real-time operations",
    "portfolio project",
  ],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: `Sentra | ${SENTRA_POSITIONING.identity}`,
    description: SENTRA_POSITIONING.oneLine,
    siteName: "Sentra",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Sentra | ${SENTRA_POSITIONING.identity}`,
    description: SENTRA_POSITIONING.oneLine,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const themeScript = `
    (() => {
      const saved = localStorage.getItem("sentra-theme");
      const theme = ["system", "dark", "light"].includes(saved ?? "") ? saved : "system";
      const resolved = theme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
        : theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.dataset.themeMode = theme;
      document.documentElement.style.colorScheme = resolved;
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <SmoothScroll />
        <AppProviders>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AppProviders>
      </body>
    </html>
  );
}
