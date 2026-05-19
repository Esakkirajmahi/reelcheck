import { EyeOff, MessageSquare } from "lucide-react";
import type { HiddenResource } from "@/lib/types";

const TYPE_ICONS: Record<string, string> = {
  link: "🔗",
  tool: "🛠️",
  prompt: "💬",
  template: "📄",
  group: "👥",
  course: "📚",
  pdf: "📋",
  code: "💻",
};

export default function HiddenResourceCard({ resource }: { resource: HiddenResource }) {
  return (
    <div className="glass p-4 rounded-xl flex flex-col gap-3 animate-fade-in border border-amber-500/10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>{TYPE_ICONS[resource.type] ?? "📦"}</span>
          <span className="text-sm font-medium text-white capitalize">{resource.type}</span>
        </div>

        {resource.is_engagement_bait && (
          <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
            <MessageSquare className="w-3 h-3" />
            Engagement Bait
          </div>
        )}
      </div>

      <div>
        <p className="text-sm text-white/80 mb-1 font-medium">{resource.inferred}</p>
        <div className="flex items-start gap-2 mt-2">
          <EyeOff className="w-3 h-3 text-white/25 mt-0.5 shrink-0" />
          <p className="text-xs text-white/40 leading-relaxed">{resource.evidence}</p>
        </div>
      </div>
    </div>
  );
}
