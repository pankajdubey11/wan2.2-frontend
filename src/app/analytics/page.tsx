"use client";

import { useEffect, useState } from "react";
import {
  getAnalyticsOverview,
  getAnalyticsModels,
  type AnalyticsOverview,
  type ModelUsageItem,
} from "@/lib/api";
import { useProject } from "@/lib/project-context";

export default function AnalyticsPage() {
  const { project } = useProject();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [models, setModels] = useState<ModelUsageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!project) return;
    const pid = project.id;
    let mounted = true;
    async function load() {
      try {
        const [ov, md] = await Promise.all([
          getAnalyticsOverview(pid),
          getAnalyticsModels(pid),
        ]);
        if (!mounted) return;
        setOverview(ov);
        setModels(md);
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message || "Failed to load analytics");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [project]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const completionPct = overview
    ? Math.round(overview.completion_rate * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {overview && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-gray-900">
                {overview.total_jobs}
              </p>
              <p className="text-sm text-gray-500 mt-1">Total Jobs</p>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {overview.completed_jobs}
              </p>
              <p className="text-sm text-gray-500 mt-1">Completed</p>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">
                {overview.failed_jobs}
              </p>
              <p className="text-sm text-gray-500 mt-1">Failed</p>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {completionPct}%
              </p>
              <p className="text-sm text-gray-500 mt-1">Completion Rate</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {overview.processing_jobs}
              </p>
              <p className="text-sm text-gray-500 mt-1">Processing</p>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">
                {overview.queued_jobs}
              </p>
              <p className="text-sm text-gray-500 mt-1">Queued</p>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-500">Average Latency</p>
            <p className="text-2xl font-bold text-gray-900">
              {overview.avg_latency_seconds.toFixed(1)}s
            </p>
          </div>
        </>
      )}

      <h2 className="text-xl font-bold mb-4">Model Usage</h2>
      {models.length === 0 ? (
        <p className="text-gray-400 text-sm">No model usage data yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Model</th>
                <th className="pb-2 font-medium">Total</th>
                <th className="pb-2 font-medium">Completed</th>
                <th className="pb-2 font-medium">Failed</th>
                <th className="pb-2 font-medium">Success Rate</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr key={m.model} className="border-b last:border-0">
                  <td className="py-2 font-medium text-gray-900">{m.model}</td>
                  <td className="py-2">{m.count}</td>
                  <td className="py-2 text-green-600">{m.completed}</td>
                  <td className="py-2 text-red-600">{m.failed}</td>
                  <td className="py-2">
                    {m.count > 0
                      ? `${Math.round((m.completed / m.count) * 100)}%`
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
