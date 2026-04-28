"use client";

import { useAutonomousAI } from "@/lib/ai/use-autonomous-ai";

export function CommunicationsEscalationCenter() {
  const { comms } = useAutonomousAI();

  return (
    <section className="rounded-[28px] border border-white/10 bg-[rgba(5,9,18,0.76)] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-200/62">
        Communications Escalation Center
      </p>
      <h2 className="mt-2 text-xl font-semibold text-white">
        Audience-aware message queue across occupant, responder, executive, and public channels
      </h2>
      <div className="mt-5 space-y-3">
        {(comms?.messages ?? []).map((message) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${message.audience}-${message.channel}`}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[0.65rem] uppercase tracking-[0.18em] text-white/42">
                  {message.audience} · {message.channel}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/68">{message.message}</p>
              </div>
              <span className="rounded-full border border-amber-200/18 bg-amber-200/8 px-3 py-1 text-xs uppercase tracking-[0.16em] text-amber-100/78">
                {message.status} · {message.urgency}%
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

