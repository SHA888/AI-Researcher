import { api } from "./client";

export interface RunRequest {
  question: string;
  reference?: string;
  mode: string;
}

export interface StartRunResponse {
  job_id: string;
  accepted: boolean;
}

export interface RunStatus {
  status: "running" | "done" | "error" | "unknown";
  log_path?: string;
  error?: string;
}

export async function startRun(body: RunRequest): Promise<StartRunResponse> {
  const { data } = await api.post<StartRunResponse>("/run", body);
  return data;
}

export async function getRunStatus(jobId: string): Promise<RunStatus> {
  const { data } = await api.get<RunStatus>(`/run/${jobId}/status`);
  return data;
}
