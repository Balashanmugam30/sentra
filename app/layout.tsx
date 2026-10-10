import type { Metadata } from "next";
import { Geist, Geist_Mono, Manrope } from "next/font/google";

import { AppProviders } from "@/app/providers";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { appConfig } from "@/config/app";
import SmoothScroll from "@/lib/smooth-scroll";
import { SENTRA_POSITIONING } from "@/lib/product-positioning";

import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
});

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
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
      const theme = saved === "dark" ? "dark" : "light";
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.themeMode = theme;
      document.documentElement.style.colorScheme = theme;
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${manrope.variable} ${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        <SmoothScroll />
        <AppProviders>
          <ErrorBoundary>{children}</ErrorBoundary>
        </AppProviders>
      </body>
    </html>
  );
}
