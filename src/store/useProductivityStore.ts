import { create } from 'zustand';
import { Task, Note, DailyFocus, PomodoroMode, PomodoroSettings, ClientContextTemplate, TaskPriority } from '@/types/productivity';
import { INITIAL_TASKS, INITIAL_NOTES, INITIAL_CLIENT_CONTEXTS } from '@/services/initial-data';
import { getDatabase } from '@/db/idb';
import { StorageAdapter } from '@/services/storage';

interface ProductivityState {
  tasks: Task[];
  notes: Note[];
  dailyFocus: DailyFocus;
  clientContexts: ClientContextTemplate[];
  
  // Pomodoro
  pomodoroMode: PomodoroMode;
  pomodoroTimeLeft: number;
  pomodoroIsRunning: boolean;
  pomodoroSessionsCompleted: number;
  pomodoroSettings: PomodoroSettings;

  isLoading: boolean;

  // Actions
  initProductivity: () => Promise<void>;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;

  // Notes
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Note>;
  updateNote: (id: string, updates: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  togglePinNote: (id: string) => Promise<void>;

  // Daily Focus
  setDailyObjective: (objective: string) => Promise<void>;
  toggleDailyTask: (taskId: string) => Promise<void>;

  // Client Context
  addClientContext: (ctx: Omit<ClientContextTemplate, 'id' | 'updatedAt'>) => Promise<ClientContextTemplate>;
  updateClientContext: (id: string, updates: Partial<ClientContextTemplate>) => Promise<void>;
  deleteClientContext: (id: string) => Promise<void>;

  // Pomodoro Timer Actions
  startPomodoro: () => void;
  pausePomodoro: () => void;
  resetPomodoro: () => void;
  tickPomodoro: () => void;
  setPomodoroMode: (mode: PomodoroMode) => void;
  updatePomodoroSettings: (settings: Partial<PomodoroSettings>) => Promise<void>;
}

const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDurationMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  longBreakInterval: 4,
  soundEnabled: true,
};

function playAudioChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (err) {
    // Audio might be blocked by browser autoplay policy until user gesture
  }
}

export const useProductivityStore = create<ProductivityState>((set, get) => ({
  tasks: [],
  notes: [],
  dailyFocus: {
    objective: 'Finalize DeshVox real-time audio gateway & deliver Sardar IT proposal',
    topTaskIds: ['task-1', 'task-3'],
    updatedAt: Date.now(),
  },
  clientContexts: [],

  pomodoroMode: 'work',
  pomodoroTimeLeft: 25 * 60,
  pomodoroIsRunning: false,
  pomodoroSessionsCompleted: 0,
  pomodoroSettings: DEFAULT_POMODORO_SETTINGS,

  isLoading: true,

  initProductivity: async () => {
    try {
      const db = await getDatabase();
      const savedTasks = await db.getAll('tasks');
      const savedNotes = await db.getAll('notes');
      const savedContexts = await db.getAll('clientContexts');
      const savedFocus = await StorageAdapter.get<DailyFocus>('daily_focus', {
        objective: 'Finalize DeshVox real-time audio gateway & deliver Sardar IT proposal',
        topTaskIds: ['task-1', 'task-3'],
        updatedAt: Date.now(),
      });
      const savedPomoSettings = await StorageAdapter.get<PomodoroSettings>('pomodoro_settings', DEFAULT_POMODORO_SETTINGS);

      // Initialize defaults if empty
      if (savedTasks.length === 0) {
        const tx = db.transaction('tasks', 'readwrite');
        for (const t of INITIAL_TASKS) {
          await tx.store.put(t);
        }
        await tx.done;
      }
      if (savedNotes.length === 0) {
        const tx = db.transaction('notes', 'readwrite');
        for (const n of INITIAL_NOTES) {
          await tx.store.put(n);
        }
        await tx.done;
      }
      if (savedContexts.length === 0) {
        const tx = db.transaction('clientContexts', 'readwrite');
        for (const c of INITIAL_CLIENT_CONTEXTS) {
          await tx.store.put(c);
        }
        await tx.done;
      }

      const tasksToUse = savedTasks.length > 0 ? savedTasks : INITIAL_TASKS;
      const notesToUse = savedNotes.length > 0 ? savedNotes : INITIAL_NOTES;
      const contextsToUse = savedContexts.length > 0 ? savedContexts : INITIAL_CLIENT_CONTEXTS;

      set({
        tasks: tasksToUse,
        notes: notesToUse,
        clientContexts: contextsToUse,
        dailyFocus: savedFocus,
        pomodoroSettings: savedPomoSettings,
        pomodoroTimeLeft: savedPomoSettings.workDurationMinutes * 60,
        isLoading: false,
      });
    } catch (err) {
      console.error('[ProductivityStore] Failed to load data from IDB:', err);
      set({
        tasks: INITIAL_TASKS,
        notes: INITIAL_NOTES,
        clientContexts: INITIAL_CLIENT_CONTEXTS,
        isLoading: false,
      });
    }
  },

  addTask: async (taskData) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };

    const updated = [newTask, ...get().tasks];
    set({ tasks: updated });

    try {
      const db = await getDatabase();
      await db.put('tasks', newTask);
    } catch (err) {
      console.error('[ProductivityStore] Failed to save task in IDB:', err);
    }

    return newTask;
  },

  updateTask: async (id, updates) => {
    const updated = get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
    set({ tasks: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('tasks', id);
      if (existing) {
        await db.put('tasks', { ...existing, ...updates });
      }
    } catch (err) {
      console.error('[ProductivityStore] Failed to update task in IDB:', err);
    }
  },

  toggleTask: async (id) => {
    const task = get().tasks.find((t) => t.id === id);
    if (!task) return;
    const completed = !task.completed;
    await get().updateTask(id, {
      completed,
      completedAt: completed ? Date.now() : undefined,
    });
  },

  deleteTask: async (id) => {
    const updated = get().tasks.filter((t) => t.id !== id);
    set({ tasks: updated });

    try {
      const db = await getDatabase();
      await db.delete('tasks', id);
    } catch (err) {
      console.error('[ProductivityStore] Failed to delete task in IDB:', err);
    }
  },

  addNote: async (noteData) => {
    const newNote: Note = {
      ...noteData,
      id: `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updated = [newNote, ...get().notes];
    set({ notes: updated });

    try {
      const db = await getDatabase();
      await db.put('notes', newNote);
    } catch (err) {
      console.error('[ProductivityStore] Failed to save note in IDB:', err);
    }

    return newNote;
  },

  updateNote: async (id, updates) => {
    const updated = get().notes.map((n) =>
      n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
    );
    set({ notes: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('notes', id);
      if (existing) {
        await db.put('notes', { ...existing, ...updates, updatedAt: Date.now() });
      }
    } catch (err) {
      console.error('[ProductivityStore] Failed to update note in IDB:', err);
    }
  },

  deleteNote: async (id) => {
    const updated = get().notes.filter((n) => n.id !== id);
    set({ notes: updated });

    try {
      const db = await getDatabase();
      await db.delete('notes', id);
    } catch (err) {
      console.error('[ProductivityStore] Failed to delete note in IDB:', err);
    }
  },

  togglePinNote: async (id) => {
    const note = get().notes.find((n) => n.id === id);
    if (!note) return;
    await get().updateNote(id, { pinned: !note.pinned });
  },

  setDailyObjective: async (objective) => {
    const updated: DailyFocus = {
      ...get().dailyFocus,
      objective,
      updatedAt: Date.now(),
    };
    set({ dailyFocus: updated });
    await StorageAdapter.set('daily_focus', updated);
  },

  toggleDailyTask: async (taskId) => {
    const current = get().dailyFocus;
    let nextTopIds = [...current.topTaskIds];
    if (nextTopIds.includes(taskId)) {
      nextTopIds = nextTopIds.filter((id) => id !== taskId);
    } else {
      if (nextTopIds.length < 3) {
        nextTopIds.push(taskId);
      } else {
        nextTopIds[2] = taskId; // Replace 3rd
      }
    }
    const updated: DailyFocus = {
      ...current,
      topTaskIds: nextTopIds,
      updatedAt: Date.now(),
    };
    set({ dailyFocus: updated });
    await StorageAdapter.set('daily_focus', updated);
  },

  addClientContext: async (ctxData) => {
    const newCtx: ClientContextTemplate = {
      ...ctxData,
      id: `ctx-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      updatedAt: Date.now(),
    };
    const updated = [newCtx, ...get().clientContexts];
    set({ clientContexts: updated });

    try {
      const db = await getDatabase();
      await db.put('clientContexts', newCtx);
    } catch (err) {
      console.error('[ProductivityStore] Failed to save client context in IDB:', err);
    }
    return newCtx;
  },

  updateClientContext: async (id, updates) => {
    const updated = get().clientContexts.map((c) =>
      c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c
    );
    set({ clientContexts: updated });

    try {
      const db = await getDatabase();
      const existing = await db.get('clientContexts', id);
      if (existing) {
        await db.put('clientContexts', { ...existing, ...updates, updatedAt: Date.now() });
      }
    } catch (err) {
      console.error('[ProductivityStore] Failed to update client context in IDB:', err);
    }
  },

  deleteClientContext: async (id) => {
    const updated = get().clientContexts.filter((c) => c.id !== id);
    set({ clientContexts: updated });

    try {
      const db = await getDatabase();
      await db.delete('clientContexts', id);
    } catch (err) {
      console.error('[ProductivityStore] Failed to delete client context in IDB:', err);
    }
  },

  startPomodoro: () => set({ pomodoroIsRunning: true }),
  pausePomodoro: () => set({ pomodoroIsRunning: false }),
  resetPomodoro: () => {
    const { pomodoroMode, pomodoroSettings } = get();
    const duration =
      pomodoroMode === 'work'
        ? pomodoroSettings.workDurationMinutes
        : pomodoroMode === 'shortBreak'
        ? pomodoroSettings.shortBreakMinutes
        : pomodoroSettings.longBreakMinutes;
    set({ pomodoroTimeLeft: duration * 60, pomodoroIsRunning: false });
  },

  tickPomodoro: () => {
    const { pomodoroTimeLeft, pomodoroMode, pomodoroSettings, pomodoroSessionsCompleted } = get();
    if (pomodoroTimeLeft > 1) {
      set({ pomodoroTimeLeft: pomodoroTimeLeft - 1 });
    } else {
      // Session finished
      if (pomodoroSettings.soundEnabled) {
        playAudioChime();
      }

      if (pomodoroMode === 'work') {
        const nextSessions = pomodoroSessionsCompleted + 1;
        const isLongBreak = nextSessions % pomodoroSettings.longBreakInterval === 0;
        const nextMode: PomodoroMode = isLongBreak ? 'longBreak' : 'shortBreak';
        const nextDuration = isLongBreak ? pomodoroSettings.longBreakMinutes : pomodoroSettings.shortBreakMinutes;

        set({
          pomodoroMode: nextMode,
          pomodoroTimeLeft: nextDuration * 60,
          pomodoroSessionsCompleted: nextSessions,
          pomodoroIsRunning: false,
        });
      } else {
        // Break finished, back to work
        set({
          pomodoroMode: 'work',
          pomodoroTimeLeft: pomodoroSettings.workDurationMinutes * 60,
          pomodoroIsRunning: false,
        });
      }
    }
  },

  setPomodoroMode: (mode) => {
    const { pomodoroSettings } = get();
    const duration =
      mode === 'work'
        ? pomodoroSettings.workDurationMinutes
        : mode === 'shortBreak'
        ? pomodoroSettings.shortBreakMinutes
        : pomodoroSettings.longBreakMinutes;
    set({ pomodoroMode: mode, pomodoroTimeLeft: duration * 60, pomodoroIsRunning: false });
  },

  updatePomodoroSettings: async (settings) => {
    const current = get().pomodoroSettings;
    const updated = { ...current, ...settings };
    set({ pomodoroSettings: updated });
    await StorageAdapter.set('pomodoro_settings', updated);
  },
}));
