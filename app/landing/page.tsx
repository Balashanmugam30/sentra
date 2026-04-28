import type { Metadata } from "next";

import { LandingExperience } from "@/components/landing/landing-experience";
import { SENTRA_POSITIONING } from "@/lib/product-positioning";

export const metadata: Metadata = {
  title: "Launch Showcase",
  description: `${SENTRA_POSITIONING.oneLine} Explore the launch-ready public showcase, guided demo path, and enterprise credibility story.`,
  openGraph: {
    title: `Sentra Launch Showcase | ${SENTRA_POSITIONING.identity}`,
    description: SENTRA_POSITIONING.oneLine,
    type: "website",
  },
};

export default function LandingRoutePage() {
  return <LandingExperience />;
}
