import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function getTrustColor(score: number): string {
  if (score >= 80) return "#00D48A";
  if (score >= 60) return "#F5C842";
  if (score >= 40) return "#FF6B35";
  return "#FF3B5C";
}

export function getScamColor(level: string): string {
  const map: Record<string, string> = {
    low: "#00D48A",
    medium: "#F5C842",
    high: "#FF6B35",
    critical: "#FF3B5C",
  };
  return map[level] ?? "#F5C842";
}

export function getVerdictColor(verdict: string): string {
  const map: Record<string, string> = {
    plausible: "#00D48A",
    exaggerated: "#F5C842",
    unverifiable: "#94a3b8",
    false_signal: "#FF3B5C",
    appears_genuine: "#00D48A",
    suspicious: "#FF6B35",
    likely_manipulated: "#FF3B5C",
  };
  return map[verdict] ?? "#94a3b8";
}

export function getSeverityColor(severity: string): string {
  const map: Record<string, string> = {
    low: "#60a5fa",
    medium: "#F5C842",
    high: "#FF3B5C",
  };
  return map[severity] ?? "#60a5fa";
}

export function formatContentType(type: string): string {
  const map: Record<string, string> = {
    "ai-tool": "AI Tool",
    "side-hustle": "Side Hustle",
    "earn-money": "Earn Money",
    "govt-scheme": "Govt Scheme",
    productivity: "Productivity",
    educational: "Educational",
    "business-advice": "Business Advice",
    entertainment: "Entertainment",
    other: "General",
  };
  return map[type] ?? type;
}

export function formatTactic(tactic: string): string {
  return tactic
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
