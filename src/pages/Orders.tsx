import { useState, useMemo } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { orders, services, clients, type Order } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { 
  Search, 
  Package, 
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  MoreVertical,
  Calendar,
  User,
  Filter,
  Grid3x3,
  List,
  ShoppingCart,
  Tag,
  Users,
  BarChart3
} from 'lucide-react';
import { format } from 'date-fns';
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
import Services from './Services';

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [infoDialog, setInfoDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  const showInfo = (title: string, message: string) => {
    setInfoDialog({ open: true, title, message });
  };

  const filtered = orders.filter(order => {
    const matchesSearch = order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = useMemo(() => {
    const totalRevenue = filtered
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + order.total, 0);
    
    const totalOrders = filtered.length;
    const completedOrders = filtered.filter(order => order.status === 'completed').length;
    const processingOrders = filtered.filter(order => order.status === 'processing').length;
    const averageOrderValue = totalOrders > 0 
      ? filtered.reduce((sum, order) => sum + order.total, 0) / totalOrders 
      : 0;

    return {
      totalRevenue,
      totalOrders,
      completedOrders,
      processingOrders,
      averageOrderValue
    };
  }, [filtered]);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: {
        icon: <Clock className="h-3.5 w-3.5" />,
        color: 'bg-amber-50 text-amber-700 border-amber-200',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-800'
      },
      processing: {
        icon: <Package className="h-3.5 w-3.5" />,
        color: 'bg-blue-50 text-blue-700 border-blue-200',
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-800'
      },
      completed: {
        icon: <CheckCircle2 className="h-3.5 w-3.5" />,
        color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-800'
      },
      cancelled: {
        icon: <XCircle className="h-3.5 w-3.5" />,
        color: 'bg-red-50 text-red-700 border-red-200',
        bgColor: 'bg-red-100',
        textColor: 'text-red-800'
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  // Statistics calculations
  const servicesStats = useMemo(() => {
    const totalServices = services.length;
    const activeServices = services.filter(s => s.isActive).length;
    const totalValue = services.reduce((sum, s) => sum + s.price, 0);
    const avgPrice = totalServices > 0 ? totalValue / totalServices : 0;
    const categoryCounts = services.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalServices,
      activeServices,
      totalValue,
      avgPrice,
      categoryCounts
    };
  }, []);

  const clientsStats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const totalIncome = clients.reduce((sum, c) => sum + c.totalIncome, 0);
    const avgIncome = totalClients > 0 ? totalIncome / totalClients : 0;
    const totalSessions = clients.reduce((sum, c) => sum + c.sessions, 0);
    const avgSessions = totalClients > 0 ? totalSessions / totalClients : 0;
    
    return {
      totalClients,
      activeClients,
      totalIncome,
      avgIncome,
      totalSessions,
      avgSessions
    };
  }, []);

  const ordersStatsForStatistics = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const processingOrders = orders.filter(o => o.status === 'processing').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 
      ? orders.reduce((sum, o) => sum + o.total, 0) / totalOrders 
      : 0;
    
    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      processingOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue
    };
  }, []);

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Orders & Services
            </h1>
            <p className="text-muted-foreground mt-1.5">
              Manage orders and configure services
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-9 w-9"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-9 w-9"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-3">
            <TabsTrigger value="orders" className="gap-2">
              <ShoppingCart className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Tag className="h-4 w-4" />
              Services
            </TabsTrigger>
            <TabsTrigger value="statistics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6 mt-6">
            {/* Statistics Cards — в стиле дашборда */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Total Revenue"
            value={stats.totalRevenue}
            icon={DollarSign}
            iconColor="blue"
            delay={0}
          />
          <MetricCard
            title="Total Orders"
            value={stats.totalOrders.toString()}
            icon={ShoppingCart}
            iconColor="purple"
            delay={0.1}
          />
          <MetricCard
            title="Completed"
            value={stats.completedOrders.toString()}
            icon={CheckCircle2}
            iconColor="green"
            delay={0.2}
          />
          <MetricCard
            title="Avg. Order Value"
            value={Math.round(stats.averageOrderValue)}
            icon={TrendingUp}
            iconColor="orange"
            delay={0.3}
          />
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-[280px]">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by order ID, client name, or items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] h-10 border-gray-200">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table/Grid */}
        <AnimatePresence mode="wait">
          {viewMode === 'list' ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Order ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Client
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Items
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Total
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Date
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {filtered.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center">
                              <div className="flex flex-col items-center gap-2">
                                <Package className="h-12 w-12 text-gray-300" />
                                <p className="text-gray-500 font-medium">No orders found</p>
                                <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filtered.map((order, index) => {
                            const statusConfig = getStatusConfig(order.status);
                            return (
                              <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.02 }}
                                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200 group"
                              >
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="order-icon-box h-8 w-8">
                                      <Package className="h-4 w-4 text-violet-600" />
                                    </div>
                                    <p className="font-mono text-sm font-semibold text-gray-900">{order.id}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                      {order.clientName.charAt(0)}
                                    </div>
                                    <p className="font-medium text-sm text-gray-900">{order.clientName}</p>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-1 max-w-xs">
                                    {order.items.slice(0, 2).map((item, idx) => (
                                      <span key={idx} className="text-sm text-gray-700 bg-gray-50 px-2 py-1 rounded-md">
                                        {item}
                                      </span>
                                    ))}
                                    {order.items.length > 2 && (
                                      <span className="text-xs text-gray-500 font-medium">
                                        +{order.items.length - 2} more
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <p className="font-bold text-base text-gray-900">
                                    ${order.total.toLocaleString()}
                                  </p>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                                    {format(new Date(order.date), 'MMM dd, yyyy')}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border",
                                    statusConfig.color
                                  )}>
                                    {statusConfig.icon}
                                    <span className="capitalize">{order.status}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center justify-end gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => setViewOrder(order)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => showInfo('Download order', `Downloading order ${order.id} is not implemented in this demo yet.`)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => showInfo('More actions', `Additional actions for order ${order.id} will be available later.`)}
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </td>
                              </motion.tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch"
            >
              {filtered.length === 0 ? (
                <div className="col-span-full">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-12 text-center">
                      <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium text-lg mb-2">No orders found</p>
                      <p className="text-sm text-gray-400">Try adjusting your search or filters</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                filtered.map((order, index) => {
                  const statusConfig = getStatusConfig(order.status);
                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="h-full"
                    >
                      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group h-full flex flex-col">
                        <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200 flex-shrink-0">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="order-icon-box h-10 w-10">
                                <Package className="h-5 w-5 text-violet-600" />
                              </div>
                              <div>
                                <CardTitle className="text-base font-mono">{order.id}</CardTitle>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {format(new Date(order.date), 'MMM dd, yyyy')}
                                </p>
                              </div>
                            </div>
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                              statusConfig.color
                            )}>
                              {statusConfig.icon}
                              <span className="capitalize">{order.status}</span>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="p-5 flex flex-col flex-grow">
                          <div className="flex flex-col flex-grow space-y-4">
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                                {order.clientName.charAt(0)}
                              </div>
                              <p className="font-medium text-sm text-gray-900">{order.clientName}</p>
                            </div>
                            
                            <div className="space-y-2 flex-grow flex flex-col min-h-0">
                              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex-shrink-0">Items</p>
                              <div className="flex flex-col gap-1.5 flex-grow overflow-y-auto max-h-32">
                                {order.items.map((item, idx) => (
                                  <span key={idx} className="text-sm text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 flex-shrink-0">
                                    {item}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex-shrink-0">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</span>
                                <p className="text-xl font-bold text-gray-900">
                                  ${order.total.toLocaleString()}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 flex-shrink-0">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                onClick={() => setViewOrder(order)}
                              >
                                <Eye className="h-3.5 w-3.5 mr-1.5" />
                                View
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="flex-1 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                                onClick={() => showInfo('Download order', `Downloading order ${order.id} is not implemented in this demo yet.`)}
                              >
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Download
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <Dialog open={!!viewOrder} onOpenChange={(open) => !open && setViewOrder(null)}>
          <DialogContent className="sm:max-w-md">
            {viewOrder && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order {viewOrder.id}
                  </DialogTitle>
                  <DialogDescription>
                    Order details
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Client</span>
                    <span className="font-medium">{viewOrder.clientName}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date</span>
                    <span>{format(new Date(viewOrder.date), 'MMM dd, yyyy')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="capitalize">{viewOrder.status}</span>
                  </div>
                  <div className="border-t pt-3 space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Items</p>
                    <ul className="text-sm space-y-1">
                      {viewOrder.items.map((item, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex justify-between text-base font-semibold border-t pt-3">
                    <span>Total</span>
                    <span>${viewOrder.total.toLocaleString()}</span>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setViewOrder(null)}>Close</Button>
                  <Button variant="outline" onClick={() => showInfo('Download', `Export for order ${viewOrder.id} will be available later.`)}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </DialogFooter>
              </>
            )}
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
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Services />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6 mt-6">
            <Tabs defaultValue="services-stat" className="space-y-6">
              <TabsList className="grid w-full max-w-3xl grid-cols-3">
                <TabsTrigger value="services-stat" className="gap-2">
                  <Tag className="h-4 w-4" />
                  Services
                </TabsTrigger>
                <TabsTrigger value="clients-stat" className="gap-2">
                  <Users className="h-4 w-4" />
                  Clients
                </TabsTrigger>
                <TabsTrigger value="orders-stat" className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Orders
                </TabsTrigger>
              </TabsList>

              {/* Services Statistics */}
              <TabsContent value="services-stat" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Services"
                    value={servicesStats.totalServices.toString()}
                    icon={Tag}
                    iconColor="blue"
                    delay={0}
                  />
                  <MetricCard
                    title="Active Services"
                    value={servicesStats.activeServices.toString()}
                    icon={CheckCircle2}
                    iconColor="green"
                    delay={0.1}
                  />
                  <MetricCard
                    title="Total Value"
                    value={`$${Math.round(servicesStats.totalValue).toLocaleString()}`}
                    icon={DollarSign}
                    iconColor="purple"
                    delay={0.2}
                  />
                  <MetricCard
                    title="Avg. Price"
                    value={`$${Math.round(servicesStats.avgPrice)}`}
                    icon={TrendingUp}
                    iconColor="orange"
                    delay={0.3}
                  />
                </div>

                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Services by Category
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(servicesStats.categoryCounts).map(([category, count], index) => {
                        const percentage = (count / servicesStats.totalServices) * 100;
                        return (
                          <motion.div
                            key={category}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                          >
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-medium text-gray-700">{category}</span>
                              <span className="text-gray-500">{count} services ({Math.round(percentage)}%)</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                              />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Clients Statistics */}
              <TabsContent value="clients-stat" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Clients"
                    value={clientsStats.totalClients.toString()}
                    icon={Users}
                    iconColor="blue"
                    delay={0}
                  />
                  <MetricCard
                    title="Active Clients"
                    value={clientsStats.activeClients.toString()}
                    icon={CheckCircle2}
                    iconColor="green"
                    delay={0.1}
                  />
                  <MetricCard
                    title="Total Income"
                    value={`$${Math.round(clientsStats.totalIncome).toLocaleString()}`}
                    icon={DollarSign}
                    iconColor="purple"
                    delay={0.2}
                  />
                  <MetricCard
                    title="Avg. Income"
                    value={`$${Math.round(clientsStats.avgIncome)}`}
                    icon={TrendingUp}
                    iconColor="orange"
                    delay={0.3}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Total Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-3xl font-bold text-gray-900">{clientsStats.totalSessions}</p>
                          <p className="text-sm text-gray-500 mt-1">Total sessions across all clients</p>
                        </div>
                        <div className="pt-4 border-t">
                          <p className="text-lg font-semibold text-gray-700">
                            Avg. Sessions per Client: {Math.round(clientsStats.avgSessions)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Client Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                            <span className="text-sm font-medium">Active</span>
                          </div>
                          <span className="text-sm font-semibold">{clientsStats.activeClients}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-gray-400" />
                            <span className="text-sm font-medium">Inactive</span>
                          </div>
                          <span className="text-sm font-semibold">
                            {clientsStats.totalClients - clientsStats.activeClients}
                          </span>
                        </div>
                        <div className="pt-4">
                          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-500 to-green-600"
                              style={{ width: `${(clientsStats.activeClients / clientsStats.totalClients) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Orders Statistics */}
              <TabsContent value="orders-stat" className="space-y-6 mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <MetricCard
                    title="Total Orders"
                    value={ordersStatsForStatistics.totalOrders.toString()}
                    icon={ShoppingCart}
                    iconColor="blue"
                    delay={0}
                  />
                  <MetricCard
                    title="Completed"
                    value={ordersStatsForStatistics.completedOrders.toString()}
                    icon={CheckCircle2}
                    iconColor="green"
                    delay={0.1}
                  />
                  <MetricCard
                    title="Total Revenue"
                    value={`$${Math.round(ordersStatsForStatistics.totalRevenue).toLocaleString()}`}
                    icon={DollarSign}
                    iconColor="purple"
                    delay={0.2}
                  />
                  <MetricCard
                    title="Avg. Order Value"
                    value={`$${Math.round(ordersStatsForStatistics.avgOrderValue)}`}
                    icon={TrendingUp}
                    iconColor="orange"
                    delay={0.3}
                  />
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Order Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Completed</span>
                            </div>
                            <span className="text-sm font-semibold">{ordersStatsForStatistics.completedOrders}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-amber-600" />
                              <span className="text-sm font-medium">Pending</span>
                            </div>
                            <span className="text-sm font-semibold">{ordersStatsForStatistics.pendingOrders}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium">Processing</span>
                            </div>
                            <span className="text-sm font-semibold">{ordersStatsForStatistics.processingOrders}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <XCircle className="h-4 w-4 text-red-600" />
                              <span className="text-sm font-medium">Cancelled</span>
                            </div>
                            <span className="text-sm font-semibold">{ordersStatsForStatistics.cancelledOrders}</span>
                          </div>
                        </div>
                        <div className="pt-4 border-t">
                          <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Completed</span>
                              <span>{Math.round((ordersStatsForStatistics.completedOrders / ordersStatsForStatistics.totalOrders) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-green-500 to-green-600"
                                style={{ width: `${(ordersStatsForStatistics.completedOrders / ordersStatsForStatistics.totalOrders) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Revenue Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-3xl font-bold text-gray-900">
                            ${Math.round(ordersStatsForStatistics.totalRevenue).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">Total revenue from completed orders</p>
                        </div>
                        <div className="pt-4 border-t space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Average Order Value</span>
                            <span className="text-sm font-semibold">${Math.round(ordersStatsForStatistics.avgOrderValue)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Completion Rate</span>
                            <span className="text-sm font-semibold">
                              {Math.round((ordersStatsForStatistics.completedOrders / ordersStatsForStatistics.totalOrders) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
