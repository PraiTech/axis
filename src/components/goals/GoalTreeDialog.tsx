import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  ListTree,
  CheckSquare,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import type { Goal, GoalTask } from '@/data/mockData';

// Рекурсивная функция расчета прогресса задачи
function taskProgress(task: GoalTask): number {
  if (task.subtasks && task.subtasks.length > 0) {
    const sum = task.subtasks.reduce((a, subtask) => a + taskProgress(subtask), 0);
    return sum / task.subtasks.length;
  }
  const p = task.target > 0 ? (task.current / task.target) * 100 : 0;
  return Math.min(100, p);
}

// Прогресс цели
function goalProgress(g: Goal): number {
  if (g.subtasks && g.subtasks.length > 0) {
    const sum = g.subtasks.reduce((a, s) => a + taskProgress(s), 0);
    return sum / g.subtasks.length;
  }
  const p = g.target > 0 ? (g.current / g.target) * 100 : 0;
  return Math.min(100, p);
}

interface TaskNodeProps {
  task: GoalTask;
  goal: Goal;
  onUpdateGoal: (updated: Goal) => void;
  level: number;
  status: 'in-progress' | 'completed' | 'on-hold';
  onAddSubtask: (taskId: string) => void;
  showAddSubtask: string | null;
  newSubtaskTitle: string;
  newSubtaskTarget: string;
  setNewSubtaskTitle: (value: string) => void;
  setNewSubtaskTarget: (value: string) => void;
  onCancelAdd: () => void;
}

// Рекурсивный компонент для отображения задачи и её подзадач
function TaskNode({
  task,
  goal,
  onUpdateGoal,
  level,
  status,
  onAddSubtask,
  showAddSubtask,
  newSubtaskTitle,
  newSubtaskTarget,
  setNewSubtaskTitle,
  setNewSubtaskTarget,
  onCancelAdd,
}: TaskNodeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const hasChildren = task.subtasks && task.subtasks.length > 0;
  const progress = taskProgress(task);
  const isAddingSubtask = showAddSubtask === task.id;
  
  // Автоматически раскрываем узел при добавлении подзадачи
  useEffect(() => {
    if (isAddingSubtask && collapsed) {
      setCollapsed(false);
    }
  }, [isAddingSubtask, collapsed]);

  const statusClr =
    status === 'completed' ? 'from-emerald-500 to-emerald-600' :
    status === 'on-hold' ? 'from-slate-500 to-slate-600' :
    'from-blue-500 to-blue-600';

  // Иконка зависит от уровня вложенности
  const Icon = level === 0 ? ListTree : hasChildren ? ListTree : CheckSquare;

  // Функция для добавления подзадачи к текущей задаче
  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim() || !newSubtaskTarget) return;
    const t = parseFloat(newSubtaskTarget);
    if (isNaN(t) || t <= 0) return;

    // Рекурсивная функция для обновления задачи в дереве
    const updateTaskInTree = (currentTask: GoalTask): GoalTask => {
      if (currentTask.id === task.id) {
        return {
          ...currentTask,
          subtasks: [
            ...(currentTask.subtasks || []),
            {
              id: `task-${Date.now()}-${Math.random()}`,
              title: newSubtaskTitle.trim(),
              target: t,
              current: 0,
            },
          ],
        };
      }
      return {
        ...currentTask,
        subtasks: currentTask.subtasks?.map(updateTaskInTree),
      };
    };

    const updatedGoal: Goal = {
      ...goal,
      subtasks: goal.subtasks?.map(updateTaskInTree),
    };

    onUpdateGoal(updatedGoal);
    onCancelAdd();
  };

  return (
    <div className="goal-tree-node">
      <div
        className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50/80 transition-colors group"
        style={{ paddingLeft: 12 + level * 24 }}
      >
        <button
          type="button"
          onClick={() => (hasChildren || isAddingSubtask) && setCollapsed((c) => !c)}
          className="flex items-center justify-center w-6 h-6 rounded hover:bg-slate-200/60 text-slate-400"
        >
          {(hasChildren || isAddingSubtask) ? (
            collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
          ) : (
            <span className="w-4" />
          )}
        </button>
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${statusClr} text-white shadow-sm`}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="font-medium text-slate-800 truncate">{task.title}</span>
          <div className="flex-1 min-w-[120px] max-w-[200px]">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${statusClr}`}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-slate-600 tabular-nums w-12 text-right">
            {progress.toFixed(0)}%
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 px-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50"
          onClick={() => onAddSubtask(task.id)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Subtask
        </Button>
      </div>
      <AnimatePresence>
        {(hasChildren || isAddingSubtask) && !collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {task.subtasks?.map((subtask) => (
              <TaskNode
                key={subtask.id}
                task={subtask}
                goal={goal}
                onUpdateGoal={onUpdateGoal}
                level={level + 1}
                status={status}
                onAddSubtask={onAddSubtask}
                showAddSubtask={showAddSubtask}
                newSubtaskTitle={newSubtaskTitle}
                newSubtaskTarget={newSubtaskTarget}
                setNewSubtaskTitle={setNewSubtaskTitle}
                setNewSubtaskTarget={setNewSubtaskTarget}
                onCancelAdd={onCancelAdd}
              />
            ))}
            {isAddingSubtask && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap items-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 ml-12"
                style={{ marginLeft: 12 + (level + 1) * 24 }}
              >
                <Input
                  placeholder="Subtask name"
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="h-9 w-40"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubtask();
                    }
                  }}
                />
                <Input
                  type="number"
                  placeholder="Target"
                  value={newSubtaskTarget}
                  onChange={(e) => setNewSubtaskTarget(e.target.value)}
                  className="h-9 w-24"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleAddSubtask();
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddSubtask}>
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onCancelAdd}
                >
                  Cancel
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GoalTreeDialogProps {
  open: boolean;
  onClose: () => void;
  goal: Goal;
  onUpdateGoal: (updated: Goal) => void;
}

export function GoalTreeDialog({ open, onClose, goal, onUpdateGoal }: GoalTreeDialogProps) {
  const [showAddTask, setShowAddTask] = useState(false); // Для добавления задачи (первый уровень)
  const [showAddSubtask, setShowAddSubtask] = useState<string | null>(null); // Для добавления подзадачи к задаче
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTarget, setNewTaskTarget] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskTarget, setNewSubtaskTarget] = useState('');

  const rootProgress = goalProgress(goal);

  // Добавление задачи к цели (первый уровень)
  const addTaskToGoal = () => {
    if (!newTaskTitle.trim() || !newTaskTarget) return;
    const t = parseFloat(newTaskTarget);
    if (isNaN(t) || t <= 0) return;

    const updatedGoal: Goal = {
      ...goal,
      subtasks: [
        ...(goal.subtasks || []),
        {
          id: `task-${Date.now()}-${Math.random()}`,
          title: newTaskTitle.trim(),
          target: t,
          current: 0,
        },
      ],
    };

    onUpdateGoal(updatedGoal);
    setShowAddTask(false);
    setNewTaskTitle('');
    setNewTaskTarget('');
  };

  const handleCancelAddTask = () => {
    setShowAddTask(false);
    setNewTaskTitle('');
    setNewTaskTarget('');
  };

  const handleCancelAddSubtask = () => {
    setShowAddSubtask(null);
    setNewSubtaskTitle('');
    setNewSubtaskTarget('');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col border-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/20 shadow-xl shadow-slate-200/50 sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_#e0e7ff_0%,_transparent_50%)] pointer-events-none" />
        <DialogHeader className="relative pb-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30">
                <ListTree className="h-6 w-6" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-800">
                  Goal tree
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-0.5">{goal.title}</p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white hover:from-indigo-600 hover:to-indigo-700 shadow-md"
              onClick={() => setShowAddTask(true)}
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Add Task
            </Button>
          </div>
        </DialogHeader>

        <div className="relative flex-1 overflow-y-auto min-h-0 rounded-xl border border-slate-200/80 bg-white/60 p-4 space-y-1">
          {/* Корневая цель */}
          <div className="goal-tree-node">
            <div
              className="flex items-center gap-2 py-2 px-3 rounded-xl hover:bg-slate-50/80 transition-colors group"
              style={{ paddingLeft: 12 }}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${
                  goal.status === 'completed' ? 'from-emerald-500 to-emerald-600' :
                  goal.status === 'on-hold' ? 'from-slate-500 to-slate-600' :
                  'from-indigo-500 to-indigo-600'
                } text-white shadow-sm`}
              >
                <Target className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className="font-medium text-slate-800 truncate">{goal.title}</span>
                <div className="flex-1 min-w-[120px] max-w-[200px]">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full bg-gradient-to-r ${
                        goal.status === 'completed' ? 'from-emerald-500 to-emerald-600' :
                        goal.status === 'on-hold' ? 'from-slate-500 to-slate-600' :
                        'from-indigo-500 to-indigo-600'
                      }`}
                      initial={false}
                      animate={{ width: `${rootProgress}%` }}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-600 tabular-nums w-12 text-right">
                  {rootProgress.toFixed(0)}%
                </span>
              </div>
            </div>
          </div>

          {/* Форма для добавления задачи */}
          {showAddTask && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-wrap items-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200/80 ml-12 mt-2"
              style={{ marginLeft: 12 + 24 }}
            >
              <Input
                placeholder="Task name"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="h-9 w-40"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTaskToGoal();
                  }
                }}
              />
              <Input
                type="number"
                  placeholder="Target"
                value={newTaskTarget}
                onChange={(e) => setNewTaskTarget(e.target.value)}
                className="h-9 w-24"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addTaskToGoal();
                  }
                }}
              />
              <Button size="sm" onClick={addTaskToGoal}>
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancelAddTask}
              >
                Cancel
              </Button>
            </motion.div>
          )}

          {/* Задачи цели (первый уровень) */}
          <AnimatePresence>
            {goal.subtasks && goal.subtasks.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                {goal.subtasks.map((task) => (
                  <TaskNode
                    key={task.id}
                    task={task}
                    goal={goal}
                    onUpdateGoal={onUpdateGoal}
                    level={0}
                    status={goal.status}
                    onAddSubtask={setShowAddSubtask}
                    showAddSubtask={showAddSubtask}
                    newSubtaskTitle={newSubtaskTitle}
                    newSubtaskTarget={newSubtaskTarget}
                    setNewSubtaskTitle={setNewSubtaskTitle}
                    setNewSubtaskTarget={setNewSubtaskTarget}
                    onCancelAdd={handleCancelAddSubtask}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="relative text-xs text-slate-500 pt-2">
          Progress is calculated from subtasks to tasks and to the goal. You can create an infinite number of nesting levels.
        </p>
      </DialogContent>
    </Dialog>
  );
}
