export interface AnalysisClaim {
  text: string;
  type: string;
  verdict: "plausible" | "exaggerated" | "unverifiable" | "false_signal";
  explanation: string;
}

export interface AnalysisTool {
  name: string;
  category: string;
  context: string;
  official_url: string | null;
  is_free: boolean | null;
  pricing_note: string | null;
  claimed_vs_reality: string | null;
}

export interface MentionedProduct {
  name: string;
  category: string;
  claimed_price: string | null;
  claimed_platform: string | null;
  visual_details: string | null;
  search_query: string;
  flipkart_search_url: string | null;
  amazon_search_url: string | null;
  google_shopping_url: string | null;
  price_plausibility: "plausible" | "low" | "suspicious";
  price_note: string | null;
}

export interface OfficialLink {
  label: string;
  url: string;
  description: string;
}

export interface PersuasionTactic {
  tactic: string;
  evidence: string;
  severity: "low" | "medium" | "high";
}

export interface EngagementBait {
  detected: boolean;
  pattern: string | null;
  note: string | null;
}

export interface VisualWarning {
  concern: string;
  platform_shown: string;
  verdict: "appears_genuine" | "suspicious" | "likely_manipulated";
  explanation: string;
}

export interface AnalysisResult {
  summary: string;
  content_type: string;
  trust_score: number;
  trust_label: "trustworthy" | "mixed" | "suspicious" | "misleading";
  trust_explanation: string;
  scam_risk_score: number;
  scam_risk_level: "low" | "medium" | "high" | "critical";
  scam_risk_reasons: string[];
  claims: AnalysisClaim[];
  mentioned_tools: AnalysisTool[];
  mentioned_products: MentionedProduct[];
  official_links: OfficialLink[];
  persuasion_tactics: PersuasionTactic[];
  engagement_bait: EngagementBait;
  visual_warnings: VisualWarning[];
  what_appears_genuine: string[];
  what_appears_misleading: string[];
  recommended_action: string;
}

export interface JobStatus {
  job_id: string;
  status: "processing" | "completed" | "failed";
  stage: string;
  error?: string;
}

export interface JobResult {
  job_id: string;
  status: string;
  result: AnalysisResult;
  transcript: string;
  created_at: string;
  completed_at: string;
}
