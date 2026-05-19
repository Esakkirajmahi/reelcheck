"use client";

import { useEffect, useRef } from "react";
import { getTrustColor } from "@/lib/utils";

interface Props {
  score: number;
  label: string;
  explanation: string;
}

export default function TrustMeter({ score, label, explanation }: Props) {
  const circleRef = useRef<SVGCircleElement>(null);
  const color = getTrustColor(score);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const labelMap: Record<string, string> = {
    trustworthy: "Trustworthy",
    mixed: "Mixed Signals",
    suspicious: "Suspicious",
    misleading: "Misleading",
  };

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.style.strokeDashoffset = String(circumference);
    const timeout = setTimeout(() => {
      if (circleRef.current) {
        circleRef.current.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)";
        circleRef.current.style.strokeDashoffset = String(offset);
      }
    }, 100);
    return () => clearTimeout(timeout);
  }, [score, offset, circumference]);

  return (
    <div className="glass p-8 rounded-2xl flex flex-col items-center gap-6 animate-slide-up">
      <p className="text-xs text-white/40 uppercase tracking-widest font-medium self-start">
        Trust Score
      </p>

      <div className="relative">
        <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
          {/* Background track */}
          <circle
            cx="100" cy="100" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="12"
          />
          {/* Score arc */}
          <circle
            ref={circleRef}
            cx="100" cy="100" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            style={{ filter: `drop-shadow(0 0 12px ${color}60)` }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-5xl font-bold tabular-nums" style={{ color }}>
            {score}
          </span>
          <span className="text-xs text-white/40 mt-1">out of 100</span>
        </div>
      </div>

      <div className="text-center">
        <div
          className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-3"
          style={{ background: `${color}18`, color, border: `1px solid ${color}30` }}
        >
          {labelMap[label] ?? label}
        </div>
        <p className="text-sm text-white/55 leading-relaxed max-w-xs text-center">
          {explanation}
        </p>
      </div>
    </div>
  );
}
