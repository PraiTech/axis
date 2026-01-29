import { PageTransition } from '@/components/shared/PageTransition';
import { goals as initialGoals } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { NewGoalDialog } from '@/components/goals/NewGoalDialog';
import { GoalTreeDialog } from '@/components/goals/GoalTreeDialog';
import type { Goal, GoalTask } from '@/data/mockData';

const statusLabels: Record<Goal['status'], string> = {
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'on-hold': 'On Hold',
};

const statusBadgeClass: Record<Goal['status'], string> = {
  'in-progress': 'badge-in-progress',
  'completed': 'badge-completed',
  'on-hold': 'badge-on-hold',
};

// Рекурсивная функция расчета прогресса задачи
function taskProgress(task: GoalTask): number {
  // Если есть подзадачи, прогресс рассчитывается на основе них
  if (task.subtasks && task.subtasks.length > 0) {
    const sum = task.subtasks.reduce((a, subtask) => a + taskProgress(subtask), 0);
    return sum / task.subtasks.length;
  }
  // Иначе используем прямые значения current/target
  const p = task.target > 0 ? (task.current / task.target) * 100 : 0;
  return Math.min(100, p);
}

function effectiveGoalProgress(g: Goal): number {
  if (g.subtasks && g.subtasks.length > 0) {
    const sum = g.subtasks.reduce((a, s) => a + taskProgress(s), 0);
    return sum / g.subtasks.length;
  }
  const p = g.target > 0 ? (g.current / g.target) * 100 : 0;
  return Math.min(100, p);
}

function SpiralIcon() {
  return (
    <div className="spiral-wrapper">
      <svg className="spiral-svg" viewBox="0 0 100 100">
        <path
          d="M50,50 m0,0 a1,1 0 0,1 2,0 a2,2 0 0,1 -4,0 a4,4 0 0,1 8,0 a8,8 0 0,1 -16,0 a14,14 0 0,1 28,0 a20,20 0 0,1 -40,0 a28,28 0 0,1 56,0"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>(() => initialGoals);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [newGoalOpen, setNewGoalOpen] = useState(false);
  const [treeGoal, setTreeGoal] = useState<Goal | null>(null);

  const filtered = goals.filter(g =>
    statusFilter === 'all' || g.status === statusFilter
  );

  const addGoal = useCallback((g: Omit<Goal, 'id'>) => {
    const id = `g${Date.now()}`;
    setGoals((prev) => [...prev, { ...g, id }]);
  }, []);

  const updateGoal = useCallback((updated: Goal) => {
    setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
    setTreeGoal((current) => (current?.id === updated.id ? updated : current));
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground">
              Track and manage your business goals
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={() => setNewGoalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </Button>
          </div>
        </div>

        <NewGoalDialog
          open={newGoalOpen}
          onClose={() => setNewGoalOpen(false)}
          onSubmit={addGoal}
        />

        {treeGoal && (
          <GoalTreeDialog
            open={!!treeGoal}
            onClose={() => setTreeGoal(null)}
            goal={treeGoal}
            onUpdateGoal={updateGoal}
          />
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((goal, index) => {
            const progress = effectiveGoalProgress(goal);
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  className="luxury-card"
                  data-status={goal.status}
                  onDoubleClick={() => setTreeGoal(goal)}
                  title="Double-click to open goal tree"
                >
                  <SpiralIcon />
                  <div className="card-header">
                    <h3 className="card-title">{goal.title}</h3>
                    <span className={`goal-badge ${statusBadgeClass[goal.status]}`}>
                      {statusLabels[goal.status]}
                    </span>
                  </div>
                  <p className="card-desc">{goal.description}</p>
                  <div className="progress-container">
                    <div className="progress-info">
                      <span>Progress</span>
                      <span>
                        {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                      </span>
                    </div>
                    <div className="progress-bg">
                      <motion.div
                        className="progress-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-1 mb-4">
                      {progress.toFixed(1)}% complete
                    </p>
                  </div>
                  <div className="deadline">
                    <svg
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </PageTransition>
  );
}
