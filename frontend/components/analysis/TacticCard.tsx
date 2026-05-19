import { getSeverityColor, formatTactic } from "@/lib/utils";
import type { PersuasionTactic } from "@/lib/types";

const TACTIC_ICONS: Record<string, string> = {
  urgency: "⚡",
  scarcity: "⏳",
  social_proof: "👥",
  engagement_bait: "🎣",
  authority: "🎖️",
  fomo: "😰",
  before_after: "↔️",
  false_promise: "🚩",
  emotional_manipulation: "🎭",
};

export default function TacticCard({ tactic }: { tactic: PersuasionTactic }) {
  const color = getSeverityColor(tactic.severity);

  return (
    <div className="glass p-4 rounded-xl flex flex-col gap-3 animate-fade-in">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{TACTIC_ICONS[tactic.tactic] ?? "⚠️"}</span>
          <span className="text-sm font-medium text-white">{formatTactic(tactic.tactic)}</span>
        </div>
        <span
          className="text-xs px-2.5 py-1 rounded-full font-medium capitalize"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
        >
          {tactic.severity}
        </span>
      </div>

      <p className="text-xs text-white/50 leading-relaxed border-l-2 pl-3 italic"
         style={{ borderColor: `${color}50` }}>
        {tactic.evidence}
      </p>
    </div>
  );
}
