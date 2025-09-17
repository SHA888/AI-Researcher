import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getDownloadUrl, listLogs, type LogFileInfo } from "../api/logs";
import LogStream from "../components/LogStream";

export default function Logs() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["logs"],
    queryFn: listLogs,
    refetchInterval: 8000,
  });

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<LogFileInfo | null>(null);

  const files = useMemo(() => {
    const arr = data ?? [];
    if (!search) return arr;
    const q = search.toLowerCase();
    return arr.filter((f) => f.name.toLowerCase().includes(q));
  }, [data, search]);

  function fmtBytes(n: number): string {
    if (n < 1024) return `${n} B`;
    const kb = n / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(1)} GB`;
  }

  function fmtTime(t: number): string {
    return new Date(t * 1000).toLocaleString();
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Logs</h2>

      <div className="flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name"
          className="px-2 py-1 rounded-md border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
        />
        <button
          className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
          onClick={() => refetch()}
          disabled={isRefetching}
        >
          {isRefetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <div className="overflow-x-auto">
        {isLoading ? (
          <div className="text-sm opacity-80">Loading logs…</div>
        ) : (
          <table className="w-full text-sm border border-gray-200 dark:border-neutral-700 rounded-md overflow-hidden">
            <thead className="bg-gray-50 dark:bg-neutral-800">
              <tr>
                <th className="text-left p-2 border-b border-gray-200 dark:border-neutral-700">
                  Name
                </th>
                <th className="text-left p-2 border-b border-gray-200 dark:border-neutral-700 w-32">
                  Size
                </th>
                <th className="text-left p-2 border-b border-gray-200 dark:border-neutral-700 w-56">
                  Modified
                </th>
                <th className="text-left p-2 border-b border-gray-200 dark:border-neutral-700 w-52">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr
                  key={f.path}
                  className="hover:bg-gray-50 dark:hover:bg-neutral-800"
                >
                  <td className="p-2 border-b border-gray-100 dark:border-neutral-800 font-mono text-xs">
                    {f.name}
                  </td>
                  <td className="p-2 border-b border-gray-100 dark:border-neutral-800">
                    {fmtBytes(f.size)}
                  </td>
                  <td className="p-2 border-b border-gray-100 dark:border-neutral-800">
                    {fmtTime(f.mtime)}
                  </td>
                  <td className="p-2 border-b border-gray-100 dark:border-neutral-800">
                    <div className="flex gap-2">
                      <button
                        className="px-2 py-1 rounded-md border border-gray-300 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-800"
                        onClick={() => setSelected(f)}
                      >
                        View
                      </button>
                      <a
                        className="px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-500"
                        href={getDownloadUrl(f.path)}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-sm">
          Selected:{" "}
          <span className="font-mono">{selected?.name ?? "(none)"}</span>
        </div>
        <LogStream path={selected?.path ?? ""} />
      </div>
    </div>
  );
}
