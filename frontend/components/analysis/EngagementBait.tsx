import { MessageSquare, Info } from "lucide-react";
import type { EngagementBait } from "@/lib/types";

export default function EngagementBaitCard({ bait }: { bait: EngagementBait }) {
  if (!bait.detected) return null;

  return (
    <div className="glass p-5 rounded-xl border border-amber-500/15 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <MessageSquare className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-300 mb-1">Engagement Bait Detected</p>
          {bait.pattern && (
            <p className="text-xs text-white/55 italic mb-2 leading-relaxed">
              &ldquo;{bait.pattern}&rdquo;
            </p>
          )}
          <div className="flex items-start gap-1.5 mt-2">
            <Info className="w-3 h-3 text-white/25 mt-0.5 shrink-0" />
            <p className="text-xs text-white/35 leading-relaxed">
              The official links to everything mentioned in this reel are listed above — no need to comment or DM.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
