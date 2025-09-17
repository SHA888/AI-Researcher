import { api } from "./client";

export interface LogFileInfo {
  path: string;
  name: string;
  size: number;
  mtime: number; // epoch seconds
}

export async function listLogs(): Promise<LogFileInfo[]> {
  const { data } = await api.get<{ files: LogFileInfo[] }>("/logs/list");
  return data.files;
}

export function getDownloadUrl(path: string): string {
  const url = new URL("/api/logs/download", window.location.origin);
  url.searchParams.set("path", path);
  return url.toString();
}
