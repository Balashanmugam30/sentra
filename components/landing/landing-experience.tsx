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
      className="relative isolate min-h-screen overflow-x-hidden bg-[#f8fafc] text-slate-900"
      id="sentra-main-content"
    >
      <Navbar />
      <HeroSection />
      <div className="relative z-20 bg-[#f8fafc]">
        <FeatureSection />
        <SystemPreviewSection />
        <AISection />
        <CTASection />
      </div>
      {/* Light porcelain minimal footer */}
      <footer className="border-t border-slate-200/80 bg-white py-12 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Sentra Crisis Intelligence OS. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-600 font-medium">
            <span>Air-Gapped Simulation Active</span>
            <span>•</span>
            <span>Security Assurance Tier 1</span>
            <span>•</span>
            <span>Zero-Trust Architecture</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
