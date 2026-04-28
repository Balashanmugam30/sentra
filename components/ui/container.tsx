import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ContainerSize = "sm" | "md" | "xl" | "full";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize;
}

const sizeClass: Record<ContainerSize, string> = {
  sm: "container-sm",
  md: "container-md",
  xl: "container-xl",
  full: "container-full",
};

export function Container({ className, size = "xl", ...props }: ContainerProps) {
  return <div className={cn(sizeClass[size], className)} {...props} />;
}
