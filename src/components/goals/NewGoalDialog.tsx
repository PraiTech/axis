import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, CalendarDays, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Calendar } from '@/components/ui/calendar';
import { format, parse } from 'date-fns';
import type { Goal } from '@/data/mockData';

type GoalStatus = Goal['status'];

interface NewGoalDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (goal: Omit<Goal, 'id'>) => void;
}

const statusOptions: { value: GoalStatus; label: string }[] = [
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

export function NewGoalDialog({ open, onClose, onSubmit }: NewGoalDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [deadline, setDeadline] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<GoalStatus>('in-progress');

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setTarget('');
    setDeadline(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setStatus('in-progress');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseFloat(target);
    if (!title.trim() || isNaN(t) || t <= 0 || !deadline) return;
    onSubmit({
      title: title.trim(),
      description: description.trim() || title.trim(),
      target: t,
      current: 0,
      deadline,
      status,
    });
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg border-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 shadow-xl shadow-slate-200/50 sm:rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_#e0f2fe_0%,_transparent_50%)] pointer-events-none" />
        <div className="relative">
          <DialogHeader className="pb-4">
            <div className="flex items-center gap-3">
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <div>
                <DialogTitle className="text-xl font-bold tracking-tight text-slate-800">
                  New Goal
                </DialogTitle>
                <p className="text-sm text-slate-500 mt-0.5">
                  Add a goal and break it down into subtasks later
                </p>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="goal-title" className="text-slate-700 font-medium">
                Title
              </Label>
              <Input
                id="goal-title"
                placeholder="e.g. Monthly Revenue Target"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11 border-slate-200 bg-white/80 focus:ring-2 focus:ring-blue-500/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-desc" className="text-slate-700 font-medium">
                Description
              </Label>
              <Textarea
                id="goal-desc"
                placeholder="What do you want to achieve?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="resize-none border-slate-200 bg-white/80 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-target" className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <Target className="h-3.5 w-3.5" />
                  Target
                </Label>
                <Input
                  id="goal-target"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="e.g. 20000"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="h-11 border-slate-200 bg-white/80 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="goal-deadline" className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Deadline
                </Label>
                <Calendar
                  value={deadline ? parse(deadline, 'yyyy-MM-dd', new Date()) : undefined}
                  onChange={(d) => setDeadline(d ? format(d, 'yyyy-MM-dd') : '')}
                  placeholder="DD.MM.YYYY"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-slate-700 font-medium">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as GoalStatus)}>
                <SelectTrigger className="h-11 border-slate-200 bg-white/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="gap-2 pt-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={handleClose} className="border-slate-200">
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-600 hover:to-blue-700"
              >
                Create Goal
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
