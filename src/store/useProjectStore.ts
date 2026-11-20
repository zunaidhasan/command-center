import { create } from 'zustand';
import { Project, ProjectStatus } from '@/types/project';
import { INITIAL_PROJECTS } from '@/services/initial-data';
import { getDatabase } from '@/db/idb';

interface ProjectState {
  projects: Project[];
  isLoading: boolean;
  checkingHealthId: string | null;

  initProjects: () => Promise<void>;
  addProject: (project: Omit<Project, 'id' | 'createdAt'>) => Promise<Project>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  checkProjectHealth: (id: string) => Promise<{ status: ProjectStatus; latencyMs?: number }>;
  checkAllProjectsHealth: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  isLoading: true,
  checkingHealthId: null,

  initProjects: async () => {
    try {
      const db = await getDatabase();
      const saved = await db.getAll('projects');
      if (saved.length === 0) {
        const tx = db.transaction('projects', 'readwrite');
        for (const p of INITIAL_PROJECTS) {
          await tx.store.put(p);
        }
        await tx.done;
        set({ projects: INITIAL_PROJECTS, isLoading: false });
      } else {
        set({ projects: saved, isLoading: false });
      }
    } catch (err) {
      console.error('[ProjectStore] Failed to load projects:', err);
      set({ projects: INITIAL_PROJECTS, isLoading: false });
    }
  },

  addProject: async (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    const updated = [newProject, ...get().projects];
    set({ projects: updated });

    try {
      const db = await getDatabase();
      await db.put('projects', newProject);
    } catch (err) {
      console.error('[ProjectStore] Failed to persist project in IDB:', err);
    }

    return newProject;
  },

  updateProject: async (id, updates) => {
    const updated = get().projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
    set({ projects: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('projects', id);
      if (existing) {
        await db.put('projects', { ...existing, ...updates });
      }
    } catch (err) {
      console.error('[ProjectStore] Failed to update project in IDB:', err);
    }
  },

  deleteProject: async (id) => {
    const updated = get().projects.filter((p) => p.id !== id);
    set({ projects: updated });

    try {
      const db = await getDatabase();
      await db.delete('projects', id);
    } catch (err) {
      console.error('[ProjectStore] Failed to delete project in IDB:', err);
    }
  },

  checkProjectHealth: async (id: string) => {
    const project = get().projects.find((p) => p.id === id);
    if (!project || !project.deploymentUrl) {
      return { status: 'unknown' };
    }

    set({ checkingHealthId: id });
    const startTime = performance.now();
    let status: ProjectStatus = 'unknown';
    let httpStatus: number | undefined;

    try {
      // In the extension we hold <all_urls> host permissions, so a normal CORS
      // request can read the real status code. On the web build we fall back to
      // no-cors, where an opaque response only proves the host is reachable.
      const isExtension = typeof chrome !== 'undefined' && !!chrome.runtime?.id;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(project.deploymentUrl, {
        method: 'HEAD',
        mode: isExtension ? 'cors' : 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const latencyMs = Math.round(performance.now() - startTime);

      if (response.type === 'opaque') {
        // Reachable, but the browser hides the status from us.
        status = 'operational';
        httpStatus = 200;
      } else {
        status = response.ok ? 'operational' : 'degraded';
        httpStatus = response.status;
      }

      await get().updateProject(id, {
        status,
        lastChecked: Date.now(),
        healthCheckedAt: Date.now(),
        httpStatus,
      });

      set({ checkingHealthId: null });
      return { status, latencyMs };
    } catch (err: any) {
      const latencyMs = Math.round(performance.now() - startTime);
      status = err.name === 'AbortError' ? 'degraded' : 'unknown';

      await get().updateProject(id, {
        status,
        lastChecked: Date.now(),
        healthCheckedAt: Date.now(),
      });

      set({ checkingHealthId: null });
      return { status, latencyMs };
    }
  },

  checkAllProjectsHealth: async () => {
    const { projects } = get();
    for (const p of projects) {
      if (p.deploymentUrl) {
        await get().checkProjectHealth(p.id);
      }
    }
  },
}));
