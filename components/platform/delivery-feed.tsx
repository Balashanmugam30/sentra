"use client";

import { platformStatusTone } from "@/lib/platform/runtime";
import type { PlatformDelivery } from "@/lib/platform/types";

export function DeliveryFeed({ deliveries }: { deliveries: PlatformDelivery[] }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100/60">Live Delivery Feed</p>
      <h3 className="mt-2 text-2xl font-semibold text-white">Replayable event queue</h3>
      <div className="mt-5 space-y-3">
        {deliveries.map((delivery) => (
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={delivery.delivery_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{delivery.event}</p>
                <p className="mt-1 font-mono text-xs text-white/40">{delivery.webhook_id} / {delivery.created_at}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs ${platformStatusTone(delivery.status)}`}>{delivery.status}</span>
            </div>
            <div className="mt-3 flex gap-3 text-xs text-white/50">
              <span>{delivery.attempts} attempts</span>
              <span>{delivery.latency_ms}ms latency</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

