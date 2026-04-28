"use client";

import { useEffect, useRef, useState } from "react";

import { pollingManager } from "@/lib/core/polling-manager";

type UseVisibleSectionOptions = {
  sectionId: string;
  priority?: boolean;
  rootMargin?: string;
};

export function useVisibleSection({
  sectionId,
  priority = false,
  rootMargin = "160px 0px",
}: UseVisibleSectionOptions) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(priority);

  useEffect(() => {
    pollingManager.setSectionVisibility(sectionId, priority);
    if (priority || typeof IntersectionObserver === "undefined") {
      const fallbackTimer = priority
        ? null
        : window.setTimeout(() => {
            setVisible(true);
            pollingManager.setSectionVisibility(sectionId, true);
          }, 750);
      return () => {
        if (fallbackTimer !== null) {
          window.clearTimeout(fallbackTimer);
        }
        pollingManager.setSectionVisibility(sectionId, false);
      };
    }

    const node = ref.current;
    if (!node) {
      return () => {
        pollingManager.setSectionVisibility(sectionId, false);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const nextVisible = Boolean(entry?.isIntersecting);
        setVisible(nextVisible);
        pollingManager.setSectionVisibility(sectionId, nextVisible);
      },
      { rootMargin },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      pollingManager.setSectionVisibility(sectionId, false);
    };
  }, [priority, rootMargin, sectionId]);

  return { ref, visible };
}
