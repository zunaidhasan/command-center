import { WorkspaceConfig, WorkspaceMode } from '@/types/workspace';

export const WORKSPACE_MODES: Record<WorkspaceMode, WorkspaceConfig> = {
  engineering: {
    id: 'engineering',
    name: 'Engineering Mode',
    tagline: 'Code, deploy & automate',
    accentColor: '#1EA7FF',
    icon: 'Terminal',
    folderIds: ['folder-1', 'folder-2'],
    visibleWidgets: ['metrics', 'engineeringHub', 'projects', 'scratchpad'],
  },
  'client-ops': {
    id: 'client-ops',
    name: 'Client Ops & Sales',
    tagline: 'Orders, proposals & pipeline',
    accentColor: '#18D879',
    icon: 'Briefcase',
    folderIds: ['folder-3'],
    visibleWidgets: ['clientHub', 'pipeline', 'referenceEngine', 'clientTasks'],
  },
  creative: {
    id: 'creative',
    name: 'Creative Sandbox',
    tagline: 'UI/UX, visual AI & prototypes',
    accentColor: '#B66BFF',
    icon: 'Palette',
    folderIds: ['folder-4'],
    visibleWidgets: ['designHub', 'quickTools', 'colorPalettes'],
  },
  personal: {
    id: 'personal',
    name: 'Personal & Research',
    tagline: 'Curiosity, learning & notes',
    accentColor: '#FFB21A',
    icon: 'Bookmark',
    folderIds: ['folder-5'],
    visibleWidgets: ['personalHub', 'dailyNotes', 'learningList'],
  },
};
