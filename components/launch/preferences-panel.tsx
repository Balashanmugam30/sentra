import { LaunchPanel } from "@/components/launch/launch-panel";
import type { LaunchPreference } from "@/lib/launch/types";

export function PreferencesPanel({ preferences }: { preferences: LaunchPreference[] }) {
  return (
    <LaunchPanel eyebrow="Settings + Personalization" title="Elite operator preferences for launch demos and enterprise pilots">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {preferences.map((preference) => (
          <article className="rounded-3xl border border-white/10 bg-black/25 p-5" key={preference.pref_id}>
            <p className="text-lg font-semibold text-white">{preference.name}</p>
            <p className="mt-2 text-sm text-cyan-100/65">Default: {preference.default}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {preference.options.map((option) => (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60" key={`${preference.pref_id}-${option}`}>{option}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </LaunchPanel>
  );
}
