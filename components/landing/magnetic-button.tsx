"use client";

import type { Route } from "next";
import Link from "next/link";
import { motion } from "framer-motion";

type MagneticButtonProps = {
  children: React.ReactNode;
  className: string;
  href?: Route;
  type?: "button" | "submit";
};

export function MagneticButton({
  children,
  className,
  href,
  type = "button",
}: MagneticButtonProps) {
  const content = href ? (
    <Link className={className} href={href}>
      {children}
    </Link>
  ) : (
    <button className={className} type={type}>
      {children}
    </button>
  );

  return (
    <motion.div
      className="will-change-transform"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
    >
      {content}
    </motion.div>
  );
}
