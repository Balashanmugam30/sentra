"use client";

import { motion } from "framer-motion";

type InteractiveCardProps = {
  children: React.ReactNode;
  className: string;
};

export function InteractiveCard({ children, className }: InteractiveCardProps) {
  return (
    <motion.div
      className={className}
      style={{ willChange: "transform" }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      whileHover={{
        scale: 1.03,
        borderColor: "rgba(255,255,255,0.2)",
        boxShadow: "0 0 40px rgba(139,92,246,0.2)",
      }}
    >
      {children}
    </motion.div>
  );
}
