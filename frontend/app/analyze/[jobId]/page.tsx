"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, CheckCircle, XCircle, ChevronDown, ChevronUp,
  Sparkles, MessageSquare, Wrench, AlertTriangle, Eye, ShoppingBag
} from "lucide-react";
import TrustMeter from "@/components/analysis/TrustMeter";
import ScamRisk from "@/components/analysis/ScamRisk";
import ClaimCard from "@/components/analysis/ClaimCard";
import ToolCard from "@/components/analysis/ToolCard";
import ProductCard from "@/components/analysis/ProductCard";
import TacticCard from "@/components/analysis/TacticCard";
import EngagementBaitCard from "@/components/analysis/EngagementBait";
import VisualWarningCard from "@/components/analysis/VisualWarning";
import OfficialLinks from "@/components/analysis/OfficialLinks";
import { getJobResults } from "@/lib/api";
import { formatContentType } from "@/lib/utils";
import type { JobResult } from "@/lib/types";

function SectionHeader({
  icon, title, count,
}: {
  icon: React.ReactNode;
  title: string;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-white/40">{icon}</span>
      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className="ml-auto text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  const [data, setData] = useState<JobResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transcriptOpen, setTranscriptOpen] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const result = await getJobResults(jobId);
        if (result.status === "processing") {
          setTimeout(load, 2000);
        } else {
          setData(result);
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load results");
      }
    }
    load();
  }, [jobId]);

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="glass p-8 rounded-2xl text-center max-w-sm w-full">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-white mb-2">Analysis Failed</h2>
          <p className="text-sm text-white/50 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-sm text-white/70 transition-colors"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-violet-400/40 border-t-violet-400 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-white/40">Loading analysis…</p>
        </div>
      </main>
    );
  }

  const r = data.result;

  return (
    <main className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-violet-600/6 blur-[100px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => router.push("/")}
            className="w-9 h-9 rounded-xl glass flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30">ReelCheck</span>
              <span className="text-xs text-white/20">/</span>
              <span className="text-xs px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20">
                {formatContentType(r.content_type)}
              </span>
            </div>
            <h1 className="text-lg font-semibold text-white mt-0.5">Analysis Report</h1>
          </div>
        </div>

        {/* Trust + Scam grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <TrustMeter score={r.trust_score} label={r.trust_label} explanation={r.trust_explanation} />
          <ScamRisk score={r.scam_risk_score} level={r.scam_risk_level} reasons={r.scam_risk_reasons} />
        </div>

        {/* Summary */}
        <div className="glass p-6 rounded-2xl mb-6 animate-slide-up">
          <SectionHeader icon={<Sparkles className="w-4 h-4" />} title="Summary" />
          <p className="text-sm text-white/70 leading-relaxed">{r.summary}</p>
        </div>

        {/* Official Links — shown high up, most useful section */}
        {r.official_links?.length > 0 && (
          <div className="mb-6">
            <OfficialLinks links={r.official_links} />
          </div>
        )}

        {/* Recommended Action */}
        <div className="glass p-5 rounded-2xl mb-6 border border-blue-500/10 animate-slide-up">
          <p className="text-xs text-blue-400 font-medium uppercase tracking-widest mb-2">
            Recommended Action
          </p>
          <p className="text-sm text-white/80 leading-relaxed">{r.recommended_action}</p>
        </div>

        {/* Products — shown right after official links */}
        {r.mentioned_products?.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <SectionHeader
              icon={<ShoppingBag className="w-4 h-4" />}
              title="Products Shown in Reel"
              count={r.mentioned_products.length}
            />
            <div className="flex flex-col gap-3">
              {r.mentioned_products.map((p, i) => <ProductCard key={i} product={p} />)}
            </div>
          </div>
        )}

        {/* Engagement Bait — placed after official links so users see the links first */}
        {r.engagement_bait?.detected && (
          <div className="mb-6 animate-fade-in">
            <EngagementBaitCard bait={r.engagement_bait} />
          </div>
        )}

        {/* Claims */}
        {r.claims.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <SectionHeader
              icon={<MessageSquare className="w-4 h-4" />}
              title="Claims Detected"
              count={r.claims.length}
            />
            <div className="flex flex-col gap-3">
              {r.claims.map((c, i) => <ClaimCard key={i} claim={c} />)}
            </div>
          </div>
        )}

        {/* Mentioned Tools */}
        {r.mentioned_tools.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <SectionHeader
              icon={<Wrench className="w-4 h-4" />}
              title="Tools & Resources"
              count={r.mentioned_tools.length}
            />
            <div className="flex flex-col gap-3">
              {r.mentioned_tools.map((t, i) => <ToolCard key={i} tool={t} />)}
            </div>
          </div>
        )}

        {/* Persuasion Tactics */}
        {r.persuasion_tactics.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <SectionHeader
              icon={<AlertTriangle className="w-4 h-4" />}
              title="Persuasion Tactics"
              count={r.persuasion_tactics.length}
            />
            <div className="flex flex-col gap-3">
              {r.persuasion_tactics.map((t, i) => <TacticCard key={i} tactic={t} />)}
            </div>
          </div>
        )}

        {/* Visual Warnings */}
        {r.visual_warnings.length > 0 && (
          <div className="mb-6 animate-slide-up">
            <SectionHeader
              icon={<Eye className="w-4 h-4" />}
              title="Visual Analysis"
              count={r.visual_warnings.length}
            />
            <div className="flex flex-col gap-3">
              {r.visual_warnings.map((w, i) => <VisualWarningCard key={i} warning={w} />)}
            </div>
          </div>
        )}

        {/* Genuine vs Misleading */}
        {(r.what_appears_genuine.length > 0 || r.what_appears_misleading.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 animate-slide-up">
            {r.what_appears_genuine.length > 0 && (
              <div className="glass p-5 rounded-2xl border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                    Appears Genuine
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {r.what_appears_genuine.map((item, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-emerald-400/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {r.what_appears_misleading.length > 0 && (
              <div className="glass p-5 rounded-2xl border border-red-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <p className="text-xs font-medium text-red-400 uppercase tracking-wider">
                    Appears Misleading
                  </p>
                </div>
                <ul className="flex flex-col gap-2">
                  {r.what_appears_misleading.map((item, i) => (
                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-red-400/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Transcript */}
        {data.transcript && (
          <div className="glass rounded-2xl overflow-hidden mb-8 animate-slide-up">
            <button
              className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
              onClick={() => setTranscriptOpen((v) => !v)}
            >
              <span className="text-sm font-medium text-white/60">Full Transcript</span>
              {transcriptOpen
                ? <ChevronUp className="w-4 h-4 text-white/30" />
                : <ChevronDown className="w-4 h-4 text-white/30" />}
            </button>
            {transcriptOpen && (
              <div className="px-6 pb-6 border-t border-white/5">
                <p className="text-sm text-white/45 leading-relaxed whitespace-pre-wrap pt-4">
                  {data.transcript}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass hover:bg-white/10 text-sm text-white/60 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze another reel
          </button>
          <p className="text-xs text-white/20 mt-4">
            AI analysis may not be 100% accurate. Always verify claims independently.
          </p>
        </div>
      </div>
    </main>
  );
}
