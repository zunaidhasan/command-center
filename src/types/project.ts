export type ProjectStatus = 'operational' | 'building' | 'degraded' | 'unknown';
export type ProjectEnvironment = 'production' | 'staging' | 'development';

export interface Project {
  id: string;
  name: string;
  description: string;
  repositoryUrl?: string;
  deploymentUrl?: string;
  stagingUrl?: string;
  environment: ProjectEnvironment;
  status: ProjectStatus;
  notes?: string;
  techStack?: string[];
  lastChecked?: number;
  healthCheckedAt?: number;
  httpStatus?: number;
  createdAt: number;
}
