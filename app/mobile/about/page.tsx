import { GlassCard } from "@/components/mobile/glass-card";

export default function AboutPage() {
  return (
    <div className="space-y-5">
      <GlassCard glow="accent">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">About</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.07em]">Sentra Mobile Foundation</h1>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          Installable PWA foundation for guests, staff, responders, and admins. Future phases can attach live auth, maps, alerts, voice, and response workflows cleanly.
        </p>
      </GlassCard>
    </div>
  );
}
