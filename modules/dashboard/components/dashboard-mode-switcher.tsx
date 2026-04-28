"use client";

export type DashboardMode = "command" | "executive" | "demo" | "crisis";

type DashboardModeSwitcherProps = {
  mode: DashboardMode;
  onModeChange: (mode: DashboardMode) => void;
};

const modes: Array<{ id: DashboardMode; icon: string; label: string; helper: string }> = [
  { id: "command", icon: "C", label: "Command", helper: "Tactical" },
  { id: "executive", icon: "E", label: "Executive", helper: "Board" },
  { id: "demo", icon: "D", label: "Demo", helper: "Story" },
  { id: "crisis", icon: "X", label: "Crisis", helper: "Map" },
];

export function DashboardModeSwitcher({ mode, onModeChange }: DashboardModeSwitcherProps) {
  return (
    <section
      aria-label="Dashboard operating mode"
      className="sentra-mode-switcher sticky top-[92px] z-30 mx-auto mb-4 w-full max-w-[1600px]"
    >
      <div className="hidden rounded-full border border-white/10 bg-[rgba(5,10,20,0.72)] p-1.5 shadow-[0_18px_54px_rgba(0,0,0,0.28)] backdrop-blur-2xl sm:inline-flex">
        {modes.map((item) => {
          const active = item.id === mode;
          return (
            <button
              aria-pressed={active}
              className={`inline-flex min-w-[132px] items-center justify-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition ${
                active
                  ? "border-cyan-200/30 bg-[linear-gradient(135deg,rgba(139,92,246,0.28),rgba(34,211,238,0.18))] text-white shadow-[0_0_34px_rgba(34,211,238,0.14)]"
                  : "border-transparent text-white/56 hover:bg-white/[0.07] hover:text-white"
              }`}
              key={item.id}
              onClick={() => onModeChange(item.id)}
              type="button"
            >
              <span className="text-base text-cyan-100/78">{item.icon}</span>
              <span>{item.label}</span>
              <span className="text-xs font-medium text-white/40">{item.helper}</span>
            </button>
          );
        })}
      </div>
      <label className="block sm:hidden">
        <span className="sr-only">Dashboard mode</span>
        <select
          className="glass-input min-h-12 w-full rounded-full px-4 text-sm font-semibold"
          onChange={(event) => onModeChange(event.target.value as DashboardMode)}
          value={mode}
        >
          {modes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label} Mode
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
