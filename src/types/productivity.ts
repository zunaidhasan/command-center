export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  completed: boolean;
  category?: 'dev' | 'client' | 'design' | 'personal';
  createdAt: number;
  completedAt?: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  pinned: boolean;
  tags?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface DailyFocus {
  objective: string;
  topTaskIds: string[];
  updatedAt: number;
}

export type PomodoroMode = 'work' | 'shortBreak' | 'longBreak';

export interface PomodoroSettings {
  workDurationMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  longBreakInterval: number;
  soundEnabled: boolean;
}

export interface ClientContextTemplate {
  id: string;
  clientName: string;
  project: string;
  requirements: string;
  budget: string;
  deadline: string;
  status: 'In Discussion' | 'Proposal Sent' | 'In Progress' | 'Revision' | 'Completed';
  lastCommunication: string;
  nextAction: string;
  updatedAt: number;
}
