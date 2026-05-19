"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Link2, Upload, ArrowRight, X } from "lucide-react";
import ProgressPipeline from "@/components/upload/ProgressPipeline";
import { submitUrl, submitVideo, getJobStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

const PLATFORMS = [
  { name: "Instagram", icon: "📸", color: "#E1306C" },
  { name: "YouTube", icon: "▶️", color: "#FF0000" },
  { name: "TikTok", icon: "🎵", color: "#69C9D0" },
  { name: "Facebook", icon: "📘", color: "#1877F2" },
  { name: "Twitter / X", icon: "🐦", color: "#1DA1F2" },
];

export default function HomePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [url, setUrl] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [stage, setStage] = useState("Starting...");
  const [isUrl, setIsUrl] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function pollStatus(jobId: string) {
    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        setStage(status.stage ?? "Processing...");
        if (status.status === "completed") {
          clearInterval(interval);
          router.push(`/analyze/${jobId}`);
        } else if (status.status === "failed") {
          clearInterval(interval);
          setError(status.error ?? "Analysis failed. Please try again.");
          setIsProcessing(false);
        }
      } catch {
        // network hiccup — keep polling
      }
    }, 2000);
  }

  async function handleUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    setError(null);
    setIsUrl(true);
    setIsProcessing(true);
    setStage("Downloading video...");
    try {
      const { job_id } = await submitUrl(trimmed);
      pollStatus(job_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to start analysis");
      setIsProcessing(false);
    }
  }

  async function handleFile(file: File) {
    const allowed = ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"];
    if (!allowed.includes(file.type)) {
      setError("Please upload an MP4, MOV, or WebM video file.");
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      setError("File is too large. Maximum size is 100MB.");
      return;
    }
    setError(null);
    setIsUrl(false);
    setIsProcessing(true);
    setStage("Uploading video...");
    try {
      const { job_id } = await submitVideo(file);
      pollStatus(job_id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setIsProcessing(false);
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  if (isProcessing) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-violet-600/8 blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-md flex flex-col items-center gap-6">
          <div className="text-center mb-2">
            <h1 className="text-2xl font-bold gradient-text">ReelCheck</h1>
            <p className="text-sm text-white/40 mt-1">Analyzing your reel…</p>
          </div>
          <div className="w-full">
            <ProgressPipeline stage={stage} status="processing" isUrl={isUrl} />
          </div>
          <p className="text-xs text-white/20 text-center">
            This usually takes 30–90 seconds depending on video length
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-violet-600/7 blur-[130px]" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[300px] rounded-full bg-blue-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center gap-8">

        {/* Logo */}
        <div className="text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full border border-violet-500/20 bg-violet-500/8 text-violet-400 text-xs font-medium">
            <Sparkles className="w-3 h-3" />
            AI-powered reel authenticity analysis
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-3">
            <span className="gradient-text">ReelCheck</span>
          </h1>
          <p className="text-base text-white/45 max-w-sm mx-auto leading-relaxed">
            Paste any reel link and instantly know if it&apos;s genuine, misleading, or hiding something.
          </p>
        </div>

        {/* ── PRIMARY: URL INPUT ── */}
        <div className="w-full animate-slide-up">
          <div className={cn(
            "glass rounded-2xl p-1.5 transition-all duration-200",
            error ? "border border-red-500/30" : "border border-white/8 focus-within:border-violet-500/40"
          )}>
            <div className="flex items-center gap-2 px-3">
              <Link2 className="w-4 h-4 text-white/30 shrink-0" />
              <input
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setError(null); }}
                onKeyDown={(e) => e.key === "Enter" && handleUrl()}
                placeholder="Paste Instagram, YouTube, TikTok link…"
                className="flex-1 bg-transparent py-3.5 text-sm text-white placeholder-white/25 outline-none"
                autoFocus
              />
              {url && (
                <button
                  onClick={() => { setUrl(""); setError(null); }}
                  className="text-white/20 hover:text-white/50 transition-colors p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={handleUrl}
                disabled={!url.trim()}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  url.trim()
                    ? "bg-violet-600 hover:bg-violet-500 text-white"
                    : "bg-white/5 text-white/20 cursor-not-allowed"
                )}
              >
                Analyze
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="mt-2 text-xs text-red-400 px-1">{error}</p>
          )}

          {/* Platform badges */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            {PLATFORMS.map((p) => (
              <span
                key={p.name}
                className="flex items-center gap-1.5 text-xs text-white/35 px-2.5 py-1 rounded-full bg-white/4 border border-white/6"
              >
                <span>{p.icon}</span>
                {p.name}
              </span>
            ))}
          </div>
        </div>

        {/* ── DIVIDER ── */}
        <div className="flex items-center gap-3 w-full animate-fade-in">
          <div className="flex-1 h-px bg-white/6" />
          <span className="text-xs text-white/20 font-medium">or upload a video file</span>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        {/* ── SECONDARY: FILE UPLOAD ── */}
        <div
          className={cn(
            "w-full rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer animate-fade-in",
            dragOver
              ? "border-violet-400/60 bg-violet-500/8"
              : "border-white/8 hover:border-white/16 hover:bg-white/[0.015]"
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          <div className="flex items-center justify-center gap-3 py-5 px-6">
            <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <Upload className="w-4 h-4 text-white/30" />
            </div>
            <div>
              <p className="text-sm text-white/50">
                {dragOver ? "Drop the video here" : "Drop MP4 / MOV / WebM here"}
              </p>
              <p className="text-xs text-white/25 mt-0.5">Max 100MB</p>
            </div>
          </div>
        </div>

        {/* Feature hints */}
        <div className="grid grid-cols-2 gap-2.5 w-full animate-fade-in">
          {[
            { icon: "🎯", text: "Claim verification" },
            { icon: "👁️", text: "Visual authenticity" },
            { icon: "🎣", text: "Engagement bait detection" },
            { icon: "🛒", text: "Product link detection" },
          ].map((f) => (
            <div key={f.text} className="glass px-4 py-3 rounded-xl flex items-center gap-2.5">
              <span className="text-sm">{f.icon}</span>
              <span className="text-xs text-white/40 font-medium">{f.text}</span>
            </div>
          ))}
        </div>

        <p className="text-xs text-white/20 text-center">
          Videos are processed and immediately deleted. Nothing is stored permanently.
        </p>
      </div>
    </main>
  );
}
