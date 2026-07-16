"use client";

import { useProject } from "@/lib/project-context";

export function ProjectSelector() {
  const { project, projects, loading, selectProject } = useProject();

  if (loading || projects.length <= 1) return null;

  return (
    <select
      className="text-sm border rounded px-2 py-1 text-gray-700"
      value={project?.id || ""}
      onChange={(e) => selectProject(e.target.value)}
    >
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
