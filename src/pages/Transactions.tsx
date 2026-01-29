import { useState, useEffect, useMemo } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { transactions, bankCards, clients } from '@/data/mockData';
import type { Transaction } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Eye,
  MoreVertical,
  Plus,
  BarChart3,
  PieChart,
  Users,
  Activity,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Wallet,
  CreditCard,
  Building2,
  Receipt
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth, isWithinInterval, startOfDay, endOfDay } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { GlassChartCard } from '@/components/dashboard/GlassChartCard';
import logger from '@/lib/logger';
import { cn } from '@/lib/utils';

type SortField = 'date' | 'type' | 'category' | 'clientName' | 'amount' | 'status' | 'income' | 'expense';
type SortDirection = 'asc' | 'desc' | null;

export default function Transactions() {
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(() => [...transactions]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [activeTab, setActiveTab] = useState<'transactions' | 'analytics'>('transactions');
  const [analyticsTab, setAnalyticsTab] = useState<'trends' | 'categories' | 'clients' | 'statuses' | 'comparison'>('trends');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [addTransactionOpen, setAddTransactionOpen] = useState(false);
  const [addTransactionForm, setAddTransactionForm] = useState({
    clientId: '',
    type: 'income' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    dateObj: new Date() as Date | undefined,
    time: format(new Date(), 'HH:mm'),
    cardId: '',
    status: 'completed' as 'completed' | 'pending' | 'failed',
  });

  // Helper function to get payment method (derived from transaction)
  const getPaymentMethod = (transaction: Transaction): string => {
    const methods = ['Credit Card', 'Bank Transfer', 'PayPal', 'Cash', 'Debit Card'];
    const hash = transaction.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return methods[hash % methods.length];
  };

  // Helper function to get account (derived from transaction)
  const getAccount = (transaction: Transaction): string => {
    const card = bankCards[parseInt(transaction.id.replace(/\D/g, '')) % bankCards.length];
    return `${card.holder} — ${card.type.toUpperCase()}`;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      if (sortDirection === 'desc') {
        setSortDirection('asc');
      } else if (sortDirection === 'asc') {
        setSortDirection(null);
        setSortField('date');
      } else {
        setSortDirection('desc');
      }
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  useEffect(() => {
    logger.componentMount('Transactions');
    logger.dataFetch('Transactions', 'mockData', {
      totalTransactions: transactionsList.length
    });
  }, [transactionsList.length]);

  useEffect(() => {
    if (searchQuery) {
      logger.userAction('Transactions', 'Search transactions', {
        query: searchQuery,
        length: searchQuery.length
      });
    }
  }, [searchQuery]);

  const filtered = useMemo(() => {
    let result = transactionsList.filter(t => {
      const matchesSearch = t.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesType = typeFilter === 'all' || t.type === typeFilter;
      
      // Date range filtering
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const transactionDate = startOfDay(parseISO(t.date));
        if (dateFrom && dateTo) {
          matchesDate = isWithinInterval(transactionDate, {
            start: startOfDay(dateFrom),
            end: endOfDay(dateTo)
          });
        } else if (dateFrom) {
          matchesDate = transactionDate >= startOfDay(dateFrom);
        } else if (dateTo) {
          matchesDate = transactionDate <= endOfDay(dateTo);
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });

    // Apply sorting
    if (sortDirection) {
      result = [...result].sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortField) {
          case 'date':
            aValue = new Date(a.date).getTime();
            bValue = new Date(b.date).getTime();
            break;
          case 'type':
            aValue = a.type;
            bValue = b.type;
            break;
          case 'category':
            aValue = a.category.toLowerCase();
            bValue = b.category.toLowerCase();
            break;
          case 'clientName':
            aValue = a.clientName.toLowerCase();
            bValue = b.clientName.toLowerCase();
            break;
          case 'amount':
            aValue = a.amount;
            bValue = b.amount;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'income':
            aValue = a.type === 'income' ? a.amount : 0;
            bValue = b.type === 'income' ? b.amount : 0;
            break;
          case 'expense':
            aValue = a.type === 'expense' ? a.amount : 0;
            bValue = b.type === 'expense' ? b.amount : 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    logger.debug('DATA', 'Transactions filtered', {
      total: transactionsList.length,
      filtered: result.length,
      filters: { searchQuery, statusFilter, typeFilter, dateFrom, dateTo },
      sort: { field: sortField, direction: sortDirection }
    }, 'Transactions', 'FILTER');
    return result;
  }, [searchQuery, statusFilter, typeFilter, dateFrom, dateTo, transactionsList, sortField, sortDirection]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalIncome = filtered
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpense = filtered
      .filter(t => t.type === 'expense' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const unpaidAmount = filtered
      .filter(t => t.status === 'pending' || t.status === 'failed')
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);
    
    const cashFlow = filtered
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);
    
    const operationsCount = filtered.length;
    
    const pendingCount = filtered.filter(t => t.status === 'pending').length;
    const completedCount = filtered.filter(t => t.status === 'completed').length;
    
    return {
      totalIncome,
      totalExpense,
      netAmount: totalIncome - totalExpense,
      unpaidAmount,
      cashFlow,
      operationsCount,
      pendingCount,
      completedCount,
      totalCount: filtered.length
    };
  }, [filtered]);

  // Group by date
  const grouped = useMemo(() => {
    const result = filtered.reduce((acc, t) => {
      const date = parseISO(t.date);
      const month = format(date, 'MMMM yyyy');
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(t);
      return acc;
    }, {} as Record<string, typeof filtered>);
    
    // Sort transactions within each month
    Object.keys(result).forEach(month => {
      result[month].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    });
    
    return result;
  }, [filtered]);

  // Analytics data
  const monthlyData = useMemo(() => {
    const monthly = filtered.reduce((acc, t) => {
      const date = parseISO(t.date);
      const monthKey = format(date, 'MMM yyyy');
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expense: 0, count: 0 };
      }
      if (t.status === 'completed') {
        if (t.type === 'income') {
          acc[monthKey].income += t.amount;
        } else {
          acc[monthKey].expense += t.amount;
        }
      }
      acc[monthKey].count += 1;
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number; count: number }>);
    
    return Object.values(monthly).sort((a, b) => 
      new Date(a.month).getTime() - new Date(b.month).getTime()
    );
  }, [filtered]);

  const categoryData = useMemo(() => {
    const categories = filtered
      .filter(t => t.status === 'completed')
      .reduce((acc, t) => {
        if (!acc[t.category]) {
          acc[t.category] = { name: t.category, income: 0, expense: 0 };
        }
        if (t.type === 'income') {
          acc[t.category].income += t.amount;
        } else {
          acc[t.category].expense += t.amount;
        }
        return acc;
      }, {} as Record<string, { name: string; income: number; expense: number }>);
    
    return Object.values(categories).map(cat => ({
      name: cat.name,
      value: cat.income + cat.expense,
      income: cat.income,
      expense: cat.expense
    })).sort((a, b) => b.value - a.value);
  }, [filtered]);

  const clientData = useMemo(() => {
    const clientsMap = filtered
      .filter(t => t.type === 'income' && t.status === 'completed')
      .reduce((acc, t) => {
        if (!acc[t.clientName]) {
          acc[t.clientName] = 0;
        }
        acc[t.clientName] += t.amount;
        return acc;
      }, {} as Record<string, number>);
    
    return Object.entries(clientsMap)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10);
  }, [filtered]);

  const statusData = useMemo(() => {
    const statuses = filtered.reduce((acc, t) => {
      acc[t.status] = (acc[t.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const total = filtered.length;
    return [
      { name: 'Completed', value: statuses.completed || 0, percent: total > 0 ? ((statuses.completed || 0) / total * 100).toFixed(1) : '0' },
      { name: 'Pending', value: statuses.pending || 0, percent: total > 0 ? ((statuses.pending || 0) / total * 100).toFixed(1) : '0' },
      { name: 'Failed', value: statuses.failed || 0, percent: total > 0 ? ((statuses.failed || 0) / total * 100).toFixed(1) : '0' }
    ];
  }, [filtered]);

  const comparisonData = useMemo(() => {
    return monthlyData.map(m => ({
      month: m.month,
      Income: m.income,
      Expenses: m.expense,
      Net: m.income - m.expense
    }));
  }, [monthlyData]);

  const COLORS = ['#0284c7', '#6366f1', '#0d9488', '#0891b2', '#8b5cf6', '#f59e0b'];
  const TOOLTIP_STYLE = {
    background: 'rgba(255, 255, 255, 0.96)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(0, 0, 0, 0.08)',
    borderRadius: '12px',
    padding: '12px 16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  };
  const CHART_AXIS = {
    stroke: 'rgba(0, 0, 0, 0.35)',
    tick: { fill: 'rgba(0, 0, 0, 0.6)', fontSize: 12, fontWeight: 500 },
    tickLine: { stroke: 'rgba(0, 0, 0, 0.15)' },
  };
  const INCOME_COLOR = '#0d9488';
  const EXPENSE_COLOR = '#f87171';
  const NET_COLOR = '#0284c7';

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const generateTransactionId = () => {
    const numIds = transactionsList.map(t => parseInt(t.id.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
    return `t${numIds.length ? Math.max(...numIds) + 1 : 1}`;
  };

  const handleAddTransaction = () => {
    if (!addTransactionForm.clientId || !addTransactionForm.amount.trim() || !addTransactionForm.cardId || !addTransactionForm.category.trim()) return;
    if (!addTransactionForm.dateObj) return;
    const amount = parseFloat(addTransactionForm.amount);
    if (isNaN(amount) || amount <= 0) return;
    
    const selectedClient = clients.find(c => c.id === addTransactionForm.clientId);
    if (!selectedClient) return;

    const [hours, minutes] = addTransactionForm.time.split(':');
    const transactionDate = new Date(addTransactionForm.dateObj);
    transactionDate.setHours(parseInt(hours || '0', 10), parseInt(minutes || '0', 10));
    const newTransaction: Transaction = {
      id: generateTransactionId(),
      clientId: addTransactionForm.clientId,
      clientName: selectedClient.name,
      type: addTransactionForm.type,
      amount,
      category: addTransactionForm.category.trim(),
      date: transactionDate.toISOString(),
      description: addTransactionForm.description.trim() || 'Manual transaction',
      status: addTransactionForm.status,
    };

    setTransactionsList(prev => [newTransaction, ...prev]);
    
    // Update card balance if it's an expense
    if (addTransactionForm.type === 'expense') {
      // Note: This would require managing cards state here or using a shared state
      // For now, we'll just add the transaction
    } else {
      // Update card balance if it's income
      // Note: This would require managing cards state here or using a shared state
      // For now, we'll just add the transaction
    }

    setAddTransactionForm({
      clientId: '',
      type: 'income',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      dateObj: new Date(),
      time: format(new Date(), 'HH:mm'),
      cardId: '',
      status: 'completed',
    });
    setAddTransactionOpen(false);
    
    logger.userAction('Transactions', 'New transaction added', {
      transactionId: newTransaction.id,
      clientId: newTransaction.clientId,
      amount: newTransaction.amount,
      type: newTransaction.type
    });
  };

  return (
    <PageTransition>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'transactions' | 'analytics')} className="w-full">
        <div className="space-y-6 content-bleed min-h-[calc(100vh-var(--header-h)-2rem)]">
          {/* Header with Tabs */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
              <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                <TabsTrigger 
                  value="transactions" 
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    activeTab === 'transactions' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "hover:bg-background/50"
                  )}
                >
                  Transactions
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className={cn(
                    "inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                    activeTab === 'analytics' 
                      ? "bg-background text-foreground shadow-sm font-semibold" 
                      : "hover:bg-background/50"
                  )}
                >
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>
            <p className="text-muted-foreground">
              View and manage all your financial transactions
            </p>
          </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="Income"
            value={stats.totalIncome}
            icon={ArrowUpRight}
            iconColor="green"
            delay={0}
          />
          <MetricCard
            title="Expenses"
            value={stats.totalExpense}
            icon={ArrowDownRight}
            iconColor="red"
            delay={0.1}
          />
          <MetricCard
            title="Profit"
            value={stats.netAmount >= 0 ? `+$${stats.netAmount.toLocaleString()}` : `$${stats.netAmount.toLocaleString()}`}
            icon={stats.netAmount >= 0 ? TrendingUp : TrendingDown}
            iconColor={stats.netAmount >= 0 ? "blue" : "red"}
            delay={0.2}
          />
          <MetricCard
            title="Cash Flow"
            value={stats.cashFlow >= 0 ? `+$${stats.cashFlow.toLocaleString()}` : `$${stats.cashFlow.toLocaleString()}`}
            icon={Activity}
            iconColor="purple"
            delay={0.3}
          />
          <MetricCard
            title="Operations"
            value={stats.operationsCount.toString()}
            icon={DollarSign}
            iconColor="orange"
            delay={0.4}
          />
          <MetricCard
            title="Unpaid"
            value={stats.unpaidAmount}
            icon={Clock}
            iconColor="orange"
            delay={0.5}
          />
        </div>

        {/* Enhanced Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by comment, client, or case..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    logger.userAction('Transactions', 'Search query input', {
                      query: e.target.value
                    });
                  }}
                  className="pl-9 h-11"
                />
              </div>
              
              {/* Filter Row */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Date Range Filter */}
                <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant={dateFrom || dateTo ? "default" : "outline"}
                      size="sm"
                      className={cn(
                        "h-9 relative",
                        (dateFrom || dateTo) && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                      onClick={() => {
                        setFiltersOpen(!filtersOpen);
                        logger.userAction('Transactions', 'Open date range filter');
                      }}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {dateFrom || dateTo ? (
                        <span className="text-xs font-medium">
                          {dateFrom ? format(dateFrom, 'dd.MM.yyyy') : '...'} - {dateTo ? format(dateTo, 'dd.MM.yyyy') : '...'}
                        </span>
                      ) : (
                        <span>Date Range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4" align="start">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Date Range</Label>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">From</Label>
                            <Calendar
                              value={dateFrom}
                              onChange={(date) => {
                                setDateFrom(date);
                                logger.userAction('Transactions', 'Set date from', { date: date ? format(date, 'yyyy-MM-dd') : null });
                              }}
                              placeholder="Start date"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs text-muted-foreground">To</Label>
                            <Calendar
                              value={dateTo}
                              onChange={(date) => {
                                setDateTo(date);
                                logger.userAction('Transactions', 'Set date to', { date: date ? format(date, 'yyyy-MM-dd') : null });
                              }}
                              placeholder="End date"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              setDateFrom(undefined);
                              setDateTo(undefined);
                              logger.userAction('Transactions', 'Clear date range');
                            }}
                          >
                            Clear
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              const now = new Date();
                              setDateFrom(startOfMonth(now));
                              setDateTo(endOfMonth(now));
                              logger.userAction('Transactions', 'Set this month');
                            }}
                          >
                            This Month
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={() => {
                              const now = new Date();
                              setDateFrom(new Date(now.getFullYear(), 0, 1));
                              setDateTo(new Date(now.getFullYear(), 11, 31));
                              logger.userAction('Transactions', 'Set this year');
                            }}
                          >
                            This Year
                          </Button>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <Select value={typeFilter} onValueChange={(value) => {
                  logger.userAction('Transactions', 'Change type filter', {
                    from: typeFilter,
                    to: value
                  });
                  setTypeFilter(value);
                }}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={(value) => {
                  logger.userAction('Transactions', 'Change status filter', {
                    from: statusFilter,
                    to: value
                  });
                  setStatusFilter(value);
                }}>
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex-1" />

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => setAddTransactionOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  + Income
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={() => {
                    setAddTransactionForm(prev => ({ ...prev, type: 'expense' }));
                    setAddTransactionOpen(true);
                  }}
                >
                  - Expense
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

          {/* Main Tabs Content */}
          <TabsContent value="transactions" className="mt-0">
            {/* Enhanced Transaction Journal */}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Receipt className="h-5 w-5" />
                    Transaction Journal
                  </CardTitle>
                  <div className="text-sm text-muted-foreground">
                    {filtered.length} transactions
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/80 border-b">
                      <tr>
                        <th 
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('date')}
                        >
                          <div className="flex items-center gap-2">
                            Date/Time
                            {sortField === 'date' && sortDirection && (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('type')}
                        >
                          <div className="flex items-center gap-2">
                            Type
                            {sortField === 'type' && sortDirection && (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('category')}
                        >
                          Article
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Method
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Account
                        </th>
                        <th 
                          className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('income')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Income
                            {sortField === 'income' && sortDirection && (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('expense')}
                        >
                          <div className="flex items-center justify-end gap-2">
                            Expenses
                            {sortField === 'expense' && sortDirection && (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th 
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                          onClick={() => handleSort('status')}
                        >
                          <div className="flex items-center gap-2">
                            Status
                            {sortField === 'status' && sortDirection && (
                              sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                            )}
                          </div>
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filtered.map((transaction, index) => {
                        const paymentMethod = getPaymentMethod(transaction);
                        const account = getAccount(transaction);
                        const transactionDate = parseISO(transaction.date);
                        
                        return (
                          <motion.tr
                            key={transaction.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.01 }}
                            className="hover:bg-gray-50/50 transition-colors group"
                          >
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {format(transactionDate, 'dd.MM.yyyy')}
                              </div>
                              <div className="text-xs text-gray-500">
                                {format(transactionDate, 'HH:mm')}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                                transaction.type === 'income' 
                                  ? "bg-green-100 text-green-800 border border-green-200" 
                                  : "bg-red-100 text-red-800 border border-red-200"
                              )}>
                                {transaction.type === 'income' ? (
                                  <>
                                    <ArrowUpRight className="h-3 w-3 mr-1" />
                                    Income
                                  </>
                                ) : (
                                  <>
                                    <ArrowDownRight className="h-3 w-3 mr-1" />
                                    Expense
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-900 font-medium">
                                {transaction.category}
                              </div>
                              <div className="text-xs text-gray-500 truncate max-w-[200px]">
                                {transaction.description}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-semibold text-primary">
                                    {transaction.clientName.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {transaction.clientName}
                                  </div>
                                  <div className="text-xs text-gray-500 font-mono">
                                    {transaction.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                {paymentMethod === 'Cash' ? (
                                  <Wallet className="h-3 w-3 mr-1" />
                                ) : (
                                  <CreditCard className="h-3 w-3 mr-1" />
                                )}
                                {paymentMethod}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-700">
                                {account}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              {transaction.type === 'income' ? (
                                <span className="text-sm font-semibold text-green-600">
                                  +${transaction.amount.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {transaction.type === 'expense' ? (
                                <span className="text-sm font-semibold text-red-600">
                                  -${transaction.amount.toLocaleString()}
                                </span>
                              ) : (
                                <span className="text-sm text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                                transaction.status === 'completed' 
                                  ? "bg-green-100 text-green-800 border-green-200" 
                                  : transaction.status === 'pending'
                                  ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  : "bg-red-100 text-red-800 border-red-200"
                              )}>
                                {getStatusIcon(transaction.status)}
                                <span className="ml-1 capitalize">
                                  {transaction.status === 'completed' ? 'Completed' : 
                                   transaction.status === 'pending' ? 'Pending' : 'Failed'}
                                </span>
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {filtered.length === 0 && (
                  <div className="p-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Search className="h-8 w-8 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold mb-1">No transactions found</p>
                        <p className="text-sm text-muted-foreground">
                          Try adjusting your search or filter criteria
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {/* Analytics Sub-tabs — panel-style nav */}
            <Tabs value={analyticsTab} onValueChange={(v) => setAnalyticsTab(v as any)} className="w-full">
              <TabsList
                className="grid w-full grid-cols-2 sm:grid-cols-5 gap-1.5 sm:gap-2 p-1.5 mb-6 h-auto rounded-2xl border border-black/[0.06] bg-transparent"
                style={{
                  background: 'linear-gradient(135deg, rgba(241,245,249,0.95) 0%, rgba(226,232,240,0.7) 100%)',
                  boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.9), 0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                {[
                  { value: 'trends', label: 'Trends', Icon: TrendingUp },
                  { value: 'categories', label: 'Categories', Icon: PieChart },
                  { value: 'clients', label: 'Clients', Icon: Users },
                  { value: 'statuses', label: 'Statuses', Icon: Activity },
                  { value: 'comparison', label: 'Comparison', Icon: BarChart3 },
                ].map(({ value, label, Icon }) => (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className={cn(
                      'flex items-center justify-center gap-2 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium transition-all duration-200',
                      'data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-black/[0.08]',
                      'data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:bg-white/60 data-[state=inactive]:bg-transparent'
                    )}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="trends" className="mt-0">
                <GlassChartCard title="Time Trends" delay={0} className="w-full" style={{ minHeight: 420 }}>
                  <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="tx-colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={INCOME_COLOR} stopOpacity={0.06} />
                          </linearGradient>
                          <linearGradient id="tx-colorExpense" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={EXPENSE_COLOR} stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="tx-strokeIncome" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={INCOME_COLOR} />
                            <stop offset="100%" stopColor="#14b8a6" />
                          </linearGradient>
                          <linearGradient id="tx-strokeExpense" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor={EXPENSE_COLOR} />
                            <stop offset="100%" stopColor="#fb7185" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                        <XAxis dataKey="month" {...CHART_AXIS} />
                        <YAxis {...CHART_AXIS} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value: number) => [`$${Number(value).toLocaleString()}`, undefined]}
                          labelFormatter={(label) => label}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: 12 }}
                          formatter={(name) => <span className="text-sm font-medium text-foreground/90">{name}</span>}
                          iconType="circle"
                          iconSize={10}
                        />
                        <Area
                          type="monotone"
                          dataKey="income"
                          stroke={`url(#tx-strokeIncome)`}
                          strokeWidth={2.5}
                          fill="url(#tx-colorIncome)"
                          name="Income"
                          dot={{ r: 4, fill: INCOME_COLOR, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: INCOME_COLOR, strokeWidth: 2, stroke: '#fff' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="expense"
                          stroke={`url(#tx-strokeExpense)`}
                          strokeWidth={2.5}
                          fill="url(#tx-colorExpense)"
                          name="Expenses"
                          dot={{ r: 4, fill: EXPENSE_COLOR, strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: EXPENSE_COLOR, strokeWidth: 2, stroke: '#fff' }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </GlassChartCard>
              </TabsContent>

              <TabsContent value="categories" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <GlassChartCard title="Category Distribution" delay={0} className="w-full" style={{ minHeight: 420 }}>
                    <div className="h-[380px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <defs>
                            {categoryData.slice(0, 6).map((_, i) => (
                              <linearGradient key={i} id={`tx-cat-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={COLORS[i]} stopOpacity={1} />
                                <stop offset="100%" stopColor={COLORS[i]} stopOpacity={0.75} />
                              </linearGradient>
                            ))}
                          </defs>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius="38%"
                            outerRadius="72%"
                            paddingAngle={3}
                            dataKey="value"
                            labelLine={false}
                            label={({ name, percent }) =>
                              percent >= 0.05 ? `${name} ${(percent * 100).toFixed(0)}%` : ''
                            }
                          >
                            {categoryData.map((_, i) => (
                              <Cell key={i} fill={`url(#tx-cat-grad-${i % 6})`} stroke="rgba(255,255,255,0.4)" strokeWidth={1.5} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(value: number, name: string, props: { payload?: { name?: string }[] }) => {
                              const total = categoryData.reduce((s, c) => s + c.value, 0);
                              const p = total ? ((value / total) * 100).toFixed(1) : '0';
                              const label = props?.payload?.[0]?.name ?? name;
                              return [`$${Number(value).toLocaleString()} (${p}%)`, label];
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassChartCard>
                  <GlassChartCard title="Top Categories" delay={0.05} className="w-full" style={{ minHeight: 420 }}>
                    <div className="space-y-3 max-h-[380px] overflow-y-auto dashboard-card-scroll pr-1">
                      {categoryData.slice(0, 6).map((cat, idx) => {
                        const total = categoryData.reduce((s, c) => s + c.value, 0);
                        const pct = total > 0 ? (cat.value / total) * 100 : 0;
                        const color = COLORS[idx % COLORS.length];
                        return (
                          <div
                            key={cat.name}
                            className="flex items-center gap-3 p-3 rounded-2xl transition-colors hover:bg-black/[0.03]"
                            style={{ background: 'rgba(255,255,255,0.04)' }}
                          >
                            <div
                              className="h-3.5 w-3.5 rounded-full flex-shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
                                boxShadow: `0 2px 6px ${color}40`,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <span className="font-medium text-foreground truncate">{cat.name}</span>
                                <span className="font-semibold text-foreground/90 flex-shrink-0">
                                  ${cat.value.toLocaleString()}
                                </span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-black/[0.06] overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500 min-w-[6px]"
                                  style={{
                                    width: `${pct}%`,
                                    background: `linear-gradient(90deg, ${color} 0%, ${color}bb 100%)`,
                                    boxShadow: `0 0 8px ${color}50`,
                                  }}
                                />
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Income: ${cat.income.toLocaleString()} · Expense: ${cat.expense.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassChartCard>
                </div>
              </TabsContent>

              <TabsContent value="clients" className="mt-0">
                <GlassChartCard title="Top Clients by Income" delay={0} className="w-full" style={{ minHeight: 420 }}>
                  <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={clientData}
                        layout="vertical"
                        margin={{ top: 12, right: 24, left: 8, bottom: 12 }}
                      >
                        <defs>
                          {COLORS.map((c, i) => (
                            <linearGradient key={i} id={`tx-client-bar-${i}`} x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor={c} stopOpacity={0.88} />
                              <stop offset="100%" stopColor={c} stopOpacity={1} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                        <XAxis
                          type="number"
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                          stroke="rgba(0,0,0,0.35)"
                          tick={{ fill: 'rgba(0,0,0,0.6)', fontSize: 12, fontWeight: 500 }}
                          tickLine={{ stroke: 'rgba(0,0,0,0.15)' }}
                          axisLine={{ stroke: 'rgba(0,0,0,0.12)' }}
                          domain={[0, (dataMax: number) => Math.ceil((dataMax * 1.12) / 50000) * 50000]}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={140}
                          stroke="rgba(0,0,0,0.35)"
                          tick={{ fill: 'rgba(0,0,0,0.75)', fontSize: 13, fontWeight: 500 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value: number) => [`$${Number(value).toLocaleString()}`, 'Income']}
                          labelFormatter={(l) => l}
                          cursor={{ fill: 'rgba(0,0,0,0.04)', radius: 4 }}
                        />
                        <Bar
                          dataKey="amount"
                          name="Income"
                          radius={[0, 8, 8, 0]}
                          barSize={28}
                          minPointSize={8}
                        >
                          {clientData.map((_, i) => (
                            <Cell key={i} fill={`url(#tx-client-bar-${i % COLORS.length})`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassChartCard>
              </TabsContent>

              <TabsContent value="statuses" className="mt-0">
                <div className="grid gap-6 md:grid-cols-2">
                  <GlassChartCard title="Transaction Statuses" delay={0} className="w-full" style={{ minHeight: 420 }}>
                    <div className="h-[380px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsPieChart>
                          <defs>
                            <linearGradient id="tx-st-completed" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#0d9488" />
                              <stop offset="100%" stopColor="#14b8a6" />
                            </linearGradient>
                            <linearGradient id="tx-st-pending" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f59e0b" />
                              <stop offset="100%" stopColor="#fbbf24" />
                            </linearGradient>
                            <linearGradient id="tx-st-failed" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#f87171" />
                              <stop offset="100%" stopColor="#fb7185" />
                            </linearGradient>
                          </defs>
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            innerRadius="38%"
                            outerRadius="72%"
                            paddingAngle={3}
                            dataKey="value"
                            labelLine={false}
                            label={({ name }) => name}
                          >
                            {statusData.map((entry, index) => (
                              <Cell
                                key={entry.name}
                                fill={index === 0 ? 'url(#tx-st-completed)' : index === 1 ? 'url(#tx-st-pending)' : 'url(#tx-st-failed)'}
                                stroke="rgba(255,255,255,0.4)"
                                strokeWidth={1.5}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            formatter={(value: number, name: string) => {
                              const item = statusData.find((d) => d.name === name);
                              return [`${value} (${item?.percent ?? '0'}%)`, name];
                            }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassChartCard>
                  <GlassChartCard title="Status Details" delay={0.05} className="w-full" style={{ minHeight: 420 }}>
                    <div className="space-y-3 max-h-[380px] overflow-y-auto dashboard-card-scroll pr-1">
                      {statusData.map((status, idx) => {
                        const styles = [
                          { bg: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)', shadow: '#0d948840' },
                          { bg: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)', shadow: '#f59e0b40' },
                          { bg: 'linear-gradient(135deg, #f87171 0%, #fb7185 100%)', shadow: '#f8717140' },
                        ][idx];
                        return (
                          <div
                            key={status.name}
                            className="flex items-center justify-between p-4 rounded-2xl transition-colors hover:bg-black/[0.03]"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,0,0,0.05)' }}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className="h-3.5 w-3.5 rounded-full flex-shrink-0"
                                style={{ background: styles.bg, boxShadow: `0 2px 8px ${styles.shadow}` }}
                              />
                              <span className="font-medium text-foreground">{status.name}</span>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-lg text-foreground">{status.value}</p>
                              <p className="text-sm text-muted-foreground">{status.percent}%</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </GlassChartCard>
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="mt-0">
                <GlassChartCard title="Income vs Expenses Comparison" delay={0} className="w-full" style={{ minHeight: 420 }}>
                  <div className="h-[380px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="tx-comp-income" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor={INCOME_COLOR} stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#14b8a6" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="tx-comp-expenses" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor={EXPENSE_COLOR} stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#fb7185" stopOpacity={1} />
                          </linearGradient>
                          <linearGradient id="tx-comp-net" x1="0" y1="1" x2="0" y2="0">
                            <stop offset="0%" stopColor={NET_COLOR} stopOpacity={0.9} />
                            <stop offset="100%" stopColor="#0ea5e9" stopOpacity={1} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                        <XAxis dataKey="month" {...CHART_AXIS} />
                        <YAxis
                          {...CHART_AXIS}
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                          domain={(dataMin, dataMax) => [
                            Math.min(0, dataMin - 10000),
                            Math.max(0, dataMax + 10000),
                          ]}
                        />
                        <Tooltip
                          contentStyle={TOOLTIP_STYLE}
                          formatter={(value: number, name) => [`$${Number(value).toLocaleString()}`, name]}
                          labelFormatter={(l) => l}
                          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: 12 }}
                          formatter={(name) => <span className="text-sm font-medium text-foreground/90">{name}</span>}
                          iconType="circle"
                          iconSize={10}
                        />
                        <Bar dataKey="Income" fill="url(#tx-comp-income)" name="Income" radius={[6, 6, 0, 0]} maxBarSize={36} />
                        <Bar dataKey="Expenses" fill="url(#tx-comp-expenses)" name="Expenses" radius={[6, 6, 0, 0]} maxBarSize={36} />
                        <Bar dataKey="Net" fill="url(#tx-comp-net)" name="Net Profit" radius={[6, 6, 0, 0]} maxBarSize={36} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassChartCard>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Add Transaction Dialog */}
        <Dialog open={addTransactionOpen} onOpenChange={setAddTransactionOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Transaction
              </DialogTitle>
              <DialogDescription>
                Add a new transaction. Select an account/card and fill in the required details.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="transaction-card">Account / Card *</Label>
                <Select
                  value={addTransactionForm.cardId}
                  onValueChange={(v) => setAddTransactionForm(f => ({ ...f, cardId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a card" />
                  </SelectTrigger>
                  <SelectContent>
                    {bankCards.map((card) => (
                      <SelectItem key={card.id} value={card.id}>
                        {card.holder} - {card.type.toUpperCase()} • ${card.amount.toLocaleString()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transaction-client">Client *</Label>
                <Select
                  value={addTransactionForm.clientId}
                  onValueChange={(v) => setAddTransactionForm(f => ({ ...f, clientId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="transaction-type">Type *</Label>
                  <Select
                    value={addTransactionForm.type}
                    onValueChange={(v: 'income' | 'expense') => setAddTransactionForm(f => ({ ...f, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transaction-status">Status *</Label>
                  <Select
                    value={addTransactionForm.status}
                    onValueChange={(v: 'completed' | 'pending' | 'failed') => setAddTransactionForm(f => ({ ...f, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transaction-category">Category *</Label>
                <Input
                  id="transaction-category"
                  value={addTransactionForm.category}
                  onChange={(e) => setAddTransactionForm(f => ({ ...f, category: e.target.value }))}
                  placeholder="Session Payment"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transaction-amount">Amount ($) *</Label>
                <Input
                  id="transaction-amount"
                  type="number"
                  min={0}
                  step="0.01"
                  value={addTransactionForm.amount}
                  onChange={(e) => setAddTransactionForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="220"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="transaction-description">Description</Label>
                <Input
                  id="transaction-description"
                  value={addTransactionForm.description}
                  onChange={(e) => setAddTransactionForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Individual Therapy Session"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="transaction-date">Date *</Label>
                  <Calendar
                    value={addTransactionForm.dateObj}
                    onChange={(date) => {
                      if (date) {
                        setAddTransactionForm(f => ({ 
                          ...f, 
                          dateObj: date,
                          date: format(date, 'yyyy-MM-dd')
                        }));
                      }
                    }}
                    placeholder="Select date"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="transaction-time">Time *</Label>
                  <TimePicker
                    value={addTransactionForm.time}
                    onChange={(time) => setAddTransactionForm(f => ({ ...f, time }))}
                    placeholder="HH:mm"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddTransactionOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAddTransaction}
                disabled={!addTransactionForm.clientId || !addTransactionForm.amount.trim() || !addTransactionForm.cardId || !addTransactionForm.category.trim() || parseFloat(addTransactionForm.amount) <= 0}
              >
                Add Transaction
              </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </Tabs>
    </PageTransition>
  );
}