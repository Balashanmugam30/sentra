"use client";

import Image from "next/image";

type PublicBrandBackgroundProps = {
  variant?: "landing" | "auth";
};

export function PublicBrandBackground({ variant = "landing" }: PublicBrandBackgroundProps) {
  return (
    <div aria-hidden="true" className={`sentra-public-background sentra-public-background--${variant}`}>
      <div className="sentra-public-dots" />
      <div className="sentra-public-vignette" />
      <div className="sentra-public-aurora">
        <Image
          alt=""
          className="sentra-public-aurora-image"
          height={1400}
          priority={variant === "landing"}
          src="/aurora.png"
          unoptimized
          width={2400}
        />
      </div>
    </div>
  );
}
