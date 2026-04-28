"use client";

import Lenis from "@studio-freight/lenis";
import { useEffect } from "react";

export default function SmoothScroll() {
  useEffect(() => {
    const isNativeScrollTarget = (target: EventTarget | null) => {
      if (!(target instanceof Element)) {
        return false;
      }

      return Boolean(
        target.closest(
          "[data-native-scroll], [data-lenis-prevent], .sentra-sidebar-nav-scroll, .sentra-app-sidebar",
        ),
      );
    };

    const lenis = new Lenis({
      smooth: true,
      smoothTouch: true,
      smoothWheel: true,
      lerp: 0.08,
    } as ConstructorParameters<typeof Lenis>[0] & { smooth: boolean });

    let frame = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (isNativeScrollTarget(event.target)) {
        return;
      }

      const step = window.innerHeight * 0.9;

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          lenis.scrollTo(window.scrollY + 120, { duration: 1.1 });
          break;
        case "ArrowUp":
          event.preventDefault();
          lenis.scrollTo(window.scrollY - 120, { duration: 1.1 });
          break;
        case "PageDown":
        case " ":
          event.preventDefault();
          lenis.scrollTo(window.scrollY + step, { duration: 1.2 });
          break;
        case "PageUp":
          event.preventDefault();
          lenis.scrollTo(window.scrollY - step, { duration: 1.2 });
          break;
        case "Home":
          event.preventDefault();
          lenis.scrollTo(0, { duration: 1.2 });
          break;
        case "End":
          event.preventDefault();
          lenis.scrollTo(document.documentElement.scrollHeight, { duration: 1.2 });
          break;
        default:
          break;
      }
    };

    frame = window.requestAnimationFrame(raf);
    window.addEventListener("keydown", handleKeydown, { passive: false });

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("keydown", handleKeydown);
      lenis.destroy();
    };
  }, []);

  return null;
}
