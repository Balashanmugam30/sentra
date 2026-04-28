"use client";

import { memo, useMemo, useState } from "react";

import { RequireRole } from "@/components/auth/RequireRole";
import { Badge, Card } from "@/components/ui";
import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { captureEvent } from "@/lib/telemetry";
import { cn } from "@/lib/utils";
import { getDefaultScenario, simulationScenarios } from "@/modules/simulation/scenario-engine";
import { timelineEngine } from "@/modules/simulation/timeline-engine";
import type {
  ScenarioOverrides,
  SimulationFaultType,
  SimulationLevel,
  SimulationSpeed,
} from "@/modules/simulation/types/scenario";
import { useDemoStore } from "@/store/demo-store";
import { useUiStore } from "@/store/ui-store";

function DemoButton({
  children,
  onClick,
  disabled,
  active = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "inline-flex min-h-10 items-center justify-center rounded-full border px-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-brand",
        active
          ? "border-[var(--color-primary)] bg-[color-mix(in_srgb,var(--color-primary)_12%,transparent)] text-foreground"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-muted hover:bg-[var(--color-surface-strong)]",
        disabled ? "cursor-not-allowed opacity-50" : "",
      )}
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}

function ControlSelect<TKey extends keyof ScenarioOverrides>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: ScenarioOverrides[TKey];
  options: { label: string; value: ScenarioOverrides[TKey] }[];
  onChange: (value: ScenarioOverrides[TKey]) => void;
}) {
  return (
    <label className="space-y-2 text-sm text-foreground">
      <span className="block text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted">{label}</span>
      <select
        className="min-h-10 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
        onChange={(event) => onChange(event.target.value as ScenarioOverrides[TKey])}
        value={String(value)}
      >
        {options.map((option) => (
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

const faultOptions: { label: string; value: SimulationFaultType }[] = [
  { label: "Sensor failure", value: "sensor_failure" },
  { label: "Delayed alert", value: "delayed_alert" },
  { label: "Blocked route", value: "route_blocked" },
  { label: "Comms failure", value: "communication_failure" },
];

const levelOptions: { label: string; value: SimulationLevel }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export const DemoPanel = memo(function DemoPanel() {
  const demoModeEnabled = useFeatureFlag("demo_mode");
  const activeScenario = useDemoStore((state) => state.activeScenario);
  const simulationStatus = useDemoStore((state) => state.simulationStatus);
  const timelinePosition = useDemoStore((state) => state.timelinePosition);
  const timelineDuration = useDemoStore((state) => state.timelineDuration);
  const speed = useDemoStore((state) => state.speed);
  const replayLastScenario = useDemoStore((state) => state.replayLastScenario);
  const faultsEnabled = useDemoStore((state) => state.faultsEnabled);
  const selectedFaults = useDemoStore((state) => state.selectedFaults);
  const overrides = useDemoStore((state) => state.overrides);
  const storyModeEnabled = useDemoStore((state) => state.storyModeEnabled);
  const storyAutoAdvance = useDemoStore((state) => state.storyAutoAdvance);
  const activeActors = useDemoStore((state) => state.activeActors);
  const setFaultsEnabled = useDemoStore((state) => state.setFaultsEnabled);
  const toggleFaultSelection = useDemoStore((state) => state.toggleFaultSelection);
  const setOverride = useDemoStore((state) => state.setOverride);
  const setStoryModeEnabled = useDemoStore((state) => state.setStoryModeEnabled);
  const setStoryAutoAdvance = useDemoStore((state) => state.setStoryAutoAdvance);
  const setFeedbackMessage = useUiStore((state) => state.setFeedbackMessage);
  const [selectedScenarioId, setSelectedScenarioId] = useState(activeScenario?.id ?? getDefaultScenario()?.id ?? "");

  const progressPercent = useMemo(() => {
    if (!timelineDuration) {
      return 0;
    }

    return Math.min(100, Math.round((timelinePosition / timelineDuration) * 100));
  }, [timelineDuration, timelinePosition]);

  if (!demoModeEnabled) {
    return null;
  }

  return (
      <RequireRole roles={["super_admin", "admin", "security_manager", "operations_commander"]} fallback={null}>
      <Card className="w-[min(24rem,calc(100vw-2rem))] border-[color-mix(in_srgb,var(--color-border)_88%,transparent)] bg-[color-mix(in_srgb,var(--color-surface)_94%,transparent)] p-4 shadow-[var(--shadow-soft)] backdrop-blur-md">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">Demo Mode</p>
                <h2 className="text-sm font-semibold text-foreground">
                  {activeScenario?.name ?? "Simulation controller"}
                </h2>
              </div>
              <Badge tone={simulationStatus === "running" ? "primary" : "warning"}>{simulationStatus}</Badge>
            </div>
            <p className="text-xs leading-5 text-muted">
              {activeScenario?.description ?? "Drive the command surface using deterministic realtime scenarios."}
            </p>
            <p className="text-xs text-muted">{activeActors.length} responders active</p>
          </div>

          <label className="space-y-2 text-sm text-foreground">
            <span className="block text-xs font-medium uppercase tracking-[0.18em] text-muted">Scenario</span>
            <select
              className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand"
              onChange={(event) => setSelectedScenarioId(event.target.value)}
              value={selectedScenarioId}
            >
              {simulationScenarios.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-2">
            <DemoButton
              disabled={simulationStatus === "running"}
              onClick={() => {
                captureEvent("Simulation panel start clicked", {
                  component: "DemoPanel",
                  metadata: {
                    scenario_id: selectedScenarioId,
                  },
                });
                setFeedbackMessage("Simulation scenario started.");
                timelineEngine.startScenarioById(selectedScenarioId);
              }}
            >
              Start
            </DemoButton>
            <DemoButton
              disabled={simulationStatus !== "running"}
              onClick={() => {
                setFeedbackMessage("Simulation paused.");
                timelineEngine.pauseScenario();
              }}
            >
              Pause
            </DemoButton>
            <DemoButton
              disabled={simulationStatus !== "paused"}
              onClick={() => {
                setFeedbackMessage("Simulation resumed.");
                timelineEngine.resumeScenario();
              }}
            >
              Resume
            </DemoButton>
            <DemoButton
              disabled={simulationStatus === "idle"}
              onClick={() => {
                setFeedbackMessage("Simulation stopped.");
                timelineEngine.stopScenario({ preserveReplay: true });
              }}
            >
              Stop
            </DemoButton>
            <DemoButton
              disabled={!replayLastScenario()}
              onClick={() => {
                setFeedbackMessage("Replaying previous scenario.");
                timelineEngine.replayLastScenario();
              }}
            >
              Replay
            </DemoButton>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted">
              <span>Timeline</span>
              <span>
                {timelinePosition.toFixed(1)}s / {timelineDuration.toFixed(0)}s
              </span>
            </div>
            <div className="h-2 rounded-full bg-[color-mix(in_srgb,var(--color-border)_60%,transparent)]">
              <div
                className="h-full rounded-full bg-[color-mix(in_srgb,var(--color-primary)_72%,transparent)] transition-[width] duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Speed</p>
            <div className="flex gap-2">
              {[1, 2, 5].map((value) => (
                <DemoButton
                  key={value}
                  active={speed === value}
                  onClick={() => {
                    captureEvent("Simulation speed selected", {
                      component: "DemoPanel",
                      metadata: {
                        speed: value,
                      },
                    });
                    setFeedbackMessage(`Simulation speed set to ${value}x.`);
                    timelineEngine.setSpeed(value as SimulationSpeed);
                  }}
                >
                  {value}x
                </DemoButton>
              ))}
            </div>
          </div>

          <div className="space-y-3 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-strong)_62%,transparent)] p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Fault Injection</p>
              <label className="inline-flex items-center gap-2 text-xs text-muted">
                <input
                  checked={faultsEnabled}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                  onChange={(event) => {
                    setFaultsEnabled(event.target.checked);
                    captureEvent("Simulation faults toggled", {
                      component: "DemoPanel",
                      metadata: {
                        enabled: event.target.checked,
                      },
                    });
                    setFeedbackMessage(
                      event.target.checked ? "Fault injection enabled." : "Fault injection disabled.",
                    );
                  }}
                  type="checkbox"
                />
                Enable
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {faultOptions.map((fault) => (
                <DemoButton
                  key={fault.value}
                  active={selectedFaults.includes(fault.value)}
                  disabled={!faultsEnabled}
                  onClick={() => {
                    toggleFaultSelection(fault.value);
                    captureEvent("Simulation fault selection changed", {
                      component: "DemoPanel",
                      metadata: {
                        fault: fault.value,
                      },
                    });
                    setFeedbackMessage(`Fault injected: ${fault.label}.`);
                  }}
                >
                  {fault.label}
                </DemoButton>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <ControlSelect
              label="Fire intensity"
              onChange={(value) => {
                setOverride("fireIntensity", value as SimulationLevel);
                setFeedbackMessage(`Fire intensity set to ${value}.`);
                captureEvent("Simulation override updated", {
                  component: "DemoPanel",
                  metadata: {
                    key: "fireIntensity",
                    value,
                  },
                });
              }}
              options={levelOptions}
              value={overrides.fireIntensity}
            />
            <ControlSelect
              label="Crowd density"
              onChange={(value) => {
                setOverride("crowdDensity", value as SimulationLevel);
                setFeedbackMessage(`Crowd density set to ${value}.`);
                captureEvent("Simulation override updated", {
                  component: "DemoPanel",
                  metadata: {
                    key: "crowdDensity",
                    value,
                  },
                });
              }}
              options={levelOptions}
              value={overrides.crowdDensity}
            />
            <ControlSelect
              label="Spread speed"
              onChange={(value) => {
                setOverride("spreadSpeed", value as SimulationLevel);
                setFeedbackMessage(`Spread speed set to ${value}.`);
                captureEvent("Simulation override updated", {
                  component: "DemoPanel",
                  metadata: {
                    key: "spreadSpeed",
                    value,
                  },
                });
              }}
              options={levelOptions}
              value={overrides.spreadSpeed}
            />
            <ControlSelect
              label="Delay time"
              onChange={(value) => {
                setOverride("delayTimeSec", Number(value));
                setFeedbackMessage(`Decision delay set to ${Number(value)}s.`);
                captureEvent("Simulation override updated", {
                  component: "DemoPanel",
                  metadata: {
                    key: "delayTimeSec",
                    value: Number(value),
                  },
                });
              }}
              options={[
                { label: "0s", value: 0 },
                { label: "3s", value: 3 },
                { label: "6s", value: 6 },
              ]}
              value={overrides.delayTimeSec}
            />
          </div>

          <div className="space-y-2 rounded-[var(--radius-lg)] border border-[color-mix(in_srgb,var(--color-border)_72%,transparent)] bg-[color-mix(in_srgb,var(--color-surface-strong)_62%,transparent)] p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">Story Mode</p>
              <label className="inline-flex items-center gap-2 text-xs text-muted">
                <input
                  checked={storyModeEnabled}
                  className="h-4 w-4 accent-[var(--color-primary)]"
                  onChange={(event) => {
                    setStoryModeEnabled(event.target.checked);
                    setFeedbackMessage(
                      event.target.checked ? "Guided story mode enabled." : "Guided story mode hidden.",
                    );
                    captureEvent("Story mode toggled", {
                      component: "DemoPanel",
                      metadata: {
                        enabled: event.target.checked,
                      },
                    });
                  }}
                  type="checkbox"
                />
                Guided
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-muted">
              <input
                checked={storyAutoAdvance}
                className="h-4 w-4 accent-[var(--color-primary)]"
                disabled={!storyModeEnabled}
                onChange={(event) => {
                  setStoryAutoAdvance(event.target.checked);
                  setFeedbackMessage(
                    event.target.checked ? "Story auto progression enabled." : "Story steps set to manual.",
                  );
                  captureEvent("Story auto progress toggled", {
                    component: "DemoPanel",
                    metadata: {
                      enabled: event.target.checked,
                    },
                  });
                }}
                type="checkbox"
              />
              Auto progress
            </label>
          </div>
        </div>
      </Card>
    </RequireRole>
  );
});
