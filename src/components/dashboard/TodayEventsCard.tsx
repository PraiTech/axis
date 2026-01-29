import { motion } from 'framer-motion';
import { format, isToday, parseISO, differenceInMinutes, differenceInHours } from 'date-fns';
import { Clock, User, DollarSign, Calendar } from 'lucide-react';
import type { Session } from '@/data/mockData';
import { cn } from '@/lib/utils';

type EventStatus = 'now' | 'soon' | 'starting_soon' | 'later';

interface TodayEventsCardProps {
  sessions: Session[];
  delay?: number;
}

function getEventStatus(sessionDate: Date, now: Date): { status: EventStatus; label: string; minutesUntil: number } {
  const minutesUntil = differenceInMinutes(sessionDate, now);
  if (minutesUntil < 0) return { status: 'later', label: 'Past', minutesUntil };
  if (minutesUntil <= 15) return { status: 'now', label: 'Starting soon', minutesUntil };
  if (minutesUntil <= 60) return { status: 'soon', label: 'Soon', minutesUntil };
  if (minutesUntil <= 120) return { status: 'starting_soon', label: 'Starting soon', minutesUntil };
  return { status: 'later', label: `At ${format(sessionDate, 'HH:mm')}`, minutesUntil };
}

export function TodayEventsCard({ sessions, delay = 0 }: TodayEventsCardProps) {
  const now = new Date();

  const todaySessions = sessions
    .filter(session => isToday(parseISO(session.date)))
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

  const formatTime = (dateString: string) => format(parseISO(dateString), 'HH:mm');

  const renderEventCard = (session: Session) => {
    const sessionDate = parseISO(session.date);
    const { status, label } = getEventStatus(sessionDate, now);
    const isPast = sessionDate.getTime() < now.getTime();

    const statusStyles = {
      now: 'bg-red-50/90 border-red-200/60 hover:bg-red-100/80',
      soon: 'bg-amber-50/90 border-amber-200/60 hover:bg-amber-100/80',
      starting_soon: 'bg-orange-50/80 border-orange-200/50 hover:bg-orange-100/70',
      later: isPast
        ? 'bg-slate-100/80 border-slate-200/50 opacity-75'
        : 'bg-slate-50/80 border-slate-200/60 hover:bg-slate-100/80',
    };

    const labelStyles = {
      now: 'text-red-600 font-semibold',
      soon: 'text-amber-700 font-medium',
      starting_soon: 'text-orange-600 font-medium',
      later: isPast ? 'text-slate-400' : 'text-slate-500',
    };

    return (
      <div
        key={session.id}
        className={cn('p-2.5 rounded-lg border transition-colors', statusStyles[status])}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <Clock className={cn('h-3 w-3 flex-shrink-0', status === 'now' ? 'text-red-600' : 'text-slate-500')} />
          <span className="text-sm font-semibold text-slate-900">{formatTime(session.date)}</span>
          <span className={cn('text-[10px]', labelStyles[status])}>{label}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-800 truncate">
          <User className="h-3 w-3 text-gray-500 flex-shrink-0" />
          {session.clientName}
        </div>
        <div className="flex items-center justify-between gap-2 mt-1 text-xs">
          <span className="text-gray-600 truncate">{session.service}</span>
          <span className="font-semibold text-gray-900 flex-shrink-0">${session.price} · {session.duration}</span>
        </div>
      </div>
    );
  };

  const urgentSessions = todaySessions.filter(s => {
    const d = parseISO(s.date);
    const min = differenceInMinutes(d, now);
    return min >= 0 && min <= 120;
  });
  const regularSessions = todaySessions.filter(s => {
    const d = parseISO(s.date);
    const min = differenceInMinutes(d, now);
    return min > 120 || min < 0;
  });

  const allSections = (
    <>
      {urgentSessions.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest mb-1.5">
            URGENT EVENTS
          </div>
          <div className="space-y-1.5">{urgentSessions.map(renderEventCard)}</div>
        </div>
      )}
      {regularSessions.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            OTHER EVENTS
          </div>
          <div className="space-y-1.5">{regularSessions.map(renderEventCard)}</div>
        </div>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-[340px] flex flex-col"
    >
      <div
        className="rounded-2xl flex flex-col h-full overflow-hidden border border-slate-200/80 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]"
      >
        <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="icon-inset flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
              <Calendar className="h-4 w-4" />
            </span>
            Today's Events
          </h3>
        </div>
        <div className="dashboard-card-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 pr-1 [scrollbar-gutter:stable]">
          {todaySessions.length > 0 ? allSections : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-slate-400 text-sm">
              No events today
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
