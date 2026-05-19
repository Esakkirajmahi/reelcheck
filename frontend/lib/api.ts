import type { JobResult, JobStatus } from "./types";

const BASE = "/api";

export async function submitUrl(url: string): Promise<{ job_id: string }> {
  const res = await fetch(`${BASE}/analyze-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to start analysis" }));
    throw new Error(err.detail ?? "URL analysis failed");
  }

  return res.json();
}

export async function submitVideo(file: File): Promise<{ job_id: string }> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${BASE}/analyze`, { method: "POST", body: form });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail ?? "Upload failed");
  }

  return res.json();
}

export async function getJobStatus(jobId: string): Promise<JobStatus> {
  const res = await fetch(`${BASE}/status/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch job status");
  return res.json();
}

export async function getJobResults(jobId: string): Promise<JobResult> {
  const res = await fetch(`${BASE}/results/${jobId}`);
  if (!res.ok) throw new Error("Failed to fetch results");
  return res.json();
}
