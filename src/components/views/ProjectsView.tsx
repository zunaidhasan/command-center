import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  ExternalLink,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  Edit2,
  Trash2,
  Server,
} from 'lucide-react';
import { GithubIcon } from '@/components/common/BrandIcons';
import { useProjectStore } from '@/store/useProjectStore';
import { Project, ProjectStatus, ProjectEnvironment } from '@/types/project';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    checkProjectHealth,
    checkAllProjectsHealth,
    checkingHealthId,
  } = useProjectStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterEnv, setFilterEnv] = useState<string>('all');

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [deployUrl, setDeployUrl] = useState('');
  const [stagingUrl, setStagingUrl] = useState('');
  const [environment, setEnvironment] = useState<ProjectEnvironment>('production');
  const [status, setStatus] = useState<ProjectStatus>('operational');
  const [techStack, setTechStack] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingProject(null);
    setName('');
    setDescription('');
    setRepoUrl('');
    setDeployUrl('');
    setStagingUrl('');
    setEnvironment('production');
    setStatus('operational');
    setTechStack('');
    setNotes('');
    setModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setDescription(p.description);
    setRepoUrl(p.repositoryUrl || '');
    setDeployUrl(p.deploymentUrl || '');
    setStagingUrl(p.stagingUrl || '');
    setEnvironment(p.environment);
    setStatus(p.status);
    setTechStack(p.techStack?.join(', ') || '');
    setNotes(p.notes || '');
    setModalOpen(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const stackArray = techStack
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingProject) {
      await updateProject(editingProject.id, {
        name: name.trim(),
        description: description.trim(),
        repositoryUrl: repoUrl.trim() || undefined,
        deploymentUrl: deployUrl.trim() || undefined,
        stagingUrl: stagingUrl.trim() || undefined,
        environment,
        status,
        techStack: stackArray,
        notes: notes.trim() || undefined,
      });
    } else {
      await addProject({
        name: name.trim(),
        description: description.trim(),
        repositoryUrl: repoUrl.trim() || undefined,
        deploymentUrl: deployUrl.trim() || undefined,
        stagingUrl: stagingUrl.trim() || undefined,
        environment,
        status,
        techStack: stackArray,
        notes: notes.trim() || undefined,
      });
    }

    setModalOpen(false);
  };

  const filteredProjects = projects.filter(
    (p) => filterEnv === 'all' || p.environment === filterEnv
  );

  const getStatusBadge = (st: ProjectStatus) => {
    switch (st) {
      case 'operational':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Operational
          </span>
        );
      case 'building':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            Building
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-red-500/15 text-red-400 border border-red-500/30">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            Degraded
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono bg-surface-secondary text-text-muted border border-border">
            Unknown
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
            Projects & Deployments
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Monitor live web apps, agent backends, and deployment health checks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => checkAllProjectsHealth()}>
            <RefreshCw className="w-3.5 h-3.5 text-accent-engineering" />
            <span>Health Check All</span>
          </Button>
          <Button variant="primary" size="sm" onClick={openAddModal}>
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {['all', 'production', 'staging', 'development'].map((env) => (
          <button
            key={env}
            onClick={() => setFilterEnv(env)}
            className={`px-3 py-1.5 rounded-pill text-xs font-medium capitalize transition-all ${
              filterEnv === env
                ? 'bg-primary text-white shadow-sm'
                : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
            }`}
          >
            {env}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
        {filteredProjects.map((project) => {
          const isChecking = checkingHealthId === project.id;

          return (
            <div
              key={project.id}
              className="bg-surface/90 border border-border hover:border-border-hover rounded-card p-5 shadow-card transition-all flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-lg text-text-primary">
                        {project.name}
                      </h3>
                      <span className="text-[10px] font-mono uppercase bg-surface-secondary text-text-muted px-2 py-0.5 rounded border border-border">
                        {project.environment}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                      {project.description}
                    </p>
                  </div>
                  <div>{getStatusBadge(project.status)}</div>
                </div>

                {/* Tech Stack Chips */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {project.techStack.map((tech, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono bg-surface-secondary text-text-secondary px-2 py-0.5 rounded border border-border/80"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {project.notes && (
                  <div className="p-2.5 rounded-sm-card bg-surface-darker/60 border border-border/50 text-[11px] font-mono text-text-muted my-2">
                    {project.notes}
                  </div>
                )}
              </div>

              {/* Bottom Actions & URLs */}
              <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-2 mt-2">
                <div className="flex items-center gap-2">
                  {project.deploymentUrl && (
                    <a
                      href={project.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary-light text-xs font-medium border border-primary/20 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Live Site</span>
                    </a>
                  )}

                  {project.repositoryUrl && (
                    <a
                      href={project.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-secondary hover:bg-surface text-text-secondary hover:text-text-primary text-xs font-medium border border-border transition-colors"
                    >
                      <GithubIcon className="w-3.5 h-3.5" />
                      <span>Repo</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {project.deploymentUrl && (
                    <button
                      onClick={() => checkProjectHealth(project.id)}
                      disabled={isChecking}
                      title="Run live ping health check"
                      className="p-1.5 rounded text-text-muted hover:text-emerald-400 hover:bg-surface-secondary transition-colors"
                    >
                      <Activity
                        className={`w-4 h-4 ${isChecking ? 'animate-spin text-emerald-400' : ''}`}
                      />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(project)}
                    title="Edit project"
                    className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete project "${project.name}"?`)) {
                        deleteProject(project.id);
                      }
                    }}
                    title="Delete project"
                    className="p-1.5 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Project Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingProject ? 'Edit Project' : 'Create New Project'}
          description="Register a production, staging, or experimental service."
          maxWidth="md"
        >
          <form onSubmit={handleSaveProject} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Project Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. DeshVox"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Description
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. AI voice intelligence and telephony platform"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Deployment URL
                </label>
                <Input
                  value={deployUrl}
                  onChange={(e) => setDeployUrl(e.target.value)}
                  placeholder="https://deshvox.ai"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Repository URL
                </label>
                <Input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Environment
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as ProjectEnvironment)}
                  className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="production">Production</option>
                  <option value="staging">Staging</option>
                  <option value="development">Development</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2 focus:outline-none focus:border-primary"
                >
                  <option value="operational">Operational</option>
                  <option value="building">Building</option>
                  <option value="degraded">Degraded</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Tech Stack (Comma-separated)
              </label>
              <Input
                value={techStack}
                onChange={(e) => setTechStack(e.target.value)}
                placeholder="Next.js, WebSockets, Python, Tailwind"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Operational Notes
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Telephony gateway running smoothly."
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingProject ? 'Save Changes' : 'Create Project'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
