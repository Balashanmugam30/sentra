"use client";

import Lenis from "@studio-freight/lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Do not run on app, mobile, or login screens where internal scrolling / forms are used
    if (
      pathname.startsWith("/app") ||
      pathname.startsWith("/mobile") ||
      pathname.startsWith("/login")
    ) {
      return;
    }

    // Respect reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Do not intercept touch devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const lenis = new Lenis({
      smooth: true,
      smoothTouch: false,
      smoothWheel: true,
      lerp: 0.08,
    } as ConstructorParameters<typeof Lenis>[0] & { smooth: boolean });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);

    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [pathname]);

  return null;
}
