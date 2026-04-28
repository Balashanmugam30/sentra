export const sentraThemeTokens = {
  color: {
    background: {
      primary: "#05070B",
      secondary: "#0A0F17",
      tertiary: "#0F1724",
    },
    surface: {
      glass: "rgba(255,255,255,0.06)",
      glassRaised: "rgba(255,255,255,0.08)",
      glassStrong: "rgba(255,255,255,0.12)",
    },
    border: {
      soft: "rgba(255,255,255,0.08)",
      strong: "rgba(255,255,255,0.14)",
    },
    text: {
      primary: "#F5F7FA",
      secondary: "#9CA3AF",
      muted: "#6B7280",
    },
    accent: "#6EA8FF",
    success: "#34D399",
    warning: "#FBBF24",
    danger: "#F87171",
  },
  radius: {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 28,
  },
  shadow: {
    soft: "0 10px 30px rgba(0,0,0,0.24)",
    medium: "0 20px 60px rgba(0,0,0,0.34)",
    glass: "0 28px 90px rgba(0,0,0,0.42)",
  },
  spacing: {
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    20: 20,
    24: 24,
    32: 32,
  },
  transition: {
    fast: "200ms ease",
    normal: "300ms ease",
  },
  type: {
    displayHero: "text-5xl font-semibold tracking-tight",
    pageTitle: "text-3xl font-semibold tracking-tight",
    sectionTitle: "text-xl font-semibold tracking-tight",
    cardTitle: "text-base font-medium",
    metric: "text-4xl font-semibold tabular-nums tracking-tight",
    body: "text-sm text-gray-300",
    meta: "text-[11px] uppercase tracking-[0.24em]",
  },
} as const;

export type SentraThemeTokens = typeof sentraThemeTokens;
