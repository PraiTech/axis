import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import type { CalendarEvent } from '@/types/calendar';
import { Edit2, Trash2, Clock, User, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EventPopoverProps {
  event: CalendarEvent;
  position: { x: number; y: number };
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function EventPopover({ event, position, onClose, onEdit, onDelete }: EventPopoverProps) {
  const start = parseISO(event.start);
  const end = parseISO(event.end);

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="fixed z-50 w-80 bg-card border border-border rounded-lg shadow-lg p-4"
        style={{
          left: `${Math.min(position.x, window.innerWidth - 320)}px`,
          top: `${Math.min(position.y, window.innerHeight - 200)}px`,
        }}
      >
        <div className="flex items-start justify-between mb-3">
          <div
            className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
            style={{ backgroundColor: event.color }}
          />
          <div className="flex-1 ml-2">
            <h3 className="font-semibold text-base">{event.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {format(start, 'MMM d, yyyy HH:mm')} - {format(end, 'HH:mm')}
            </span>
          </div>
          {event.clientName && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{event.clientName}</span>
            </div>
          )}
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}
          {event.description && (
            <div className="pt-2 border-t border-border">
              <p>{event.description}</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            onClick={onEdit}
            className="flex-1"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onDelete}
            className="flex-1"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </motion.div>
    </>
  );
}
