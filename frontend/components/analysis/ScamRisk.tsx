import { ShieldAlert } from "lucide-react";
import { getScamColor } from "@/lib/utils";

interface Props {
  score: number;
  level: string;
  reasons: string[];
}

export default function ScamRisk({ score, level, reasons }: Props) {
  const color = getScamColor(level);
  const levelMap: Record<string, string> = {
    low: "Low Risk",
    medium: "Medium Risk",
    high: "High Risk",
    critical: "Critical Risk",
  };

  return (
    <div className="glass p-6 rounded-2xl animate-slide-up">
      <div className="flex items-center gap-2 mb-5">
        <ShieldAlert className="w-4 h-4 text-white/40" />
        <p className="text-xs text-white/40 uppercase tracking-widest font-medium">Scam Risk</p>
      </div>

      <div className="flex items-end gap-4 mb-4">
        <span className="text-5xl font-bold tabular-nums" style={{ color }}>
          {score}
        </span>
        <div
          className="mb-1 px-3 py-1 rounded-full text-sm font-semibold"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
        >
          {levelMap[level] ?? level}
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-5">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{
            width: `${score}%`,
            background: `linear-gradient(to right, #00D48A, ${color})`,
          }}
        />
      </div>

      {reasons.length > 0 && (
        <div className="flex flex-col gap-2">
          {reasons.map((r, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
              <p className="text-sm text-white/60">{r}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
