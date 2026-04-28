"use client";

import { useDataEmpire } from "@/lib/data-empire/use-data-empire";
import {
  DataEmpireActionButton,
  DataEmpireBar,
  DataEmpireMetricCard,
  DataEmpirePanelShell,
  dataEmpireMoney,
} from "@/modules/dashboard/components/data-empire-primitives";

export function DataMonetizationPanel() {
  const { busyAction, launchDataProduct, products, value } = useDataEmpire();
  const topProduct = products[0];

  return (
    <DataEmpirePanelShell
      action={
        <DataEmpireActionButton
          busy={busyAction === `launch-${topProduct?.product_id ?? "risk-signals-api"}`}
          onClick={() => void launchDataProduct(topProduct?.product_id ?? "risk-signals-api")}
        >
          {busyAction?.startsWith("launch-") ? "Launching..." : "Launch Data Product"}
        </DataEmpireActionButton>
      }
      description="Future data products packaged as high-margin benchmark reports, risk APIs, geo forecast feeds, executive insights, and government watch dashboards."
      eyebrow="Data Monetization Engine"
      title={`${dataEmpireMoney.format(value?.data_product_arr ?? 3_400_000)} annual recurring data product potential`}
      tone="gold"
    >
      <div className="grid gap-3 md:grid-cols-4">
        <DataEmpireMetricCard label="Benchmark ARR" value={dataEmpireMoney.format(value?.benchmark_reports_arr ?? 680_000)} />
        <DataEmpireMetricCard label="Risk API ARR" value={dataEmpireMoney.format(value?.risk_api_arr ?? 920_000)} />
        <DataEmpireMetricCard label="Geo Forecast ARR" value={dataEmpireMoney.format(value?.geo_forecast_arr ?? 560_000)} />
        <DataEmpireMetricCard label="Margin" value={`${value?.margin_profile ?? 87}%`} />
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {products.map((product) => (
          <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4" key={product.product_id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">{product.name}</p>
                <p className="mt-1 text-xs text-white/42">{product.category}</p>
              </div>
              <span className="rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-semibold text-amber-50">
                {product.status}
              </span>
            </div>
            <div className="mt-4">
              <DataEmpireBar label="ARR potential" max={1_000_000} value={product.arr_potential} />
            </div>
            <p className="mt-3 text-xs text-cyan-50/55">Buyers: {product.buyers.join(", ")}</p>
          </div>
        ))}
      </div>
    </DataEmpirePanelShell>
  );
}
