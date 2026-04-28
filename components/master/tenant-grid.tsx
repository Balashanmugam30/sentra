import type { MasterTenant, MasterUsage } from "@/lib/master/types";
import { formatCurrency, statusTone } from "@/lib/master/runtime";

type TenantGridProps = {
  tenants: MasterTenant[];
  usage: MasterUsage[];
  busyAction: string | null;
  onCreate: () => void;
  onSwitch: (tenantId?: string) => void;
};

export function TenantGrid({ tenants, usage, busyAction, onCreate, onSwitch }: TenantGridProps) {
  const usageByTenant = new Map(usage.map((item) => [item.tenant_id, item]));

  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-200/70">Global Multi-Tenant Command Cloud</p>
          <h2 className="mt-2 text-2xl font-black text-white">Tenant Grid</h2>
        </div>
        <button type="button" onClick={onCreate} disabled={busyAction === "create-tenant"} className="rounded-2xl border border-blue-300/30 bg-blue-300/10 px-4 py-3 text-sm font-semibold text-blue-50 transition hover:bg-blue-300/20 disabled:opacity-50">
          {busyAction === "create-tenant" ? "Provisioning..." : "Provision tenant"}
        </button>
      </div>
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {tenants.map((tenant) => {
          const row = usageByTenant.get(tenant.tenant_id);
          return (
            <article key={tenant.tenant_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${statusTone(tenant.status)}`}>{tenant.status.replaceAll("_", " ")}</span>
                  <h3 className="mt-3 text-xl font-black text-white">{tenant.name}</h3>
                  <p className="mt-1 text-sm text-slate-400">{tenant.vertical} · {tenant.region} · {tenant.plan}</p>
                </div>
                <button type="button" onClick={() => onSwitch(tenant.tenant_id)} className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-xs font-bold text-white transition hover:bg-white/15">
                  Switch org
                </button>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Metric label="ARR" value={formatCurrency(tenant.arr)} />
                <Metric label="SLA" value={`${tenant.sla_percent}%`} />
                <Metric label="Capacity" value={`${tenant.command_capacity}%`} />
              </div>
              <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-3">
                <span>{tenant.buildings} buildings</span>
                <span>{tenant.users}/{tenant.seats} seats</span>
                <span>{row?.quota_health ?? tenant.command_capacity}% quota health</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-black text-white">{value}</p>
    </div>
  );
}

