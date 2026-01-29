import { useState, useMemo } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { invoices, clients, type Invoice } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Download, 
  Eye, 
  Plus,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  MoreVertical,
  Calendar,
  DollarSign,
  TrendingUp,
  FilePlus
} from 'lucide-react';
import { format, parseISO, differenceInDays, startOfDay, isAfter, isBefore } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

function generateInvoiceId(list: Invoice[]) {
  const numIds = list
    .map(inv => parseInt(inv.id.replace(/\D/g, ''), 10))
    .filter(n => !isNaN(n));
  const next = numIds.length ? Math.max(...numIds) + 1 : 1;
  return `inv${next}`;
}

export default function Invoices() {
  const [invoicesList, setInvoicesList] = useState<Invoice[]>(() => [...invoices]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [createInvoiceOpen, setCreateInvoiceOpen] = useState(false);
  const [createInvoiceForm, setCreateInvoiceForm] = useState({
    clientId: '',
    amount: '',
    dueDate: new Date(),
    description: 'Therapy Session',
  });
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
  const [infoDialog, setInfoDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  const showInfo = (title: string, message: string) => {
    setInfoDialog({ open: true, title, message });
  };

  const handleCreateInvoice = () => {
    const client = clients.find(c => c.id === createInvoiceForm.clientId);
    if (!client || !createInvoiceForm.amount.trim()) return;
    const amount = parseFloat(createInvoiceForm.amount);
    if (isNaN(amount) || amount <= 0) return;
    const id = generateInvoiceId(invoicesList);
    const date = format(new Date(), 'yyyy-MM-dd');
    const newInvoice: Invoice = {
      id,
      clientId: client.id,
      clientName: client.name,
      amount,
      date,
      dueDate: format(createInvoiceForm.dueDate, 'yyyy-MM-dd'),
      status: 'draft',
      items: [
        { description: createInvoiceForm.description, quantity: 1, price: amount }
      ],
    };
    setInvoicesList(prev => [...prev, newInvoice]);
    setCreateInvoiceForm({
      clientId: '',
      amount: '',
      dueDate: new Date(),
      description: 'Therapy Session',
    });
    setCreateInvoiceOpen(false);
  };

  const filtered = invoicesList.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    
    // Date range filter
    let matchesDateRange = true;
    if (dateRange.from || dateRange.to) {
      const invoiceDate = startOfDay(parseISO(invoice.date));
      if (dateRange.from) {
        const fromDate = startOfDay(dateRange.from);
        if (isBefore(invoiceDate, fromDate)) {
          matchesDateRange = false;
        }
      }
      if (dateRange.to) {
        const toDate = startOfDay(dateRange.to);
        if (isAfter(invoiceDate, toDate)) {
          matchesDateRange = false;
        }
      }
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  // Calculate stats
  const stats = useMemo(() => {
    const totalAmount = filtered
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const pendingAmount = filtered
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const overdueAmount = filtered
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + inv.amount, 0);
    
    const paidCount = filtered.filter(inv => inv.status === 'paid').length;
    const pendingCount = filtered.filter(inv => inv.status === 'pending').length;
    const overdueCount = filtered.filter(inv => inv.status === 'overdue').length;
    
    return {
      totalAmount,
      pendingAmount,
      overdueAmount,
      paidCount,
      pendingCount,
      overdueCount,
      totalCount: filtered.length
    };
  }, [filtered]);

  // Sort invoices by date (newest first)
  const sortedInvoices = useMemo(() => {
    return [...filtered].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [filtered]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          color: 'bg-green-50 text-green-700 border-green-200',
          bgGradient: 'from-green-50 to-emerald-50',
          iconBg: 'bg-green-100',
          iconColor: 'text-green-600'
        };
      case 'pending':
        return {
          icon: <Clock className="h-4 w-4" />,
          color: 'bg-yellow-50 text-yellow-700 border-yellow-200',
          bgGradient: 'from-yellow-50 to-amber-50',
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600'
        };
      case 'overdue':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          color: 'bg-red-50 text-red-700 border-red-200',
          bgGradient: 'from-red-50 to-rose-50',
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600'
        };
      case 'draft':
        return {
          icon: <Edit className="h-4 w-4" />,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          bgGradient: 'from-gray-50 to-slate-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
      default:
        return {
          icon: <FileText className="h-4 w-4" />,
          color: 'bg-gray-50 text-gray-700 border-gray-200',
          bgGradient: 'from-gray-50 to-slate-50',
          iconBg: 'bg-gray-100',
          iconColor: 'text-gray-600'
        };
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    return days;
  };

  return (
    <PageTransition>
      <div className="space-y-6 content-bleed min-h-[calc(100vh-var(--header-h)-2rem)]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your invoices
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button className="gap-2" onClick={() => setCreateInvoiceOpen(true)}>
              <FilePlus className="h-4 w-4" />
              Create Invoice
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <div className="grid grid-cols-2 gap-0.5 h-4 w-4">
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
                <div className="bg-current rounded-sm" />
              </div>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <div className="flex flex-col gap-0.5 h-4 w-4">
                <div className="h-0.5 w-full bg-current rounded" />
                <div className="h-0.5 w-full bg-current rounded" />
                <div className="h-0.5 w-full bg-current rounded" />
              </div>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Paid Amount"
            value={stats.totalAmount}
            icon={CheckCircle2}
            iconColor="green"
            delay={0}
          />
          <MetricCard
            title="Pending Amount"
            value={stats.pendingAmount}
            icon={Clock}
            iconColor="orange"
            delay={0.1}
          />
          <MetricCard
            title="Overdue Amount"
            value={stats.overdueAmount}
            icon={AlertCircle}
            iconColor="red"
            delay={0.2}
          />
          <MetricCard
            title="Total Invoices"
            value={stats.totalCount}
            icon={FileText}
            iconColor="blue"
            delay={0.3}
          />
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[250px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by client name or invoice ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-11">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "h-11 w-[240px] justify-start text-left font-normal",
                      !dateRange.from && !dateRange.to && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} - {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
                      )
                    ) : (
                      <span>Date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="flex flex-col gap-4 p-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">From date</Label>
                      <CalendarComponent
                        value={dateRange.from}
                        onChange={(date) => {
                          setDateRange(prev => ({ ...prev, from: date }));
                        }}
                        placeholder="Select start date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">To date</Label>
                      <CalendarComponent
                        value={dateRange.to}
                        onChange={(date) => {
                          setDateRange(prev => ({ ...prev, to: date }));
                        }}
                        placeholder="Select end date"
                      />
                    </div>
                    {(dateRange.from || dateRange.to) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDateRange({})}
                        className="w-full"
                      >
                        Clear filter
                      </Button>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>

        {/* Invoices */}
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {sortedInvoices.map((invoice, index) => {
                const statusConfig = getStatusConfig(invoice.status);
                const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                
                return (
                  <motion.div
                    key={invoice.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Card className={cn(
                      "border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group",
                      `bg-gradient-to-br ${statusConfig.bgGradient}`
                    )}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className={cn(
                                "h-10 w-10 rounded-lg flex items-center justify-center",
                                statusConfig.iconBg
                              )}>
                                <FileText className={cn("h-5 w-5", statusConfig.iconColor)} />
                              </div>
                              <div>
                                <p className="font-mono text-xs text-muted-foreground mb-0.5">
                                  {invoice.id}
                                </p>
                                <p className="font-semibold text-sm">
                                  {invoice.clientName}
                                </p>
                              </div>
                            </div>
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                              statusConfig.color
                            )}>
                              {statusConfig.icon}
                              {invoice.status}
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => showInfo('More actions', `Invoice ${invoice.id}. Edit and delete will be available later.`)}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div>
                            <p className="text-2xl font-bold mb-1">
                              ${invoice.amount.toLocaleString()}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span>Issued: {format(parseISO(invoice.date), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 mt-1 text-xs">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                Due: {format(parseISO(invoice.dueDate), 'MMM dd, yyyy')}
                              </span>
                              {invoice.status === 'pending' && daysUntilDue >= 0 && (
                                <span className={cn(
                                  "ml-2 px-1.5 py-0.5 rounded text-xs font-medium",
                                  daysUntilDue <= 7 
                                    ? "bg-orange-100 text-orange-700" 
                                    : "bg-blue-100 text-blue-700"
                                )}>
                                  {daysUntilDue === 0 
                                    ? 'Due today' 
                                    : `${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''} left`}
                                </span>
                              )}
                              {invoice.status === 'overdue' && (
                                <span className="ml-2 px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                  {Math.abs(daysUntilDue)} day{Math.abs(daysUntilDue) !== 1 ? 's' : ''} overdue
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 gap-2"
                              onClick={() => setViewInvoice(invoice)}
                            >
                              <Eye className="h-4 w-4" />
                              View
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1 gap-2"
                              onClick={() =>
                                showInfo('Download invoice', `Downloading invoice ${invoice.id} is not implemented in this demo yet.`)
                              }
                            >
                              <Download className="h-4 w-4" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <Card className="border-0 shadow-md overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Invoice ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sortedInvoices.map((invoice, index) => {
                        const statusConfig = getStatusConfig(invoice.status);
                        const daysUntilDue = getDaysUntilDue(invoice.dueDate);
                        
                        return (
                          <motion.tr
                            key={invoice.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3">
                              <p className="font-mono text-sm font-medium">{invoice.id}</p>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-sm">{invoice.clientName}</p>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <p className="font-bold text-base">
                                ${invoice.amount.toLocaleString()}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(parseISO(invoice.date), 'MMM dd, yyyy')}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {format(parseISO(invoice.dueDate), 'MMM dd, yyyy')}
                                </div>
                                {invoice.status === 'pending' && daysUntilDue >= 0 && (
                                  <span className={cn(
                                    "px-1.5 py-0.5 rounded text-xs font-medium",
                                    daysUntilDue <= 7 
                                      ? "bg-orange-100 text-orange-700" 
                                      : "bg-blue-100 text-blue-700"
                                  )}>
                                    {daysUntilDue === 0 
                                      ? 'Due today' 
                                      : `${daysUntilDue}d left`}
                                  </span>
                                )}
                                {invoice.status === 'overdue' && (
                                  <span className="px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                                    {Math.abs(daysUntilDue)}d overdue
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                                statusConfig.color
                              )}>
                                {statusConfig.icon}
                                {invoice.status}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() => setViewInvoice(invoice)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() =>
                                    showInfo('Download invoice', `Downloading invoice ${invoice.id} is not implemented in this demo yet.`)
                                  }
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={() =>
                                    showInfo('More actions', `Additional actions for invoice ${invoice.id} will be available later.`)
                                  }
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </AnimatePresence>

        {filtered.length === 0 && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <div>
                  <p className="text-lg font-semibold mb-1">No invoices found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
                <Button className="mt-2 gap-2" onClick={() => setCreateInvoiceOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Create New Invoice
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Dialog open={!!viewInvoice} onOpenChange={(open) => !open && setViewInvoice(null)}>
          <DialogContent className="sm:max-w-md">
            {viewInvoice && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Invoice {viewInvoice.id}
                  </DialogTitle>
                  <DialogDescription>
                    Invoice details
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{viewInvoice.clientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-semibold">${viewInvoice.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{format(parseISO(viewInvoice.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due date</span>
                    <span>{format(parseISO(viewInvoice.dueDate), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">{viewInvoice.status}</span>
                  </div>
                  {viewInvoice.items?.length > 0 && (
                    <div className="border-t pt-3 space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">Items</p>
                      <ul className="text-sm space-y-1">
                        {viewInvoice.items.map((item, i) => (
                          <li key={i} className="flex justify-between">
                            <span>{item.description}</span>
                            <span>${(item.quantity * item.price).toLocaleString()}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewInvoice(null)}>Close</Button>
                  <Button variant="outline" onClick={() => showInfo('Download', `Export for invoice ${viewInvoice.id} will be available later.`)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={createInvoiceOpen} onOpenChange={setCreateInvoiceOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FilePlus className="h-5 w-5" />
                New invoice
              </DialogTitle>
              <DialogDescription>
                Create an invoice for a client. Amount and client are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Client *</Label>
                <Select
                  value={createInvoiceForm.clientId}
                  onValueChange={(v) => setCreateInvoiceForm(f => ({ ...f, clientId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name} ({c.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-amount">Amount ($) *</Label>
                <Input
                  id="inv-amount"
                  type="number"
                  min={1}
                  value={createInvoiceForm.amount}
                  onChange={(e) => setCreateInvoiceForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="220"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-due">Due date</Label>
                <CalendarComponent
                  value={createInvoiceForm.dueDate}
                  onChange={(date) => {
                    if (date) {
                      setCreateInvoiceForm(f => ({ ...f, dueDate: date }))
                    }
                  }}
                  placeholder="Select due date"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="inv-desc">Description</Label>
                <Input
                  id="inv-desc"
                  value={createInvoiceForm.description}
                  onChange={(e) => setCreateInvoiceForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Therapy Session"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateInvoiceOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvoice}
                disabled={!createInvoiceForm.clientId || !createInvoiceForm.amount.trim() || parseFloat(createInvoiceForm.amount) <= 0}
              >
                Create invoice
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={infoDialog.open} onOpenChange={(open) => setInfoDialog(prev => ({ ...prev, open }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{infoDialog.title || 'Info'}</DialogTitle>
              {infoDialog.message && <DialogDescription>{infoDialog.message}</DialogDescription>}
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setInfoDialog(prev => ({ ...prev, open: false }))}>OK</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}