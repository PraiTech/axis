import { useState, useMemo } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { sessions, clients } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { GoogleCalendar } from '@/components/calendar/GoogleCalendar';
import type { CalendarEvent } from '@/types/calendar';
import { format, parseISO, addMinutes } from 'date-fns';
import { motion } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Convert duration string to minutes
function parseDuration(duration: string): number {
  const match = duration.match(/(\d+)\s*(hour|minute|hr|min)/gi);
  if (!match) return 60; // Default 1 hour
  
  let totalMinutes = 0;
  match.forEach(m => {
    const num = parseInt(m);
    if (m.toLowerCase().includes('hour') || m.toLowerCase().includes('hr')) {
      totalMinutes += num * 60;
    } else {
      totalMinutes += num;
    }
  });
  return totalMinutes || 60;
}

// Get color based on status
function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    applied: '#10b981', // green
    new: '#3b82f6', // blue
    conducted: '#6b7280', // gray
    rejected: '#ef4444', // red
  };
  return colors[status] || '#3b82f6';
}

export default function Schedule() {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    // Convert sessions to calendar events
    return sessions.map(session => {
      const start = parseISO(session.date);
      const durationMinutes = parseDuration(session.duration);
      const end = addMinutes(start, durationMinutes);
      
      return {
        id: session.id,
        title: session.service,
        start: start.toISOString(),
        end: end.toISOString(),
        color: getStatusColor(session.status),
        description: session.notes || '',
        clientId: session.clientId,
        clientName: session.clientName,
        location: '',
      };
    });
  });

  const filtered = sessions.filter(s => 
    statusFilter === 'all' || s.status === statusFilter
  );

  const upcomingSessions = filtered
    .filter(s => new Date(s.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 10);

  const statusColors = {
    applied: 'text-green-600',
    new: 'text-blue-600',
    conducted: 'text-gray-600',
    rejected: 'text-red-600'
  };

  const handleEventCreate = (eventData: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const handleEventUpdate = (eventId: string, eventData: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, ...eventData } : e));
  };

  const handleEventDelete = (eventId: string) => {
    setEvents(prev => prev.filter(e => e.id !== eventId));
  };

  return (
    <PageTransition>
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Schedule
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your appointments and sessions
            </p>
          </div>
        </div>

        {/* Main Calendar View */}
        <Card className="flex-1 flex flex-col min-h-[520px] shadow-lg border-border/50">
          <CardContent className="flex-1 p-0 min-h-[480px] overflow-hidden">
            <div className="h-full min-h-[480px]">
              <GoogleCalendar
                events={events}
                onEventCreate={handleEventCreate}
                onEventUpdate={handleEventUpdate}
                onEventDelete={handleEventDelete}
              />
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Sessions Sidebar */}
        <Card className="mt-6 flex-shrink-0 shadow-md border-border/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="applied">Applied</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="conducted">Conducted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcomingSessions.length > 0 ? (
                    upcomingSessions.map((session, index) => (
                      <motion.tr
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-accent/50 transition-colors"
                      >
                        <TableCell className="font-medium">{session.clientName}</TableCell>
                        <TableCell>{session.service}</TableCell>
                        <TableCell>
                          {format(new Date(session.date), 'MMM dd, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>{session.duration}</TableCell>
                        <TableCell>
                          <span className={statusColors[session.status]}>
                            • {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No upcoming sessions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
