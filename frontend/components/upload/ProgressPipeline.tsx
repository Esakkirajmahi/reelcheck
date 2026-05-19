"use client";

import { Check, Loader2 } from "lucide-react";

const STAGES = [
  { key: "prepare", label: "Preparing video" },
  { key: "extract", label: "Extracting audio & frames" },
  { key: "transcribe", label: "Transcribing audio" },
  { key: "ocr", label: "Reading text from frames" },
  { key: "analyze", label: "Analyzing with AI" },
];

function matchStage(stage: string): number {
  const s = stage.toLowerCase();
  if (s.includes("download") || s.includes("upload") || s.includes("starting")) return 0;
  if (s.includes("extract")) return 1;
  if (s.includes("transcri")) return 2;
  if (s.includes("reading") || s.includes("ocr")) return 3;
  if (s.includes("analyz") || s.includes("complete")) return 4;
  return 0;
}

interface Props {
  stage: string;
  status: string;
  isUrl?: boolean;
}

export default function ProgressPipeline({ stage, status, isUrl }: Props) {
  const activeIndex = status === "completed" ? STAGES.length : matchStage(stage);

  const stageLabels = STAGES.map((s, i) => {
    if (i === 0) return { ...s, label: isUrl ? "Downloading video" : "Uploading video" };
    return s;
  });

  return (
    <div className="glass p-6 rounded-2xl animate-fade-in">
      <p className="text-xs text-white/40 uppercase tracking-widest font-medium mb-5">
        Processing
      </p>
      <div className="flex flex-col gap-3">
        {stageLabels.map((s, i) => {
          const isDone = i < activeIndex || status === "completed";
          const isActive = i === activeIndex && status !== "completed";

          return (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                ${isDone ? "bg-emerald-500/20 border border-emerald-500/40" :
                  isActive ? "bg-violet-500/20 border border-violet-400/50" :
                  "bg-white/5 border border-white/10"}
              `}>
                {isDone ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : isActive ? (
                  <Loader2 className="w-3 h-3 text-violet-400 animate-spin" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                )}
              </div>

              <span className={`text-sm transition-all duration-300 ${
                isDone ? "text-white/40 line-through" :
                isActive ? "text-white stage-active" :
                "text-white/25"
              }`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-5 h-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${Math.min(100, ((activeIndex + (status === "completed" ? 1 : 0)) / STAGES.length) * 100)}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs text-white/30 text-center stage-active">{stage}</p>
    </div>
  );
}
