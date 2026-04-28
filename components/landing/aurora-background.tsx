"use client";

import Image from "next/image";
import { motion } from "framer-motion";

type AuroraBackgroundProps = {
  className?: string;
  placement?: "hero" | "cta";
};

export function AuroraBackground({
  className = "",
  placement = "hero",
}: AuroraBackgroundProps) {
  const isHero = placement === "hero";

  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 z-10 h-full w-full overflow-hidden pointer-events-none ${className}`}
    >
      <motion.div
        animate={{
          x: [-14, 14, -8, 0],
          y: [0, -5, 0],
          opacity: isHero ? [0.9, 0.98, 0.94, 0.9] : [0.84, 0.92, 0.88, 0.84],
        }}
        className={`absolute inset-x-0 flex justify-center [will-change:transform] ${
          isHero ? "bottom-[-5%]" : "bottom-[-10%]"
        }`}
        transition={{
          x: {
            duration: 14,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          y: {
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
          opacity: {
            duration: 12,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          },
        }}
      >
        <Image
          alt="aurora"
          className={`max-w-none mix-blend-screen [filter:blur(10px)] ${
            isHero ? "w-[138vw] opacity-95" : "w-[134vw] opacity-90"
          }`}
          src="/aurora.png"
          unoptimized
          style={{
            filter: isHero
              ? "brightness(1.2) contrast(1.08) saturate(1.18)"
              : "brightness(1.16) contrast(1.06) saturate(1.14)",
            maskImage: isHero
              ? "linear-gradient(to top, black 24%, black 70%, transparent 100%)"
              : "linear-gradient(to top, black 30%, black 72%, transparent 100%)",
            WebkitMaskImage: isHero
              ? "linear-gradient(to top, black 24%, black 70%, transparent 100%)"
              : "linear-gradient(to top, black 30%, black 72%, transparent 100%)",
          }}
          width={2400}
          height={1400}
        />
      </motion.div>
    </div>
  );
}
