"use client";

import { useEffect, useState } from "react";
import {
  API_BASE,
  getOrCreateDefaultProject,
  getProjectAssets,
  type Asset,
  type Project,
} from "@/lib/api";

export default function GalleryPage() {
  const [project, setProject] = useState<Project | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      try {
        const p = await getOrCreateDefaultProject();
        if (!mounted) return;
        setProject(p);

        const list = await getProjectAssets(p.id);
        if (!mounted) return;
        setAssets(list);
      } catch (e) {
        if (!mounted) return;
        setError((e as Error).message || "Failed to load gallery");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Gallery</h1>
      <p className="text-sm text-gray-600 mb-6">
        Project: <strong>{project?.name ?? "Loading..."}</strong>
      </p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : error ? (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>
      ) : assets.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">🎥</div>
          <p>No assets generated yet.</p>
          <p className="text-sm mt-1">Create videos from Text-to-Video or Image-to-Video.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assets.map((asset) => {
            const version = asset.latest_version;
            const downloadUrl = version ? `${API_BASE}${version.download_url}` : null;
            return (
              <div key={asset.id} className="border rounded-lg overflow-hidden bg-white">
                {downloadUrl ? (
                  <video controls className="w-full" src={downloadUrl} />
                ) : (
                  <div className="bg-gray-100 h-40 flex items-center justify-center text-gray-400 text-sm">
                    No playable version
                  </div>
                )}
                <div className="p-3 space-y-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{asset.title || "Generated Video"}</p>
                  <p className="text-xs text-gray-500">Asset ID: {asset.id.slice(0, 8)}...</p>
                  <p className="text-xs text-gray-500">
                    Version: {version ? `v${version.version_number}` : "N/A"}
                  </p>
                  {downloadUrl && (
                    <a
                      href={downloadUrl}
                      className="inline-block text-xs text-blue-600 hover:text-blue-800"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download MP4
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
