export type WorkspaceMode = 'engineering' | 'client-ops' | 'creative' | 'personal';

export interface WorkspaceConfig {
  id: WorkspaceMode;
  name: string;
  tagline: string;
  accentColor: string;
  icon: string;
  folderIds: string[];
  visibleWidgets: string[];
}
