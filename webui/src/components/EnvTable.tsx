import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { EnvMap } from "../api/env";
import { getEnv, saveEnv } from "../api/env";

export default function EnvTable() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["env"],
    queryFn: getEnv,
  });

  const [values, setValues] = useState<EnvMap>({});

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const entries = useMemo(
    () => Object.entries(values).sort(([a], [b]) => a.localeCompare(b)),
    [values],
  );

  const saveMutation = useMutation({
    mutationFn: (payload: EnvMap) => saveEnv(payload),
    onSuccess: () => {
      refetch();
    },
  });

  function updateKey(k: string, v: string) {
    setValues((prev) => ({ ...prev, [k]: v }));
  }

  if (isLoading) {
    return (
      <div className="text-sm opacity-80">Loading environment variables…</div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50"
          onClick={() => saveMutation.mutate(values)}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? "Saving…" : "Save"}
        </button>
        <button
          className="px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-50 dark:hover:bg-neutral-800 dark:border-neutral-700"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border border-gray-200 dark:border-neutral-700 rounded-md overflow-hidden">
          <thead className="bg-gray-50 dark:bg-neutral-800">
            <tr>
              <th className="text-left p-2 border-b border-gray-200 dark:border-neutral-700 w-64">
                Key
              </th>
              <th className="text-left p-2 border-b border-gray-200 dark:border-neutral-700">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map(([k, v]) => (
              <tr
                key={k}
                className="hover:bg-gray-50 dark:hover:bg-neutral-800"
              >
                <td className="p-2 align-top border-b border-gray-100 dark:border-neutral-800 font-mono text-xs">
                  {k}
                </td>
                <td className="p-2 align-top border-b border-gray-100 dark:border-neutral-800">
                  <input
                    className="w-full px-2 py-1 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
                    value={v}
                    onChange={(e) => updateKey(k, e.target.value)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
