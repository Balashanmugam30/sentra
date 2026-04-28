export const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
} as const;

export const staggerContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

export const revealViewport = {
  once: true,
  margin: "-100px",
} as const;

export const revealTransition = {
  duration: 0.8,
  ease: "easeOut",
} as const;
