import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: [
      "**/.next/**",
      ".venv/**",
      "venv/**",
      "node_modules/**",
      "data/**",
      "logs/**",
      "test-results/**",
      "docs/**",
      "infra/**",
      "firmware/**",
    ],
  },
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
      "no-console": ["error", { allow: ["debug", "info", "warn", "error"] }],
    },
  },
];

export default config;
