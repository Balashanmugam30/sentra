"use client";

import { motion, useReducedMotion } from "framer-motion";
import { memo } from "react";

import { PRIMARY_BLOCKED_ZONE } from "../../lib/mobile/routing";
import type { MobileRoute } from "../../lib/mobile/types";
import { GlassCard } from "./glass-card";

type RouteMapProps = {
  blockedZones: string[];
  route: MobileRoute | null;
};

export const RouteMap = memo(function RouteMap({ blockedZones, route }: RouteMapProps) {
  const reduceMotion = useReducedMotion();
  const rerouted = blockedZones.includes(PRIMARY_BLOCKED_ZONE);
  const path = rerouted ? "M40 220 C80 160 92 115 142 112 C202 108 232 76 290 42" : "M40 220 C96 204 126 165 146 128 C170 84 214 58 290 42";
  const markerPath = rerouted ? { cx: 145, cy: 112 } : { cx: 146, cy: 128 };

  return (
    <GlassCard className="p-0" glow={rerouted ? "warning" : "accent"}>
      <div className="relative overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_30%_0%,rgba(59,130,246,0.22),transparent_36%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-100/60">Evacuation map</p>
            <h2 className="mt-1 text-xl font-semibold tracking-[-0.05em] text-white">{route?.destination ?? "Safe assembly point"}</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-xs font-semibold text-slate-200">Floor 3</span>
        </div>

        <svg aria-label="Simulated evacuation route map" className="h-72 w-full" role="img" viewBox="0 0 330 270">
          <defs>
            <linearGradient id="routeGradient" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor={rerouted ? "#f59e0b" : "#10b981"} />
            </linearGradient>
            <filter id="routeGlow">
              <feGaussianBlur result="blur" stdDeviation="5" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect fill="rgba(255,255,255,0.04)" height="245" rx="26" width="310" x="10" y="10" />
          <path d="M45 35 H278 V230 H45 Z" fill="none" stroke="rgba(255,255,255,0.12)" strokeDasharray="8 8" strokeWidth="2" />
          <path d="M45 134 H280" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
          <path d="M142 38 V232" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
          <path d="M220 38 V232" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />

          <circle cx="82" cy="83" fill="rgba(239,68,68,0.2)" r="34" />
          <circle cx="82" cy="83" fill="none" r="26" stroke="rgba(248,113,113,0.52)" strokeDasharray="5 6" strokeWidth="2" />
          <text fill="#fecaca" fontSize="10" fontWeight="700" x="54" y="88">
            Hazard
          </text>

          <rect fill={rerouted ? "rgba(239,68,68,0.34)" : "rgba(245,158,11,0.13)"} height="48" rx="12" width="66" x="108" y="111" />
          <text fill={rerouted ? "#fecaca" : "#fde68a"} fontSize="9" fontWeight="700" x="116" y="139">
            Corridor B
          </text>

          <path d={path} fill="none" filter="url(#routeGlow)" stroke="url(#routeGradient)" strokeLinecap="round" strokeWidth="8" />
          <path d={path} fill="none" stroke="rgba(255,255,255,0.55)" strokeDasharray="2 14" strokeLinecap="round" strokeWidth="2" />

          <circle cx="40" cy="220" fill="#38bdf8" r="10" />
          <circle cx="40" cy="220" fill="none" r="18" stroke="rgba(56,189,248,0.38)" strokeWidth="2" />
          <text fill="#bfdbfe" fontSize="10" fontWeight="700" x="24" y="250">
            You
          </text>

          <circle cx="290" cy="42" fill="#10b981" r="11" />
          <circle cx="290" cy="42" fill="none" r="21" stroke="rgba(16,185,129,0.38)" strokeWidth="2" />
          <text fill="#bbf7d0" fontSize="10" fontWeight="700" x="268" y="25">
            Exit
          </text>

          <motion.circle
            animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35], r: [5, 8, 5] }}
            cx={markerPath.cx}
            cy={markerPath.cy}
            fill="#ffffff"
            r="6"
            transition={{ duration: 1.4, repeat: Infinity }}
          />
        </svg>
      </div>
    </GlassCard>
  );
});
