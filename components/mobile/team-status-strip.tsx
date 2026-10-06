import { cn } from "@/lib/mobile/helpers";
import type { TeamMember } from "@/lib/mobile/types";

type TeamStatusStripProps = {
  members: TeamMember[];
};

export function TeamStatusStrip({ members }: TeamStatusStripProps) {
  return (
    <section aria-label="Team member status" className="flex gap-3 overflow-x-auto pb-1">
      {members.map((member) => (
        <article className="min-w-40 rounded-[22px] border border-white/10 bg-white/[0.06] p-4 backdrop-blur-2xl" key={member.id}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 rounded-full",
                member.status === "support_needed" && "bg-red-300 shadow-[0_0_14px_rgba(239,68,68,0.75)]",
                member.status === "en_route" && "bg-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.75)]",
                member.status === "on_scene" && "bg-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.75)]",
                member.status === "clearing" && "bg-blue-300 shadow-[0_0_14px_rgba(59,130,246,0.75)]",
                member.status === "standby" && "bg-slate-300",
              )}
            />
            <p className="text-sm font-bold text-white">{member.name}</p>
          </div>
          <p className="mt-2 text-xs text-slate-400">{member.role}</p>
          <p className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.13em] text-slate-300">{member.status.replaceAll("_", " ")}</p>
        </article>
      ))}
    </section>
  );
}
