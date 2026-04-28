"use client";

import { useDeveloper } from "@/lib/developer/use-developer";

export function WebhookCenter() {
  const { busyAction, testWebhook, webhooks } = useDeveloper();

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Webhook Center</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Event delivery for platform automations</h2>
      <div className="mt-5 grid gap-3">
        {(webhooks?.webhooks ?? []).map((webhook, index) => (
          <article className="rounded-[20px] border border-white/10 bg-white/[0.045] p-4" key={`${webhook.webhook_id}-${index}`}>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-white">{webhook.endpoint}</p>
                <p className="mt-1 text-xs text-white/45">{webhook.events.join(", ")}</p>
              </div>
              <button
                className="rounded-full border border-cyan-200/22 bg-cyan-200/10 px-3 py-1.5 text-xs font-semibold text-cyan-50 disabled:opacity-50"
                disabled={busyAction === "test-webhook"}
                onClick={() => void testWebhook(webhook.webhook_id)}
                type="button"
              >
                {busyAction === "test-webhook" ? "Sending..." : "Test"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

