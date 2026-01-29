import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfYear,
  endOfYear,
  subMonths,
  subYears,
  isWithinInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  type Interval,
} from 'date-fns';
import type { Transaction } from '@/data/mockData';

export type SalesPeriod = 'monthly' | 'weekly' | 'yearly';

export interface SalesFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  type: 'income' | 'expense' | 'all';
  categories: string[];
  statuses: Array<'completed' | 'pending' | 'failed'>;
  clientId: string | null;
  period: SalesPeriod;
}

export interface TxFilters {
  dateFrom: Date | null;
  dateTo: Date | null;
  type: 'income' | 'expense' | 'all';
  categories: string[];
  statuses: Array<'completed' | 'pending' | 'failed'>;
  clientId: string | null;
}

export const defaultSalesFilters: SalesFilters = {
  dateFrom: null,
  dateTo: null,
  type: 'income',
  categories: [],
  statuses: ['completed'],
  clientId: null,
  period: 'monthly',
};

export const defaultTxFilters: TxFilters = {
  dateFrom: null,
  dateTo: null,
  type: 'all',
  categories: [],
  statuses: [],
  clientId: null,
};

export function getUniqueCategories(transactions: Transaction[]): string[] {
  const set = new Set<string>();
  transactions.forEach((t) => set.add(t.category));
  return Array.from(set).sort();
}

export function getUniqueClients(transactions: Transaction[]): { id: string; name: string }[] {
  const map = new Map<string, string>();
  transactions.forEach((t) => map.set(t.clientId, t.clientName));
  return Array.from(map.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
}

function inDateRange(date: Date, from: Date | null, to: Date | null): boolean {
  if (!from && !to) return true;
  const d = new Date(date);
  if (from && to) return isWithinInterval(d, { start: from, end: to });
  if (from) return d >= from;
  if (to) return d <= to;
  return true;
}

export function filterTransactions(
  transactions: Transaction[],
  filters: Pick<SalesFilters, 'dateFrom' | 'dateTo' | 'type' | 'categories' | 'statuses' | 'clientId'>
): Transaction[] {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    if (!inDateRange(d, filters.dateFrom, filters.dateTo)) return false;
    if (filters.type !== 'all' && t.type !== filters.type) return false;
    if (filters.categories.length > 0 && !filters.categories.includes(t.category)) return false;
    if (filters.statuses.length > 0 && !filters.statuses.includes(t.status)) return false;
    if (filters.clientId && t.clientId !== filters.clientId) return false;
    return true;
  });
}

export function aggregateSales(
  transactions: Transaction[],
  period: SalesPeriod,
  dateFrom: Date | null,
  dateTo: Date | null
): { label: string; value: number }[] {
  const filtered = filterTransactions(transactions, {
    dateFrom,
    dateTo,
    type: 'income',
    categories: [],
    statuses: ['completed'],
    clientId: null,
  });
  const asIncome = filtered.filter((t) => t.type === 'income');
  const byKey = new Map<string, number>();

  const now = new Date();
  const from = dateFrom ?? subMonths(now, 11);
  const to = dateTo ?? now;
  const interval: Interval = { start: from, end: to };

  if (period === 'monthly') {
    eachMonthOfInterval(interval).forEach((m) => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const key = format(m, 'MMM yyyy');
      const sum = asIncome
        .filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        })
        .reduce((s, t) => s + t.amount, 0);
      byKey.set(key, (byKey.get(key) ?? 0) + sum);
    });
  } else if (period === 'weekly') {
    eachWeekOfInterval(interval, { weekStartsOn: 1 }).forEach((w) => {
      const start = startOfWeek(w, { weekStartsOn: 1 });
      const end = endOfWeek(w, { weekStartsOn: 1 });
      const key = `W${format(w, 'ww')} ${format(w, 'MMM yyyy')}`;
      const sum = asIncome
        .filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        })
        .reduce((s, t) => s + t.amount, 0);
      byKey.set(key, (byKey.get(key) ?? 0) + sum);
    });
  } else {
    eachYearOfInterval(interval).forEach((y) => {
      const start = startOfYear(y);
      const end = endOfYear(y);
      const key = format(y, 'yyyy');
      const sum = asIncome
        .filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        })
        .reduce((s, t) => s + t.amount, 0);
      byKey.set(key, (byKey.get(key) ?? 0) + sum);
    });
  }

  return Array.from(byKey.entries()).map(([label, value]) => ({ label, value }));
}

/** Aggregate with full filters (type, categories, statuses, client). */
export function aggregateSalesWithFilters(
  transactions: Transaction[],
  filters: SalesFilters
): { label: string; value: number }[] {
  const filtered = filterTransactions(transactions, {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    type: filters.type,
    categories: filters.categories,
    statuses: filters.statuses,
    clientId: filters.clientId,
  });
  const byKey = new Map<string, number>();
  const now = new Date();
  const from = filters.dateFrom ?? subMonths(now, 11);
  const to = filters.dateTo ?? now;
  const interval: Interval = { start: from, end: to };

  if (filters.period === 'monthly') {
    eachMonthOfInterval(interval).forEach((m) => {
      const start = startOfMonth(m);
      const end = endOfMonth(m);
      const key = format(m, 'MMM yyyy');
      const sum = filtered
        .filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        })
        .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
      byKey.set(key, (byKey.get(key) ?? 0) + sum);
    });
  } else if (filters.period === 'weekly') {
    eachWeekOfInterval(interval, { weekStartsOn: 1 }).forEach((w) => {
      const start = startOfWeek(w, { weekStartsOn: 1 });
      const end = endOfWeek(w, { weekStartsOn: 1 });
      const key = `W${format(w, 'ww')} ${format(w, 'MMM yyyy')}`;
      const sum = filtered
        .filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        })
        .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
      byKey.set(key, (byKey.get(key) ?? 0) + sum);
    });
  } else {
    eachYearOfInterval(interval).forEach((y) => {
      const start = startOfYear(y);
      const end = endOfYear(y);
      const key = format(y, 'yyyy');
      const sum = filtered
        .filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        })
        .reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0);
      byKey.set(key, (byKey.get(key) ?? 0) + sum);
    });
  }

  return Array.from(byKey.entries()).map(([label, value]) => ({ label, value }));
}

export function computeSalesSummary(
  chartData: { label: string; value: number }[]
): { total: number; average: number; peakLabel: string; growthPercent: number } {
  if (chartData.length === 0) {
    return { total: 0, average: 0, peakLabel: '—', growthPercent: 0 };
  }
  const total = chartData.reduce((s, x) => s + x.value, 0);
  const average = Math.round(total / chartData.length);
  const peak = chartData.reduce((a, b) => (a.value >= b.value ? a : b), chartData[0]);
  const first = chartData[0].value;
  const last = chartData[chartData.length - 1].value;
  const growthPercent = first > 0 ? Math.round(((last - first) / first) * 100) : 0;
  return {
    total,
    average,
    peakLabel: peak.label,
    growthPercent,
  };
}

export function countActiveFilters(f: SalesFilters): number {
  let n = 0;
  if (f.dateFrom || f.dateTo) n += 1;
  if (f.type !== 'income') n += 1;
  if (f.categories.length > 0) n += 1;
  if (f.statuses.length !== 1 || f.statuses[0] !== 'completed') n += 1;
  if (f.clientId) n += 1;
  return n;
}

export function countTxActiveFilters(f: TxFilters): number {
  let n = 0;
  if (f.type !== 'all') n += 1;
  if (f.categories.length > 0) n += 1;
  if (f.statuses.length > 0) n += 1;
  if (f.clientId) n += 1;
  return n;
}
