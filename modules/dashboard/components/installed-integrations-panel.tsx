"use client";

import { useMarketplace } from "@/lib/marketplace/use-marketplace";

export function InstalledIntegrationsPanel() {
  const { busyAction, installed, testConnection } = useMarketplace();
  const installations = installed?.installations ?? [];

  return (
    <section className="rounded-[30px] border border-white/10 bg-[rgba(5,10,20,0.78)] p-5 shadow-[0_20px_55px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
      <p className="text-[0.66rem] font-semibold uppercase tracking-[0.24em] text-cyan-100/54">Installed Integrations</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Tenant-scoped connected app health</h2>
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {installations.map((item, index) => (
          <article className="rounded-[22px] border border-white/10 bg-white/[0.045] p-4" key={`${item.installation_id}-${item.updated_at}-${index}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-white">{item.app_name}</h3>
                <p className="mt-1 text-xs text-white/45">{item.category.replaceAll("_", " ")} - v{item.version}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.status === "connected" ? "border border-cyan-200/18 bg-cyan-200/10 text-cyan-50" : "border border-orange-200/20 bg-orange-200/10 text-orange-50"}`}>
                {item.status}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 text-xs text-white/50">
              <span>{item.usage_count.toLocaleString()} events</span>
              <button
                className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 font-semibold text-white/72 transition hover:bg-white/[0.1] disabled:opacity-50"
                disabled={busyAction === `test-${item.app_id}`}
                onClick={() => void testConnection(item.app_id)}
                type="button"
              >
                {busyAction === `test-${item.app_id}` ? "Testing..." : "Test"}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

