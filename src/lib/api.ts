export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
};

export type GenerateWorkflowResponse = {
  workflow_execution_id: string;
  job_id: string;
  status: string;
  estimated_seconds: number;
};

export type AIJobStatus = {
  job_id: string;
  project_id: string;
  workflow_execution_id: string;
  status: string;
  progress: number;
  output_url: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type AssetVersion = {
  id: string;
  version_number: number;
  storage_path: string;
  created_at: string;
  download_url: string;
};

export type Asset = {
  id: string;
  project_id: string;
  source_job_id: string | null;
  asset_type: string;
  title: string | null;
  created_at: string;
  latest_version: AssetVersion | null;
};

async function parseJsonOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (!res.ok) {
    const err = await res.text().catch(() => fallbackMessage);
    throw new Error(`API error (${res.status}): ${err || fallbackMessage}`);
  }
  return (await res.json()) as T;
}

export async function listProjects(): Promise<Project[]> {
  const res = await fetch(`${API_BASE}/api/projects`, { cache: "no-store" });
  return parseJsonOrThrow<Project[]>(res, "Failed to fetch projects");
}

export async function createProject(name: string, description?: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/api/projects`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, description }),
  });
  return parseJsonOrThrow<Project>(res, "Failed to create project");
}

export async function getOrCreateDefaultProject(): Promise<Project> {
  const projects = await listProjects();
  if (projects.length > 0) {
    return projects[0];
  }
  return createProject("Default Project", "Auto-created from frontend");
}

export async function generateWorkflow(params: {
  project_id: string;
  model?: string;
  prompt: string;
  image?: string;
  steps?: number;
  guidance_scale?: number;
  seed?: number | null;
  size?: string;
}): Promise<GenerateWorkflowResponse> {
  const res = await fetch(`${API_BASE}/api/workflows/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: "ti2v-5b", size: "704*1280", ...params }),
  });
  return parseJsonOrThrow<GenerateWorkflowResponse>(res, "Failed to submit workflow");
}

export async function getAiJobStatus(jobId: string): Promise<AIJobStatus> {
  const res = await fetch(`${API_BASE}/api/ai-jobs/${jobId}`, { cache: "no-store" });
  return parseJsonOrThrow<AIJobStatus>(res, "Failed to fetch AI job status");
}

export async function getProjectAssets(projectId: string): Promise<Asset[]> {
  const res = await fetch(`${API_BASE}/api/projects/${projectId}/assets`, { cache: "no-store" });
  return parseJsonOrThrow<Asset[]>(res, "Failed to fetch project assets");
}

export type Notification = {
  id: string;
  project_id: string | null;
  job_id: string | null;
  event_type: string;
  channel: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export async function listNotifications(params?: {
  project_id?: string;
  only_unread?: boolean;
}): Promise<Notification[]> {
  const search = new URLSearchParams();
  if (params?.project_id) search.set("project_id", params.project_id);
  if (params?.only_unread) search.set("only_unread", "true");
  const qs = search.toString();
  const url = `${API_BASE}/api/notifications${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  return parseJsonOrThrow<Notification[]>(res, "Failed to fetch notifications");
}

export async function markNotificationRead(notificationId: string): Promise<Notification> {
  const res = await fetch(`${API_BASE}/api/notifications/${notificationId}/read`, {
    method: "POST",
  });
  return parseJsonOrThrow<Notification>(res, "Failed to mark notification as read");
}

export type AnalyticsOverview = {
  total_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  queued_jobs: number;
  processing_jobs: number;
  completion_rate: number;
  avg_latency_seconds: number;
};

export type ModelUsageItem = {
  model: string;
  count: number;
  completed: number;
  failed: number;
};

export async function getAnalyticsOverview(project_id?: string): Promise<AnalyticsOverview> {
  const qs = project_id ? `?project_id=${project_id}` : "";
  const res = await fetch(`${API_BASE}/api/analytics/overview${qs}`, { cache: "no-store" });
  return parseJsonOrThrow<AnalyticsOverview>(res, "Failed to fetch analytics overview");
}

export async function getAnalyticsModels(project_id?: string): Promise<ModelUsageItem[]> {
  const qs = project_id ? `?project_id=${project_id}` : "";
  const res = await fetch(`${API_BASE}/api/analytics/models${qs}`, { cache: "no-store" });
  return parseJsonOrThrow<ModelUsageItem[]>(res, "Failed to fetch analytics models");
}

export type JobHistoryItem = {
  job_id: string;
  project_id: string;
  workflow_execution_id: string;
  status: string;
  progress: number;
  model: string;
  output_url: string | null;
  error: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export async function listAiJobs(params?: {
  project_id?: string;
  limit?: number;
  offset?: number;
}): Promise<JobHistoryItem[]> {
  const search = new URLSearchParams();
  if (params?.project_id) search.set("project_id", params.project_id);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));
  const qs = search.toString();
  const url = `${API_BASE}/api/ai-jobs${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { cache: "no-store" });
  return parseJsonOrThrow<JobHistoryItem[]>(res, "Failed to fetch job history");
}
