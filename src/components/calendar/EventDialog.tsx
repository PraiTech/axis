import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import type { CalendarEvent } from '@/types/calendar';
import { Trash2 } from 'lucide-react';

interface EventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onDelete?: () => void;
}

const EVENT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Teal', value: '#14b8a6' },
];

export function EventDialog({ isOpen, onClose, event, onSave, onDelete }: EventDialogProps) {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startDateObj, setStartDateObj] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    if (event) {
      const start = parseISO(event.start);
      const end = parseISO(event.end);
      setTitle(event.title || '');
      setStartDate(format(start, 'yyyy-MM-dd'));
      setStartDateObj(start);
      setStartTime(format(start, 'HH:mm'));
      setEndDate(format(end, 'yyyy-MM-dd'));
      setEndDateObj(end);
      setEndTime(format(end, 'HH:mm'));
      setDescription(event.description || '');
      setLocation(event.location || '');
      setColor(event.color || '#3b82f6');
      setClientName(event.clientName || '');
    } else {
      const now = new Date();
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
      setTitle('');
      setStartDate(format(now, 'yyyy-MM-dd'));
      setStartDateObj(now);
      setStartTime(format(now, 'HH:mm'));
      setEndDate(format(oneHourLater, 'yyyy-MM-dd'));
      setEndDateObj(oneHourLater);
      setEndTime(format(oneHourLater, 'HH:mm'));
      setDescription('');
      setLocation('');
      setColor('#3b82f6');
      setClientName('');
    }
  }, [event, isOpen]);

  // Sync date objects with date strings
  useEffect(() => {
    if (startDateObj) {
      setStartDate(format(startDateObj, 'yyyy-MM-dd'));
    }
  }, [startDateObj]);

  useEffect(() => {
    if (endDateObj) {
      setEndDate(format(endDateObj, 'yyyy-MM-dd'));
    }
  }, [endDateObj]);

  const handleSave = () => {
    if (!title.trim()) return;
    if (!startDateObj || !endDateObj) return; // Ensure dates are selected

    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (end <= start) {
      // Простая валидация, без системного алерта
      return;
    }

    onSave({
      title: title.trim(),
      start: start.toISOString(),
      end: end.toISOString(),
      description: description.trim(),
      location: location.trim(),
      color,
      clientName: clientName.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Calendar
                value={startDateObj}
                onChange={(date) => setStartDateObj(date)}
                placeholder="Select start date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <TimePicker
                value={startTime}
                onChange={(time) => setStartTime(time)}
                placeholder="HH:mm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Calendar
                value={endDateObj}
                onChange={(date) => setEndDateObj(date)}
                placeholder="Select end date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <TimePicker
                value={endTime}
                onChange={(time) => setEndTime(time)}
                placeholder="HH:mm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client name (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Event location (optional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Event description (optional)"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2 flex-wrap">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${
                    color === c.value ? 'border-foreground scale-110' : 'border-border hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  aria-label={c.name}
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div>
            {onDelete && (
              <Button variant="destructive" onClick={onDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {event ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
