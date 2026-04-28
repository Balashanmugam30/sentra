"use client";

import { memo, useEffect, useState } from "react";

export const AppBackground = memo(function AppBackground() {
  const [cursor, setCursor] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth) * 100;
      const y = (event.clientY / window.innerHeight) * 100;

      setCursor({ x, y });
    };

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <>
      <div className="fixed inset-0 z-0 bg-[#0b0f14]" />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "10px 10px",
          backgroundPosition: "0 0",
        }}
      />
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `radial-gradient(160px circle at ${cursor.x}% ${cursor.y}%, rgba(255,255,255,0.05), transparent 70%)`,
        }}
      />
    </>
  );
});
