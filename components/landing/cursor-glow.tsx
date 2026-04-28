"use client";

import { motion, useMotionValue } from "framer-motion";
import { useEffect, useRef } from "react";

export function CursorGlow() {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      targetRef.current = {
        x: event.clientX - 150,
        y: event.clientY - 150,
      };
    };

    const animate = () => {
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * 0.08;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * 0.08;

      x.set(currentRef.current.x);
      y.set(currentRef.current.y);

      frameRef.current = window.requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMove);
    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [x, y]);

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[300px] w-[300px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.25),transparent_60%)] opacity-[0.2] blur-[120px]"
      style={{
        x,
        y,
      }}
    />
  );
}
