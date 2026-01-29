import { useState, useMemo, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addWeeks, subWeeks, addMonths, subMonths, addDays, subDays, startOfDay, endOfDay, isWithinInterval, parseISO, setHours, setMinutes, getHours, getMinutes, addHours, addMinutes, differenceInMinutes } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Plus, MoreVertical, X, Edit2, Trash2, Clock, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CalendarEvent, CalendarView } from '@/types/calendar';
import { EventDialog } from './EventDialog';
import { EventPopover } from './EventPopover';

interface GoogleCalendarProps {
  events: CalendarEvent[];
  onEventCreate: (event: Omit<CalendarEvent, 'id'>) => void;
  onEventUpdate: (eventId: string, event: Partial<CalendarEvent>) => void;
  onEventDelete: (eventId: string) => void;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export function GoogleCalendar({ events, onEventCreate, onEventUpdate, onEventDelete }: GoogleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [popoverEvent, setPopoverEvent] = useState<CalendarEvent | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: Date; hour?: number } | null>(null);

  // Navigation
  const goToToday = () => setCurrentDate(new Date());
  const goToPrev = () => {
    if (view === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };
  const goToNext = () => {
    if (view === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (view === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  // Get events for a specific day
  const getEventsForDay = useCallback((date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    return events.filter(event => {
      const eventStart = parseISO(event.start);
      const eventEnd = parseISO(event.end);
      return isWithinInterval(eventStart, { start: dayStart, end: dayEnd }) ||
             isWithinInterval(eventEnd, { start: dayStart, end: dayEnd }) ||
             (eventStart <= dayStart && eventEnd >= dayEnd);
    }).sort((a, b) => parseISO(a.start).getTime() - parseISO(b.start).getTime());
  }, [events]);

  // Get events for a specific hour in week/day view
  const getEventsForHour = useCallback((date: Date, hour: number) => {
    const hourStart = setMinutes(setHours(date, hour), 0);
    const hourEnd = setMinutes(setHours(date, hour), 59);
    return events.filter(event => {
      const eventStart = parseISO(event.start);
      const eventEnd = parseISO(event.end);
      return (eventStart >= hourStart && eventStart <= hourEnd) ||
             (eventEnd >= hourStart && eventEnd <= hourEnd) ||
             (eventStart <= hourStart && eventEnd >= hourEnd);
    });
  }, [events]);

  // Month View
  const monthDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  // Week View
  const weekDays = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  }, [currentDate]);

  // Handle event click
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setPopoverEvent(event);
    setPopoverPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle day/time slot click
  const handleTimeSlotClick = (date: Date, hour?: number) => {
    const startDate = hour !== undefined 
      ? setMinutes(setHours(date, hour), 0)
      : startOfDay(date);
    const endDate = hour !== undefined
      ? setMinutes(setHours(date, hour + 1), 0)
      : addHours(startOfDay(date), 1);
    
    setEditingEvent(null);
    setSelectedEvent({
      id: '',
      title: '',
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      color: '#3b82f6',
      description: '',
      location: '',
      clientId: '',
      clientName: ''
    } as CalendarEvent);
    setIsEventDialogOpen(true);
  };

  // Drag and drop handlers
  const handleDragStart = (event: CalendarEvent, e: React.DragEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
  };

  const handleDragOver = (date: Date, hour: number | undefined, e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot({ date, hour });
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (date: Date, hour: number | undefined, e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedEvent) return;

    const eventStart = parseISO(draggedEvent.start);
    const eventEnd = parseISO(draggedEvent.end);
    const duration = differenceInMinutes(eventEnd, eventStart);

    const newStart = hour !== undefined
      ? setMinutes(setHours(date, hour), getMinutes(eventStart))
      : setHours(startOfDay(date), getHours(eventStart));
    const newEnd = addMinutes(newStart, duration);

    onEventUpdate(draggedEvent.id, {
      start: newStart.toISOString(),
      end: newEnd.toISOString(),
    });

    setDraggedEvent(null);
    setDragOverSlot(null);
  };

  // Render Month View
  const renderMonthView = () => (
    <div className="flex flex-col h-full">
      {/* Week day headers */}
      <div className="grid grid-cols-7 border-b border-border">
        {WEEK_DAYS.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="flex-1 grid grid-cols-7 auto-rows-fr border-l border-t border-border">
        {monthDays.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={idx}
              className={cn(
                "min-h-[120px] border-r border-b border-border p-1.5 cursor-pointer hover:bg-accent/50 transition-colors",
                !isCurrentMonth && "bg-muted/30",
                dragOverSlot?.date.getTime() === day.getTime() && !dragOverSlot.hour && "bg-primary/10 border-primary border-2"
              )}
              onClick={() => handleTimeSlotClick(day)}
              onDragOver={(e) => {
                e.preventDefault();
                handleDragOver(day, undefined, e);
              }}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(day, undefined, e)}
            >
              <div className={cn(
                "text-sm font-medium mb-1",
                isToday && "bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center",
                !isToday && isCurrentMonth && "text-foreground",
                !isCurrentMonth && "text-muted-foreground/50"
              )}>
                {format(day, 'd')}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    draggable
                    onDragStart={(e) => handleDragStart(event, e)}
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded truncate cursor-move hover:opacity-80 transition-opacity",
                      draggedEvent?.id === event.id && "opacity-50"
                    )}
                    style={{
                      backgroundColor: `${event.color}20`,
                      color: event.color,
                      borderLeft: `2px solid ${event.color}`
                    }}
                    onClick={(e) => handleEventClick(event, e)}
                  >
                    {format(parseISO(event.start), 'HH:mm')} {event.title}
                  </motion.div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-1.5">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Render Week View
  const renderWeekView = () => (
    <div className="flex flex-col h-full overflow-auto">
      {/* Time column + days */}
      <div className="flex border-b border-border sticky top-0 bg-background z-10">
        <div className="w-24 border-r border-border"></div>
        {weekDays.map(day => (
          <div key={day.toISOString()} className="flex-1 border-r border-border p-2 text-center">
            <div className="text-sm font-medium">{format(day, 'EEE')}</div>
            <div className={cn(
              "text-2xl font-semibold mt-1",
              isSameDay(day, new Date()) && "text-primary"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="flex flex-1">
        {/* Time column — фиксированные интервалы 00:00 - 01:00, 01:00 - 02:00, … */}
        <div className="w-24 border-r border-border shrink-0">
          {HOURS.map(hour => {
            const start = setMinutes(setHours(new Date(0), hour), 0);
            const endLabel = hour === 23 ? '24:00' : format(setMinutes(setHours(new Date(0), hour + 1), 0), 'HH:mm');
            return (
              <div key={hour} className="h-16 border-b border-border p-1 text-xs text-muted-foreground">
                {format(start, 'HH:mm')} – {endLabel}
              </div>
            );
          })}
        </div>

        {/* Day columns */}
        {weekDays.map(day => (
          <div key={day.toISOString()} className="flex-1 border-r border-border relative">
            {HOURS.map(hour => {
              const hourEvents = getEventsForHour(day, hour);
              const isDragOver = dragOverSlot?.date.getTime() === day.getTime() && dragOverSlot?.hour === hour;
              return (
                <div
                  key={hour}
                  className={cn(
                    "h-16 border-b border-border hover:bg-accent/30 cursor-pointer transition-colors relative",
                    isDragOver && "bg-primary/10 border-primary border-2"
                  )}
                  onClick={() => handleTimeSlotClick(day, hour)}
                  onDragOver={(e) => handleDragOver(day, hour, e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(day, hour, e)}
                >
                  {hourEvents.map((event, idx) => {
                    const eventStart = parseISO(event.start);
                    const eventEnd = parseISO(event.end);
                    const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
                    const endMinutes = getHours(eventEnd) * 60 + getMinutes(eventEnd);
                    const hourStartMinutes = hour * 60;
                    const hourEndMinutes = (hour + 1) * 60;
                    
                    const top = Math.max(0, startMinutes - hourStartMinutes) / 60 * 100;
                    const height = Math.min(endMinutes, hourEndMinutes) - Math.max(startMinutes, hourStartMinutes);
                    const heightPercent = (height / 60) * 100;

                    if (height <= 0) return null;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                        className={cn(
                          "absolute left-0 right-0 px-1 py-0.5 rounded text-xs cursor-move hover:opacity-80 transition-opacity z-10",
                          draggedEvent?.id === event.id && "opacity-50"
                        )}
                        style={{
                          top: `${top}%`,
                          height: `${heightPercent}%`,
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`
                        }}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Render Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate);
    
    return (
      <div className="flex flex-col h-full overflow-auto">
        {/* Day header */}
        <div className="border-b border-border p-4 sticky top-0 bg-background z-10">
          <div className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</div>
        </div>

        {/* Time slots */}
        <div className="flex flex-1">
          <div className="w-28 border-r border-border shrink-0">
            {HOURS.map(hour => {
              const start = setMinutes(setHours(new Date(0), hour), 0);
              const endLabel = hour === 23 ? '24:00' : format(setMinutes(setHours(new Date(0), hour + 1), 0), 'HH:mm');
              return (
                <div key={hour} className="h-16 border-b border-border p-2 text-sm text-muted-foreground">
                  {format(start, 'HH:mm')} – {endLabel}
                </div>
              );
            })}
          </div>

          <div className="flex-1 relative">
            {HOURS.map(hour => {
              const hourEvents = getEventsForHour(currentDate, hour);
              const isDragOver = dragOverSlot?.date.getTime() === currentDate.getTime() && dragOverSlot?.hour === hour;
              return (
                <div
                  key={hour}
                  className={cn(
                    "h-16 border-b border-border hover:bg-accent/30 cursor-pointer transition-colors relative",
                    isDragOver && "bg-primary/10 border-primary border-2"
                  )}
                  onClick={() => handleTimeSlotClick(currentDate, hour)}
                  onDragOver={(e) => handleDragOver(currentDate, hour, e)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(currentDate, hour, e)}
                >
                  {hourEvents.map((event, idx) => {
                    const eventStart = parseISO(event.start);
                    const eventEnd = parseISO(event.end);
                    const startMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
                    const endMinutes = getHours(eventEnd) * 60 + getMinutes(eventEnd);
                    const hourStartMinutes = hour * 60;
                    const hourEndMinutes = (hour + 1) * 60;
                    
                    const top = Math.max(0, startMinutes - hourStartMinutes) / 60 * 100;
                    const height = Math.min(endMinutes, hourEndMinutes) - Math.max(startMinutes, hourStartMinutes);
                    const heightPercent = (height / 60) * 100;

                    if (height <= 0) return null;

                    return (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        draggable
                        onDragStart={(e) => handleDragStart(event, e)}
                        className={cn(
                          "absolute left-0 right-0 px-2 py-1 rounded text-sm cursor-move hover:opacity-80 transition-opacity z-10",
                          draggedEvent?.id === event.id && "opacity-50"
                        )}
                        style={{
                          top: `${top}%`,
                          height: `${heightPercent}%`,
                          backgroundColor: `${event.color}20`,
                          color: event.color,
                          borderLeft: `3px solid ${event.color}`
                        }}
                        onClick={(e) => handleEventClick(event, e)}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs opacity-75">
                          {format(eventStart, 'HH:mm')} - {format(eventEnd, 'HH:mm')}
                        </div>
                        {event.location && (
                          <div className="text-xs opacity-75 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Render Agenda View
  const renderAgendaView = () => {
    const sortedEvents = [...events].sort((a, b) => 
      parseISO(a.start).getTime() - parseISO(b.start).getTime()
    );

    const groupedEvents = sortedEvents.reduce((acc, event) => {
      const dateKey = format(parseISO(event.start), 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
      <div className="flex flex-col h-full overflow-auto">
        {Object.entries(groupedEvents).map(([dateKey, dayEvents]) => {
          const date = parseISO(dateKey);
          return (
            <div key={dateKey} className="border-b border-border">
              <div className="p-4 bg-muted/30">
                <div className="text-sm font-medium text-muted-foreground">
                  {format(date, 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
              <div className="divide-y divide-border">
                {dayEvents.map(event => {
                  const eventStart = parseISO(event.start);
                  const eventEnd = parseISO(event.end);
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      onClick={() => {
                        setEditingEvent(event);
                        setIsEventDialogOpen(true);
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center min-w-[80px]">
                          <div className="text-sm font-medium">
                            {format(eventStart, 'HH:mm')}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {format(eventEnd, 'HH:mm')}
                          </div>
                        </div>
                        <div 
                          className="w-1 h-full rounded-full"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-base">{event.title}</div>
                          {event.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {event.description}
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            {event.clientName && (
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {event.clientName}
                              </div>
                            )}
                            {event.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {event.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {differenceInMinutes(eventEnd, eventStart)} min
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-[420px] bg-background">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-card to-card/95 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={goToToday}
            className="font-medium shadow-sm hover:shadow-md transition-shadow"
          >
            Today
          </Button>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToPrev}
              className="hover:bg-accent/50"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={goToNext}
              className="hover:bg-accent/50"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-lg font-semibold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
            {view === 'month' && format(currentDate, 'MMMM yyyy')}
            {view === 'week' && `${format(weekDays[0], 'MMM d')} - ${format(weekDays[6], 'MMM d, yyyy')}`}
            {view === 'day' && format(currentDate, 'MMMM d, yyyy')}
            {view === 'agenda' && 'Agenda'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border/50">
            {(['month', 'week', 'day', 'agenda'] as CalendarView[]).map(v => (
              <Button
                key={v}
                variant={view === v ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView(v)}
                className={cn(
                  "capitalize transition-all",
                  view === v && "shadow-sm"
                )}
              >
                {v}
              </Button>
            ))}
          </div>
          <Button 
            size="sm" 
            onClick={() => {
              setEditingEvent(null);
              setSelectedEvent(null);
              setIsEventDialogOpen(true);
            }}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex-1 min-h-[360px] overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
            {view === 'agenda' && renderAgendaView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Event Dialog */}
      <EventDialog
        isOpen={isEventDialogOpen}
        onClose={() => {
          setIsEventDialogOpen(false);
          setEditingEvent(null);
          setSelectedEvent(null);
        }}
        event={editingEvent || selectedEvent}
        onSave={(eventData) => {
          if (editingEvent) {
            onEventUpdate(editingEvent.id, eventData);
          } else {
            onEventCreate(eventData);
          }
          setIsEventDialogOpen(false);
          setEditingEvent(null);
          setSelectedEvent(null);
        }}
        onDelete={editingEvent ? () => {
          onEventDelete(editingEvent.id);
          setIsEventDialogOpen(false);
          setEditingEvent(null);
        } : undefined}
      />

      {/* Event Popover */}
      {popoverEvent && (
        <EventPopover
          event={popoverEvent}
          position={popoverPosition}
          onClose={() => setPopoverEvent(null)}
          onEdit={() => {
            setEditingEvent(popoverEvent);
            setPopoverEvent(null);
            setIsEventDialogOpen(true);
          }}
          onDelete={() => {
            onEventDelete(popoverEvent.id);
            setPopoverEvent(null);
          }}
        />
      )}
    </div>
  );
}
