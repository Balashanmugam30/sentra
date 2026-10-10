"use client";

import { LuxurySidebar } from "@/components/ui/luxury-sidebar";
import type { ComponentProps } from "react";

export function AppSidebar(props: ComponentProps<typeof LuxurySidebar>) {
  // Mobile-only slide-out drawer. Desktop uses the top GlobalHeader navigation.
  if (!props.mobileOpen) {
    return null;
  }
  return <LuxurySidebar {...props} />;
}
