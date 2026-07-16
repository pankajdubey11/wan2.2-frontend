"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getOrCreateDefaultProject, listProjects, type Project } from "./api";

type ProjectContextValue = {
  project: Project | null;
  projects: Project[];
  loading: boolean;
  selectProject: (id: string) => void;
  refresh: () => Promise<void>;
};

const ProjectContext = createContext<ProjectContextValue>({
  project: null,
  projects: [],
  loading: true,
  selectProject: () => {},
  refresh: async () => {},
});

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const all = await listProjects();
      setProjects(all);
      if (!project || !all.find((p) => p.id === project.id)) {
        if (all.length > 0) {
          setProject(all[0]);
        } else {
          const defaultProject = await getOrCreateDefaultProject();
          setProject(defaultProject);
          setProjects([defaultProject]);
        }
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [project]);

  useEffect(() => {
    refresh();
  }, []);

  const selectProject = useCallback(
    (id: string) => {
      const found = projects.find((p) => p.id === id);
      if (found) setProject(found);
    },
    [projects],
  );

  return (
    <ProjectContext.Provider value={{ project, projects, loading, selectProject, refresh }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  return useContext(ProjectContext);
}
