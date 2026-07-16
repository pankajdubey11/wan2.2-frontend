"use client";

import { useEffect, useState } from "react";
import {
  API_BASE,
  listAiJobs,
  type JobHistoryItem,
} from "@/lib/api";
import { useProject } from "@/lib/project-context";

const STATUS_COLORS: Record<string, string> = {
  queued: "text-yellow-600 bg-yellow-50",
  processing: "text-blue-600 bg-blue-50",
  completed: "text-green-600 bg-green-50",
  failed: "text-red-600 bg-red-50",
};

export default function HistoryPage() {
  const { project } = useProject();
  const [jobs, setJobs] = useState<JobHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    const pid = project.id;
    let mounted = true;
    async function load() {
      try {
        const data = await listAiJobs({ project_id: pid, limit: 100 });
        if (mounted) setJobs(data);
      } catch (e) {
        if (mounted) setError((e as Error).message || "Failed to load job history");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [project]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Job History</h1>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">📋</div>
          <p>No jobs yet.</p>
          <p className="text-sm mt-1">Jobs will appear here after you generate videos.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Created</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Output</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => {
                const dur =
                  job.started_at && job.completed_at
                    ? (
                        (new Date(job.completed_at).getTime() -
                          new Date(job.started_at).getTime()) /
                        1000
                      ).toFixed(1) + "s"
                    : "-";
                return (
                  <tr key={job.job_id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-2">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-xs font-medium capitalize ${
                          STATUS_COLORS[job.status] || "text-gray-600 bg-gray-50"
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-900 font-medium">{job.model}</td>
                    <td className="py-2 text-gray-500">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="py-2 text-gray-500">{dur}</td>
                    <td className="py-2">
                      {job.status === "completed" && job.output_url ? (
                        <a
                          href={`${API_BASE}${job.output_url}`}
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download
                        </a>
                      ) : job.status === "failed" ? (
                        <span className="text-red-500 text-xs" title={job.error || ""}>
                          Failed
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
