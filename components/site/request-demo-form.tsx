"use client";

import { useState } from "react";

import { joinSiteWaitlist, requestSiteDemo } from "@/lib/site/api";

const inquiryTypes = ["enterprise", "government", "investor", "partner", "media"] as const;

export function RequestDemoForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(formData: FormData, waitlist = false) {
    setBusy(true);
    setStatus(null);
    const payload = {
      inquiry_type: String(formData.get("inquiry_type") ?? "enterprise"),
      name: String(formData.get("name") ?? "Demo Lead"),
      organization: String(formData.get("organization") ?? "Sentra Prospect"),
      email: String(formData.get("email") ?? "lead@example.com"),
      sector: String(formData.get("sector") ?? "enterprise"),
      urgency: String(formData.get("urgency") ?? "high"),
      source: String(formData.get("source") ?? "public_site"),
      message: String(formData.get("message") ?? ""),
    };
    try {
      const response = waitlist ? await joinSiteWaitlist(payload) : await requestSiteDemo(payload);
      setStatus(`${response.message}. Lead score: ${String(response.data.score ?? "ready")}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Request captured in local fallback mode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="rounded-[34px] border border-white/10 bg-white/[0.055] p-6 shadow-2xl shadow-black/25 backdrop-blur-2xl"
      action={(formData) => {
        void submit(formData, false);
      }}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-white/60">Inquiry type</span>
          <select className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" name="inquiry_type">
            {inquiryTypes.map((type) => (
              <option className="bg-slate-950" key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/60">Name</span>
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" name="name" placeholder="Bala Shanmugam" />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/60">Organization</span>
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" name="organization" placeholder="MetroCare Hospitals" />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/60">Email</span>
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" name="email" placeholder="leader@example.com" type="email" />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/60">Sector</span>
          <input className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" name="sector" placeholder="hospital, government, enterprise" />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/60">Urgency</span>
          <select className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" name="urgency">
            <option className="bg-slate-950" value="high">high</option>
            <option className="bg-slate-950" value="critical">critical</option>
            <option className="bg-slate-950" value="medium">medium</option>
          </select>
        </label>
      </div>
      <label className="mt-4 block space-y-2">
        <span className="text-sm text-white/60">Message</span>
        <textarea className="min-h-32 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white" name="message" placeholder="Tell us about your facility, pilot, grant, investment, or partnership interest." />
      </label>
      <input name="source" type="hidden" value="prestige_site" />
      <div className="mt-5 flex flex-wrap gap-3">
        <button className="rounded-2xl bg-cyan-100 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:opacity-60" disabled={busy} type="submit">
          {busy ? "Sending" : "Request demo"}
        </button>
        <button
          className="rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
          disabled={busy}
          formAction={(formData) => {
            void submit(formData, true);
          }}
          type="submit"
        >
          Join waitlist
        </button>
      </div>
      {status && <p className="mt-4 rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06] px-4 py-3 text-sm text-cyan-100/75">{status}</p>}
    </form>
  );
}
