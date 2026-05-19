import { ExternalLink, CheckCircle, XCircle, HelpCircle } from "lucide-react";
import type { AnalysisTool } from "@/lib/types";

export default function ToolCard({ tool }: { tool: AnalysisTool }) {
  return (
    <div className="glass p-5 rounded-xl flex flex-col gap-3 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-white text-sm">{tool.name}</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {tool.category}
            </span>
            {tool.is_free === true && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Free
              </span>
            )}
            {tool.is_free === false && (
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Paid
              </span>
            )}
          </div>
          <p className="text-xs text-white/45 mt-1.5 leading-relaxed">{tool.context}</p>
        </div>

        {tool.official_url && (
          <a
            href={tool.official_url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/15 border border-blue-500/20 hover:border-blue-400/40 px-3 py-1.5 rounded-lg transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink className="w-3 h-3" />
            Official site
          </a>
        )}
      </div>

      {/* Pricing */}
      {tool.pricing_note && (
        <div className="flex items-start gap-2 bg-white/[0.03] rounded-lg px-3 py-2 border border-white/5">
          <span className="text-xs text-white/30 mt-0.5 shrink-0">Pricing</span>
          <span className="text-xs text-white/60 leading-relaxed">{tool.pricing_note}</span>
        </div>
      )}

      {/* Claimed vs Reality */}
      {tool.claimed_vs_reality && (
        <div className="flex items-start gap-2 border-t border-white/5 pt-3">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400/70 mt-0.5 shrink-0" />
          <p className="text-xs text-amber-300/70 leading-relaxed">{tool.claimed_vs_reality}</p>
        </div>
      )}
    </div>
  );
}
