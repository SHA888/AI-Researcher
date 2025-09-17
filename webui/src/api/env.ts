import { api } from "./client";

export type EnvMap = Record<string, string>;

export async function getEnv(): Promise<EnvMap> {
  const { data } = await api.get<{ env: EnvMap }>("/env");
  return data.env;
}

export async function saveEnv(values: EnvMap): Promise<void> {
  await api.put("/env", { values });
}
