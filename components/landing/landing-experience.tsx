"use client";

import { AISection } from "@/components/landing/ai-section";
import { CTASection } from "@/components/landing/cta-section";
import { FeatureSection } from "@/components/landing/feature-section";
import { HeroSection } from "@/components/landing/hero-section";
import { Navbar } from "@/components/landing/navbar";
import { SystemPreviewSection } from "@/components/landing/system-preview-section";

export function LandingExperience() {
  return (
    <main
      className="relative isolate min-h-screen overflow-x-hidden bg-black text-[#E5E7EB]"
      id="sentra-main-content"
    >
      <div className="absolute inset-0 z-0 bg-[#010101]" />
      <Navbar />
      <HeroSection />
      <div className="relative z-20 bg-black">
        <FeatureSection />
        <SystemPreviewSection />
        <AISection />
        <CTASection />
      </div>
    </main>
  );
}
