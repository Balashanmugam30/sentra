"use client";

import { LuxurySidebar } from "@/components/ui/luxury-sidebar";
import type { ComponentProps } from "react";

export function AppSidebar(props: ComponentProps<typeof LuxurySidebar>) {
  return <LuxurySidebar {...props} />;
}
