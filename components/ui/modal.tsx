import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function ModalSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("glass-modal p-6", className)} {...props} />;
}

export function DrawerSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <aside
      className={cn(
        "glass-panel h-full w-full max-w-md border-y-0 border-r-0 p-6",
        className,
      )}
      {...props}
    />
  );
}

