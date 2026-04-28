import type { OpsInventoryItem, OpsShortageAlert } from "@/lib/ops/types";

type InventoryBoardProps = {
  inventory: OpsInventoryItem[];
  alerts: OpsShortageAlert[];
};

export function InventoryBoard({ inventory, alerts }: InventoryBoardProps) {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-2xl shadow-blue-950/20 backdrop-blur">
      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-100/70">Equipment Inventory</p>
      <h2 className="mt-2 text-2xl font-semibold text-white">Readiness and shortages</h2>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {inventory.map((item) => (
          <article key={item.item_id} className="rounded-3xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-500">{item.category} - {item.state}</p>
              </div>
              <span className={item.low_stock ? "font-bold text-amber-100" : "font-bold text-emerald-100"}>{item.ready}</span>
            </div>
            <p className="mt-3 text-sm text-slate-300">Deployed {item.deployed}, maintenance {item.maintenance}, missing {item.missing}</p>
          </article>
        ))}
      </div>
      <div className="mt-5 grid gap-3">
        {alerts.map((alert) => (
          <article key={alert.alert_id} className="rounded-2xl border border-amber-300/20 bg-amber-400/10 p-3">
            <p className="font-semibold text-white">{alert.title}</p>
            <p className="mt-1 text-sm text-amber-100/80">{alert.recommendation}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
