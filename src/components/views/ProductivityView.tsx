import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  Target,
  Timer,
  Plus,
  Trash2,
  Edit2,
  Pin,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Calendar,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { useProductivityStore } from '@/store/useProductivityStore';
import { Task, TaskPriority, Note, ClientContextTemplate, PomodoroMode } from '@/types/productivity';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import confetti from 'canvas-confetti';

export const ProductivityView: React.FC = () => {
  const {
    tasks,
    notes,
    dailyFocus,
    clientContexts,
    pomodoroMode,
    pomodoroTimeLeft,
    pomodoroIsRunning,
    pomodoroSessionsCompleted,
    pomodoroSettings,
    addTask,
    updateTask,
    toggleTask,
    deleteTask,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    setDailyObjective,
    toggleDailyTask,
    startPomodoro,
    pausePomodoro,
    resetPomodoro,
    tickPomodoro,
    setPomodoroMode,
    updatePomodoroSettings,
    addClientContext,
    deleteClientContext,
  } = useProductivityStore();

  const [activeTab, setActiveTab] = useState<'tasks' | 'notes' | 'focus' | 'timer' | 'client-context'>('tasks');
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  // New task modal
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('medium');
  const [taskDueDate, setTaskDueDate] = useState('');

  // New note modal
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  // New client context modal
  const [ctxModalOpen, setCtxModalOpen] = useState(false);
  const [ctxClientName, setCtxClientName] = useState('');
  const [ctxProject, setCtxProject] = useState('');
  const [ctxReqs, setCtxReqs] = useState('');
  const [ctxBudget, setCtxBudget] = useState('');
  const [ctxDeadline, setCtxDeadline] = useState('');
  const [ctxStatus, setCtxStatus] = useState<ClientContextTemplate['status']>('In Discussion');
  const [ctxLastComms, setCtxLastComms] = useState('');
  const [ctxNextAction, setCtxNextAction] = useState('');

  // Pomodoro interval loop
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (pomodoroIsRunning) {
      timer = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [pomodoroIsRunning, tickPomodoro]);

  // Handle task toggles
  const handleToggle = (id: string, wasCompleted: boolean) => {
    toggleTask(id);
    if (!wasCompleted) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#EF233C', '#1EA7FF', '#18D879', '#FFB21A'],
      });
    }
  };

  const handleSaveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    if (editingTask) {
      await updateTask(editingTask.id, {
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        dueDate: taskDueDate.trim() || undefined,
      });
    } else {
      await addTask({
        title: taskTitle.trim(),
        description: taskDesc.trim() || undefined,
        priority: taskPriority,
        dueDate: taskDueDate.trim() || undefined,
        completed: false,
      });
    }
    setTaskModalOpen(false);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    if (editingNote) {
      await updateNote(editingNote.id, {
        title: noteTitle.trim(),
        content: noteContent.trim(),
      });
    } else {
      await addNote({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        pinned: false,
      });
    }
    setNoteModalOpen(false);
  };

  const handleSaveContext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ctxClientName.trim() || !ctxProject.trim()) return;

    await addClientContext({
      clientName: ctxClientName.trim(),
      project: ctxProject.trim(),
      requirements: ctxReqs.trim(),
      budget: ctxBudget.trim(),
      deadline: ctxDeadline.trim(),
      status: ctxStatus,
      lastCommunication: ctxLastComms.trim(),
      nextAction: ctxNextAction.trim(),
    });
    setCtxModalOpen(false);
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (taskFilter === 'pending') return !t.completed;
    if (taskFilter === 'completed') return t.completed;
    if (taskFilter === 'high') return t.priority === 'urgent' || t.priority === 'high';
    return true;
  });

  // Pomodoro formatted time
  const pomoMinutes = Math.floor(pomodoroTimeLeft / 60)
    .toString()
    .padStart(2, '0');
  const pomoSeconds = (pomodoroTimeLeft % 60).toString().padStart(2, '0');

  return (
    <div className="space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h2 className="font-heading font-bold text-2xl text-text-primary tracking-tight">
            Productivity Center
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            Focus sessions, markdown notes, task checklists, and client context records.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {[
            { id: 'tasks', label: 'Tasks', icon: CheckSquare },
            { id: 'notes', label: 'Quick Notes', icon: FileText },
            { id: 'focus', label: 'Daily Focus', icon: Target },
            { id: 'timer', label: 'Pomodoro Timer', icon: Timer },
            { id: 'client-context', label: 'Client Briefs', icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm-card text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-sm'
                    : 'bg-surface-secondary text-text-secondary hover:text-text-primary border border-border'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: TASKS */}
      {/* ========================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              {['all', 'pending', 'completed', 'high'].map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f as any)}
                  className={`px-3 py-1 rounded-pill text-xs font-medium capitalize transition-all ${
                    taskFilter === f
                      ? 'bg-surface-hover text-text-primary border border-primary'
                      : 'bg-surface-secondary text-text-muted hover:text-text-primary border border-border'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setTaskTitle('');
                setTaskDesc('');
                setTaskPriority('medium');
                setTaskDueDate('');
                setTaskModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </Button>
          </div>

          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const priorityColors: Record<TaskPriority, string> = {
                urgent: 'bg-red-500/15 text-red-400 border-red-500/30',
                high: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                medium: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
                low: 'bg-surface-secondary text-text-muted border-border',
              };

              return (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 rounded-card border transition-all ${
                    task.completed
                      ? 'bg-surface/50 border-border/60 opacity-60'
                      : 'bg-surface border-border hover:border-border-hover shadow-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggle(task.id, task.completed)}
                      className={`w-5 h-5 rounded flex items-center justify-center border transition-all shrink-0 ${
                        task.completed
                          ? 'bg-primary border-primary text-white'
                          : 'border-border/80 hover:border-primary bg-surface-secondary'
                      }`}
                    >
                      {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-medium transition-all ${
                            task.completed ? 'line-through text-text-muted' : 'text-text-primary'
                          }`}
                        >
                          {task.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                            priorityColors[task.priority]
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-xs text-text-secondary mt-0.5 truncate">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {task.dueDate && (
                      <span className="text-[11px] font-mono text-text-muted flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{task.dueDate}</span>
                      </span>
                    )}
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1 rounded text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="py-12 text-center text-xs text-text-muted">
                No tasks in this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: NOTES */}
      {/* ========================================================= */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              {notes.length} saved markdown notes & technical snippets
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingNote(null);
                setNoteTitle('');
                setNoteContent('');
                setNoteModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" />
              <span>New Note</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => {
              const isCopied = copiedNoteId === note.id;

              return (
                <div
                  key={note.id}
                  className={`bg-surface/90 border rounded-card p-4 shadow-card flex flex-col justify-between transition-colors ${
                    note.pinned ? 'border-primary/50' : 'border-border hover:border-border-hover'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-heading font-semibold text-sm text-text-primary line-clamp-1">
                        {note.title}
                      </h4>
                      <button
                        onClick={() => togglePinNote(note.id)}
                        className={`p-1 rounded hover:bg-surface-secondary ${
                          note.pinned ? 'text-primary' : 'text-text-muted hover:text-text-primary'
                        }`}
                        title={note.pinned ? 'Unpin' : 'Pin'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-text-secondary whitespace-pre-wrap font-mono line-clamp-6 leading-relaxed mb-3">
                      {note.content}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-text-muted">
                    <span>
                      {new Date(note.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${note.title}\n\n${note.content}`);
                          setCopiedNoteId(note.id);
                          setTimeout(() => setCopiedNoteId(null), 2000);
                        }}
                        className="p-1 rounded hover:text-text-primary hover:bg-surface-secondary"
                        title="Copy note"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setNoteTitle(note.title);
                          setNoteContent(note.content);
                          setNoteModalOpen(true);
                        }}
                        className="p-1 rounded hover:text-text-primary hover:bg-surface-secondary"
                        title="Edit note"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1 rounded hover:text-red-400 hover:bg-red-500/10"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: DAILY FOCUS */}
      {/* ========================================================= */}
      {activeTab === 'focus' && (
        <div className="max-w-2xl mx-auto bg-surface/90 border border-border rounded-card p-6 shadow-card space-y-6">
          <div>
            <h3 className="font-heading font-bold text-xl text-text-primary mb-1">
              Daily Focus Objective
            </h3>
            <p className="text-xs text-text-secondary">
              Set one core outcome that defines a winning day.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono text-text-muted mb-1.5">
              PRIMARY MISSION FOR TODAY
            </label>
            <div className="flex gap-2">
              <Input
                value={dailyFocus.objective}
                onChange={(e) => setDailyObjective(e.target.value)}
                placeholder="What is your most important achievement today?"
                className="font-medium text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-text-muted mb-2">
              TOP 3 FOCUS TASKS
            </label>
            <div className="space-y-2">
              {tasks.slice(0, 5).map((t) => {
                const isTop = dailyFocus.topTaskIds.includes(t.id);
                return (
                  <div
                    key={t.id}
                    onClick={() => toggleDailyTask(t.id)}
                    className={`flex items-center justify-between p-3 rounded-card border cursor-pointer transition-all ${
                      isTop
                        ? 'bg-primary/10 border-primary text-text-primary font-medium'
                        : 'bg-surface-secondary/50 border-border/80 text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isTop ? 'bg-primary border-primary text-white' : 'border-border'
                        }`}
                      >
                        {isTop && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-xs">{t.title}</span>
                    </div>
                    <span className="text-[10px] font-mono text-text-muted">
                      {isTop ? 'Starred' : 'Select'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: POMODORO TIMER */}
      {/* ========================================================= */}
      {activeTab === 'timer' && (
        <div className="max-w-md mx-auto bg-surface/90 border border-border rounded-card p-6 shadow-card flex flex-col items-center text-center space-y-6">
          {/* Mode Selector */}
          <div className="flex items-center gap-2 p-1 bg-surface-secondary rounded-pill border border-border">
            {[
              { id: 'work', label: 'Deep Focus' },
              { id: 'shortBreak', label: 'Short Break' },
              { id: 'longBreak', label: 'Long Break' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setPomodoroMode(m.id as PomodoroMode)}
                className={`px-3 py-1.5 rounded-pill text-xs font-medium transition-all ${
                  pomodoroMode === m.id
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Large Clock Display */}
          <div className="w-56 h-56 rounded-full border-4 border-primary/20 flex flex-col items-center justify-center bg-surface-secondary/40 shadow-glow-primary relative">
            <span className="font-heading font-bold text-5xl text-text-primary tracking-tight">
              {pomoMinutes}:{pomoSeconds}
            </span>
            <span className="text-xs font-mono uppercase text-primary mt-1 font-semibold tracking-wider">
              {pomodoroMode === 'work' ? 'Focus Session' : 'Rest Break'}
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant={pomodoroIsRunning ? 'danger' : 'primary'}
              size="lg"
              onClick={pomodoroIsRunning ? pausePomodoro : startPomodoro}
              className="px-8"
            >
              {pomodoroIsRunning ? (
                <>
                  <Pause className="w-5 h-5 mr-1" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-1" />
                  <span>Start Focus</span>
                </>
              )}
            </Button>

            <Button variant="secondary" size="icon" onClick={resetPomodoro} title="Reset Timer">
              <RotateCcw className="w-4 h-4 text-text-muted" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={() =>
                updatePomodoroSettings({ soundEnabled: !pomodoroSettings.soundEnabled })
              }
              title={pomodoroSettings.soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
            >
              {pomodoroSettings.soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-text-muted" />
              )}
            </Button>
          </div>

          <div className="text-xs font-mono text-text-muted">
            Completed Sessions Today: <span className="text-primary font-bold">{pomodoroSessionsCompleted}</span>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: CLIENT BRIEF CONTEXTS */}
      {/* ========================================================= */}
      {activeTab === 'client-context' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Structured client conversation notes for immediate project kickoff.
            </span>
            <Button variant="primary" size="sm" onClick={() => setCtxModalOpen(true)}>
              <Plus className="w-4 h-4" />
              <span>New Client Brief</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientContexts.map((ctx) => (
              <div
                key={ctx.id}
                className="bg-surface/90 border border-border rounded-card p-5 shadow-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-heading font-bold text-base text-text-primary">
                      {ctx.clientName}
                    </h4>
                    <span className="text-xs text-primary font-medium">{ctx.project}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
                    {ctx.status}
                  </span>
                </div>

                <div className="text-xs text-text-secondary space-y-1.5">
                  <div>
                    <span className="font-mono text-text-muted font-bold">Requirements: </span>
                    <span>{ctx.requirements}</span>
                  </div>
                  <div className="flex gap-4">
                    <div>
                      <span className="font-mono text-text-muted font-bold">Budget: </span>
                      <span className="text-emerald-400 font-mono font-medium">{ctx.budget}</span>
                    </div>
                    <div>
                      <span className="font-mono text-text-muted font-bold">Deadline: </span>
                      <span className="font-mono">{ctx.deadline}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-mono text-text-muted font-bold">Next Action: </span>
                    <span className="text-accent-engineering font-medium">{ctx.nextAction}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      const text = `Client: ${ctx.clientName}\nProject: ${ctx.project}\nBudget: ${ctx.budget}\nDeadline: ${ctx.deadline}\nStatus: ${ctx.status}\nNext Action: ${ctx.nextAction}`;
                      navigator.clipboard.writeText(text);
                      alert('Client context copied to clipboard!');
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Summary</span>
                  </Button>
                  <button
                    onClick={() => deleteClientContext(ctx.id)}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {taskModalOpen && (
        <Modal
          isOpen={taskModalOpen}
          onClose={() => setTaskModalOpen(false)}
          title={editingTask ? 'Edit Task' : 'New Task'}
          maxWidth="sm"
        >
          <form onSubmit={handleSaveTask} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Task Title
              </label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Review client proposal"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Description (Optional)
              </label>
              <Input
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Details or checklist notes"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Priority
                </label>
                <select
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
                  className="w-full bg-surface border border-border text-text-primary text-sm rounded-sm-card px-3 py-2"
                >
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Due Date
                </label>
                <Input
                  type="date"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Task
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Note Modal */}
      {noteModalOpen && (
        <Modal
          isOpen={noteModalOpen}
          onClose={() => setNoteModalOpen(false)}
          title={editingNote ? 'Edit Note' : 'New Quick Note'}
          maxWidth="md"
        >
          <form onSubmit={handleSaveNote} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Note Title
              </label>
              <Input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. LLM Prompt Architecture"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Content (Markdown supported)
              </label>
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={8}
                className="w-full bg-surface-secondary text-text-primary font-mono text-xs rounded-card p-3 border border-border focus:outline-none focus:border-primary resize-none leading-relaxed"
                placeholder="# Notes\n- bullet point 1\n- bullet point 2"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setNoteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Note
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Client Context Modal */}
      {ctxModalOpen && (
        <Modal
          isOpen={ctxModalOpen}
          onClose={() => setCtxModalOpen(false)}
          title="New Client Conversation Context"
          maxWidth="md"
        >
          <form onSubmit={handleSaveContext} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Client Name
                </label>
                <Input
                  value={ctxClientName}
                  onChange={(e) => setCtxClientName(e.target.value)}
                  placeholder="e.g. Apex Media Group"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Project
                </label>
                <Input
                  value={ctxProject}
                  onChange={(e) => setCtxProject(e.target.value)}
                  placeholder="e.g. AI Video Pipeline"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Requirements
              </label>
              <Input
                value={ctxReqs}
                onChange={(e) => setCtxReqs(e.target.value)}
                placeholder="Key deliverables and client expectations"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Budget</label>
                <Input
                  value={ctxBudget}
                  onChange={(e) => setCtxBudget(e.target.value)}
                  placeholder="$1,200"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Deadline
                </label>
                <Input
                  value={ctxDeadline}
                  onChange={(e) => setCtxDeadline(e.target.value)}
                  placeholder="Dec 15, 2025"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">Status</label>
                <select
                  value={ctxStatus}
                  onChange={(e) => setCtxStatus(e.target.value as any)}
                  className="w-full bg-surface border border-border text-text-primary text-xs rounded-sm-card px-2 py-2"
                >
                  <option value="In Discussion">In Discussion</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Revision">Revision</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Next Action
              </label>
              <Input
                value={ctxNextAction}
                onChange={(e) => setCtxNextAction(e.target.value)}
                placeholder="e.g. Schedule staging review call"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => setCtxModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Client Brief
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
