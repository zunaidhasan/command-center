import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '@/store/useThemeStore';
import { useProfileStore } from '@/store/useProfileStore';
import { useProjectStore } from '@/store/useProjectStore';
import { useProductivityStore } from '@/store/useProductivityStore';
import { INITIAL_THEME, INITIAL_PROFILE, INITIAL_PROJECTS, INITIAL_TASKS } from '@/services/initial-data';

describe('Theme Engine', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: INITIAL_THEME, isLoading: false });
  });

  it('switches between presets and updates document attribute', async () => {
    const { setPreset } = useThemeStore.getState();
    await setPreset('cyber');
    expect(useThemeStore.getState().theme.preset).toBe('cyber');
    expect(useThemeStore.getState().theme.accentColor).toBe('#00F0FF');
    expect(document.documentElement.getAttribute('data-theme')).toBe('cyber');

    await setPreset('crimson');
    expect(useThemeStore.getState().theme.preset).toBe('crimson');
    expect(document.documentElement.getAttribute('data-theme')).toBe('crimson');
  });

  it('sets custom accent color', async () => {
    const { setAccentColor } = useThemeStore.getState();
    await setAccentColor('#FF0077');
    expect(useThemeStore.getState().theme.accentColor).toBe('#FF0077');
    expect(document.documentElement.style.getPropertyValue('--accent-primary')).toBe('#FF0077');
  });
});

describe('User Profile System', () => {
  beforeEach(() => {
    useProfileStore.setState({ profile: INITIAL_PROFILE, isLoading: false });
  });

  it('initializes with Zunaid Ishan identity', () => {
    const { profile } = useProfileStore.getState();
    expect(profile.displayName).toBe('Zunaid Ishan');
    expect(profile.username).toBe('@zunaidhasan');
    expect(profile.brand).toBe('ZH Labs');
    expect(profile.tagline).toBe('Build. Automate. Grow.');
  });

  it('updates profile and social links', async () => {
    const { updateProfile } = useProfileStore.getState();
    await updateProfile({
      bio: 'Architecting next-gen agentic systems',
      socialLinks: {
        github: 'https://github.com/zunaidhasan',
        linkedin: 'https://linkedin.com/in/zunaid-ishan/',
      },
    });

    const updated = useProfileStore.getState().profile;
    expect(updated.bio).toBe('Architecting next-gen agentic systems');
    expect(updated.socialLinks.github).toBe('https://github.com/zunaidhasan');
  });
});

describe('Projects Engine', () => {
  beforeEach(() => {
    useProjectStore.setState({ projects: INITIAL_PROJECTS, isLoading: false });
  });

  it('preserves all four core initial projects', () => {
    const { projects } = useProjectStore.getState();
    expect(projects).toHaveLength(4);
    expect(projects.some((p) => p.name === 'DeshVox')).toBe(true);
    expect(projects.some((p) => p.name === 'EchoNote')).toBe(true);
    expect(projects.some((p) => p.name === 'ZHcode')).toBe(true);
    expect(projects.some((p) => p.name === 'KodeCupid')).toBe(true);
  });

  it('creates and deletes projects', async () => {
    const { addProject, deleteProject } = useProjectStore.getState();
    const created = await addProject({
      name: 'AgentStudio',
      description: 'Autonomous workflow orchestrator',
      environment: 'development',
      status: 'building',
    });

    expect(created.id).toBeDefined();
    expect(useProjectStore.getState().projects.some((p) => p.id === created.id)).toBe(true);

    await deleteProject(created.id);
    expect(useProjectStore.getState().projects.some((p) => p.id === created.id)).toBe(false);
  });
});

describe('Productivity Center', () => {
  beforeEach(() => {
    useProductivityStore.setState({
      tasks: INITIAL_TASKS,
      notes: [],
      dailyFocus: {
        objective: 'Test Objective',
        topTaskIds: [],
        updatedAt: Date.now(),
      },
      pomodoroMode: 'work',
      pomodoroTimeLeft: 25 * 60,
      pomodoroIsRunning: false,
      pomodoroSessionsCompleted: 0,
      isLoading: false,
    });
  });

  it('toggles task completion status', async () => {
    const { tasks, toggleTask } = useProductivityStore.getState();
    const target = tasks[0];
    const initialCompleted = target.completed;

    await toggleTask(target.id);
    const updated = useProductivityStore.getState().tasks.find((t) => t.id === target.id);
    expect(updated?.completed).toBe(!initialCompleted);
  });

  it('pomodoro timer transitions correctly', () => {
    const { startPomodoro, pausePomodoro, setPomodoroMode } = useProductivityStore.getState();
    startPomodoro();
    expect(useProductivityStore.getState().pomodoroIsRunning).toBe(true);

    pausePomodoro();
    expect(useProductivityStore.getState().pomodoroIsRunning).toBe(false);

    setPomodoroMode('shortBreak');
    expect(useProductivityStore.getState().pomodoroMode).toBe('shortBreak');
    expect(useProductivityStore.getState().pomodoroTimeLeft).toBe(5 * 60);
  });
});
