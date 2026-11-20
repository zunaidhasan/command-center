import React, { useState } from 'react';
import { Plus, Check, Trash2, Copy, FileText, CheckSquare } from 'lucide-react';
import { useProductivityStore } from '@/store/useProductivityStore';
import { useUIStore } from '@/store/useUIStore';
import confetti from 'canvas-confetti';

export const MiniTodoWidget: React.FC = () => {
  const { tasks, notes, toggleTask, addTask, deleteTask, addNote, deleteNote } = useProductivityStore();
  const { setActiveView } = useUIStore();
  const [activeTab, setActiveTab] = useState<'tasks' | 'notes'>('tasks');
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);

  const handleToggleTask = (id: string, wasCompleted: boolean) => {
    toggleTask(id);
    if (!wasCompleted) {
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { y: 0.8 },
        colors: ['#EF233C', '#1EA7FF', '#18D879', '#FFB21A'],
      });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    if (activeTab === 'tasks') {
      await addTask({
        title: newTitle.trim(),
        priority: 'medium',
        completed: false,
      });
    } else {
      await addNote({
        title: newTitle.trim(),
        content: newTitle.trim(),
        tags: ['QuickNote'],
        pinned: false,
      });
    }

    setNewTitle('');
    setIsAdding(false);
  };

  const handleCopyNote = (id: string, content: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(content);
    setCopiedNoteId(id);
    setTimeout(() => setCopiedNoteId(null), 2000);
  };

  const displayTasks = tasks.slice(0, 4);
  const displayNotes = notes.slice(0, 3);

  return (
    <div className="bg-surface/80 rounded-card border border-border/80 p-3.5 flex flex-col justify-between h-full shadow-subtle select-none">
      {/* Header with Tab switcher */}
      <div className="flex items-center justify-between pb-2 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTab === 'tasks' ? 'text-primary' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Tasks</span>
            <span className="text-[10px] font-mono px-1 rounded bg-surface-secondary text-text-muted">
              {tasks.filter((t) => !t.completed).length}
            </span>
          </button>
          <span className="text-text-muted">/</span>
          <button
            onClick={() => setActiveTab('notes')}
            className={`text-xs font-semibold flex items-center gap-1 transition-colors ${
              activeTab === 'notes' ? 'text-amber-400' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Notes</span>
            <span className="text-[10px] font-mono px-1 rounded bg-surface-secondary text-text-muted">
              {notes.length}
            </span>
          </button>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          title={`Add ${activeTab === 'tasks' ? 'Task' : 'Note'}`}
          className="p-1 rounded bg-surface-secondary hover:bg-surface text-text-muted hover:text-text-primary transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Input if adding */}
      {isAdding && (
        <form onSubmit={handleCreate} className="mt-2">
          <input
            type="text"
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder={
              activeTab === 'tasks'
                ? 'Type task & press Enter...'
                : 'Type quick note & press Enter...'
            }
            className="w-full bg-surface-secondary text-xs text-text-primary rounded px-2.5 py-1.5 border border-border focus:outline-none focus:border-primary placeholder:text-text-muted"
          />
        </form>
      )}

      {/* Content list */}
      <div className="space-y-1.5 mt-2 flex-1 overflow-y-auto max-h-36">
        {activeTab === 'tasks' ? (
          displayTasks.length > 0 ? (
            displayTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleToggleTask(task.id, task.completed)}
                className="flex items-center justify-between gap-2 group cursor-pointer p-1 rounded hover:bg-surface-secondary/50 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  {/* Custom Checkbox */}
                  <div
                    className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 transition-all ${
                      task.completed
                        ? 'bg-primary border-primary text-white'
                        : 'border-border/80 group-hover:border-text-secondary bg-surface-secondary'
                    }`}
                  >
                    {task.completed && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>

                  {/* Title */}
                  <span
                    className={`text-xs truncate transition-all ${
                      task.completed
                        ? 'line-through text-text-muted'
                        : 'text-text-secondary group-hover:text-text-primary'
                    }`}
                  >
                    {task.title}
                  </span>
                </div>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTask(task.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 transition-opacity"
                  title="Delete task"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-xs text-text-muted">All tasks done! 🎉</div>
          )
        ) : (
          displayNotes.length > 0 ? (
            displayNotes.map((note) => (
              <div
                key={note.id}
                className="p-1.5 rounded bg-surface-secondary/40 hover:bg-surface-secondary/80 border border-border/50 text-xs flex items-center justify-between group transition-colors"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-medium text-text-primary truncate">{note.title}</div>
                  <div className="text-[10px] text-text-secondary truncate mt-0.5">{note.content}</div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={(e) => handleCopyNote(note.id, note.content, e)}
                    className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                    title="Copy note content"
                  >
                    {copiedNoteId === note.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNote(note.id);
                    }}
                    className="p-1 text-text-secondary hover:text-red-400 transition-colors"
                    title="Delete note"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-3 text-xs text-text-muted">No notes saved.</div>
          )
        )}
      </div>

      {/* View all footer */}
      <button
        onClick={() => setActiveView('productivity')}
        className="text-[10px] text-text-muted hover:text-primary transition-colors text-right mt-1 pt-1 border-t border-border/30"
      >
        View full productivity suite →
      </button>
    </div>
  );
};
