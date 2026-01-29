export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO string
  end: string; // ISO string
  color: string; // Hex color
  description?: string;
  location?: string;
  clientId?: string;
  clientName?: string;
  allDay?: boolean;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval: number;
    endDate?: string;
  };
}
