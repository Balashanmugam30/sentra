"use client";

import { useFacility } from "@/lib/facility/use-facility";

export function FacilityAssetsPanel() {
  const { assets, doorCommand, hvacCommand, recallElevator } = useFacility();
  const flatAssets = (assets?.groups ?? []).flatMap((group) => group.assets);

  return (
    <section
      className="relative w-full overflow-hidden rounded-[28px] border px-6 py-5 backdrop-blur-xl"
      style={{
        borderColor: "var(--border)",
        background: "var(--surface)",
        boxShadow: "var(--sentra-shadow-panel)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-[1px] rounded-[27px]"
        style={{
          border: "1px solid var(--border)",
          background: "var(--surface-soft)",
        }}
      />
      <div className="relative z-10">
        <div className="space-y-2">
          <p
            className="text-[0.7rem] uppercase tracking-[0.26em]"
            style={{ color: "var(--sentra-text-soft)" }}
          >
            Infrastructure Asset Grid
          </p>
          <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[var(--text)]">
            Doors, HVAC, PA, cameras, elevators, fire-panel assets, and campus connectors
          </h2>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {flatAssets.map((asset, index) => (
            <div
              className="rounded-[22px] border p-4"
              key={`${asset.asset_id}-${index}`}
              style={{
                borderColor: "var(--sentra-border-subtle)",
                background: "var(--surface-soft)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-medium text-[var(--text)]">{asset.asset_id}</div>
                  <div className="mt-1 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                    {asset.zone} | {asset.asset_type.replaceAll("_", " ")}
                  </div>
                </div>
                <div
                  className="rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]"
                  style={{
                    borderColor: asset.online
                      ? "rgba(74, 222, 128, 0.22)"
                      : "rgba(248, 113, 113, 0.28)",
                    background: asset.online
                      ? "rgba(20, 83, 45, 0.18)"
                      : "rgba(127, 29, 29, 0.2)",
                    color: asset.online ? "#bbf7d0" : "#fecaca",
                  }}
                >
                  {asset.online ? "online" : "offline"}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-sm" style={{ color: "var(--sentra-text-muted)" }}>
                <div>{asset.name}</div>
                <div>Status {asset.status.replaceAll("_", " ")}</div>
                <div>Mode {asset.mode}</div>
                <div>Health {asset.health_score}</div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {asset.asset_type === "access_control" ? (
                  <>
                    <button
                      className="rounded-full border px-3 py-2 text-xs font-medium"
                      onClick={() => {
                        void doorCommand(asset.asset_id, "lock");
                      }}
                      style={{
                        borderColor: "rgba(248, 113, 113, 0.24)",
                        background: "rgba(127, 29, 29, 0.16)",
                        color: "#fecaca",
                      }}
                      type="button"
                    >
                      Lock
                    </button>
                    <button
                      className="rounded-full border px-3 py-2 text-xs font-medium"
                      onClick={() => {
                        void doorCommand(asset.asset_id, "unlock");
                      }}
                      style={{
                        borderColor: "rgba(74, 222, 128, 0.22)",
                        background: "rgba(20, 83, 45, 0.2)",
                        color: "#bbf7d0",
                      }}
                      type="button"
                    >
                      Unlock
                    </button>
                  </>
                ) : null}
                {asset.asset_type === "hvac_bms" ? (
                  <button
                    className="rounded-full border px-3 py-2 text-xs font-medium"
                    onClick={() => {
                      void hvacCommand(asset.zone, "shutdown");
                    }}
                    style={{
                      borderColor: "rgba(251, 191, 36, 0.24)",
                      background: "rgba(146, 64, 14, 0.16)",
                      color: "#fde68a",
                    }}
                    type="button"
                  >
                    Shutdown HVAC
                  </button>
                ) : null}
                {asset.asset_type === "elevator_controller" ? (
                  <button
                    className="rounded-full border px-3 py-2 text-xs font-medium"
                    onClick={() => {
                      void recallElevator(asset.zone);
                    }}
                    style={{
                      borderColor: "rgba(96, 165, 250, 0.24)",
                      background: "rgba(30, 64, 175, 0.16)",
                      color: "#dbeafe",
                    }}
                    type="button"
                  >
                    Recall Elevator
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

