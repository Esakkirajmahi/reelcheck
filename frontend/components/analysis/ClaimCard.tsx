import { getVerdictColor } from "@/lib/utils";
import type { AnalysisClaim } from "@/lib/types";

const VERDICT_LABELS: Record<string, string> = {
  plausible: "Plausible",
  exaggerated: "Exaggerated",
  unverifiable: "Unverifiable",
  false_signal: "False Signal",
};

const TYPE_LABELS: Record<string, string> = {
  income: "Income",
  tool: "Tool",
  method: "Method",
  outcome: "Outcome",
  availability: "Availability",
  authority: "Authority",
};

export default function ClaimCard({ claim }: { claim: AnalysisClaim }) {
  const color = getVerdictColor(claim.verdict);

  return (
    <div className="glass p-5 rounded-xl flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-white/90 leading-relaxed flex-1">&ldquo;{claim.text}&rdquo;</p>
        <div
          className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
        >
          {VERDICT_LABELS[claim.verdict] ?? claim.verdict}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-white/40 border border-white/5">
          {TYPE_LABELS[claim.type] ?? claim.type}
        </span>
      </div>

      <p className="text-xs text-white/45 leading-relaxed border-t border-white/5 pt-3">
        {claim.explanation}
      </p>
    </div>
  );
}
