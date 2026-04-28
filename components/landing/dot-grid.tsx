"use client";

import { useEffect, useRef } from "react";

type DotGridProps = {
  className?: string;
};

export function DotGrid({ className = "" }: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const pointer = {
      currentX: window.innerWidth / 2,
      currentY: window.innerHeight / 2,
    };

    const spacing = 15;
    const influenceRadius = 180;
    const maxOffset = 3;
    let frame = 0;

    const resize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      context.clearRect(0, 0, width, height);

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const dx = pointer.currentX - x;
          const dy = pointer.currentY - y;
          const distance = Math.hypot(dx, dy);
          const influence = Math.max(0, 1 - distance / influenceRadius);
          const offsetX = distance === 0 ? 0 : (-dx / distance) * influence * maxOffset;
          const offsetY = distance === 0 ? 0 : (-dy / distance) * influence * maxOffset;
          const radius = 1.5 + influence * 0.18;
          const alpha = 0.28 + influence * 0.08;

          context.beginPath();
          context.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          context.shadowBlur = influence > 0 ? 8 : 3;
          context.shadowColor = "rgba(255, 255, 255, 0.16)";
          context.arc(x + offsetX, y + offsetY, radius, 0, Math.PI * 2);
          context.fill();
        }
      }

      frame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointer.currentX = event.clientX;
      pointer.currentY = event.clientY;
    };

    const handlePointerLeave = () => {
      pointer.currentX = window.innerWidth / 2;
      pointer.currentY = window.innerHeight / 2;
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      ref={canvasRef}
    />
  );
}
