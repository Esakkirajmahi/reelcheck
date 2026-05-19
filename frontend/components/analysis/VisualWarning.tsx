import { Eye } from "lucide-react";
import { getVerdictColor } from "@/lib/utils";
import type { VisualWarning } from "@/lib/types";

const VERDICT_LABELS: Record<string, string> = {
  appears_genuine: "Appears Genuine",
  suspicious: "Suspicious",
  likely_manipulated: "Likely Manipulated",
};

export default function VisualWarningCard({ warning }: { warning: VisualWarning }) {
  const color = getVerdictColor(warning.verdict);

  return (
    <div className="glass p-4 rounded-xl flex flex-col gap-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2 flex-1">
          <Eye className="w-4 h-4 text-white/40 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-white/90">{warning.concern}</p>
            {warning.platform_shown && warning.platform_shown !== "none" && (
              <span className="text-xs text-white/35 mt-0.5 block">
                Platform detected: {warning.platform_shown}
              </span>
            )}
          </div>
        </div>

        <div
          className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
        >
          {VERDICT_LABELS[warning.verdict] ?? warning.verdict}
        </div>
      </div>

      <p className="text-xs text-white/40 leading-relaxed border-t border-white/5 pt-3">
        {warning.explanation}
      </p>
    </div>
  );
}
