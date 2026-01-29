import { PageTransition } from '@/components/shared/PageTransition';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { GlassChartCard } from '@/components/dashboard/GlassChartCard';
import { 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  User
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  BarChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import { dashboardMetrics, clients, sessions, invoices } from '@/data/mockData';
import { TodayEventsCard } from '@/components/dashboard/TodayEventsCard';
import { UrgentInvoicesCard } from '@/components/dashboard/UrgentInvoicesCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import logger from '@/lib/logger';

const COLORS = ['#0284c7', '#6366f1', '#0d9488', '#0891b2'];

export default function Dashboard() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastIndexRef = useRef(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    logger.componentMount('Dashboard');
    logger.dataFetch('Dashboard', 'mockData', {
      metrics: dashboardMetrics,
      clientsCount: clients.length
    });
  }, []);

  useEffect(() => {
    const updateWidth = () => {
      const el = scrollContainerRef.current;
      if (el) setContainerWidth(el.getBoundingClientRect().width);
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);

    const scrollEl = scrollContainerRef.current;
    const ro = new ResizeObserver(updateWidth);
    if (scrollEl) ro.observe(scrollEl);

    let rafId: number | null = null;
    const updateIndex = () => {
      if (!scrollContainerRef.current) return;
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cw = container.offsetWidth;
      let newIndex = 0;
      cardRefs.current.forEach((card, index) => {
        if (card) {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const containerCenter = scrollLeft + cw / 2;
          if (Math.abs(cardCenter - containerCenter) < card.offsetWidth / 2) {
            newIndex = index;
          }
        }
      });
      if (newIndex !== lastIndexRef.current) {
        lastIndexRef.current = newIndex;
        setCurrentIndex(newIndex);
      }
      rafId = null;
    };
    const handleScroll = () => {
      if (rafId === null) rafId = requestAnimationFrame(updateIndex);
    };
    if (scrollEl) scrollEl.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', updateWidth);
      if (scrollEl) ro.unobserve(scrollEl);
      if (scrollEl) scrollEl.removeEventListener('scroll', handleScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  const scrollToCard = (index: number) => {
    // Проверяем границы массива и предотвращаем множественные клики
    if (index < 0 || index >= cardRefs.current.length || isScrollingRef.current) return;
    
    const card = cardRefs.current[index];
    if (card && scrollContainerRef.current) {
      isScrollingRef.current = true;
      
      // Используем scrollIntoView для лучшей совместимости со scroll-snap
      card.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
      
      // Обновляем индекс с небольшой задержкой для плавности
      requestAnimationFrame(() => {
        setCurrentIndex(index);
      });
      
      // Снимаем блокировку после завершения анимации (300ms для плавной прокрутки)
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 350);
    }
  };

  const handleCardEdgeClick = (direction: 'left' | 'right', cardIndex: number) => {
    // Предотвращаем множественные клики во время анимации
    const nextIndex = direction === 'right' ? cardIndex + 1 : cardIndex - 1;
    if (nextIndex >= 0 && nextIndex < cardRefs.current.length) {
      scrollToCard(nextIndex);
    }
  };


  const sessionTypesData = useMemo(() => {
    const items = dashboardMetrics.sessionTypes as Array<{ name: string; value: number; color?: string; revenue?: number; avgDuration?: string; trend?: number }>;
    const data = items.map((item, index) => ({
      name: item.name,
      value: item.value,
      color: item.color ?? COLORS[index],
      revenue: item.revenue,
      avgDuration: item.avgDuration,
      trend: item.trend
    }));
    logger.debug('DATA', 'Session types data processed', {
      count: data.length,
      total: data.reduce((sum, item) => sum + item.value, 0)
    }, 'Dashboard', 'DATA_PROCESS');
    return data;
  }, []);

  const topClients = useMemo(() => {
    const sorted = [...clients]
      .sort((a, b) => b.sessions - a.sessions)
      .slice(0, 5);
    logger.debug('DATA', 'Top clients sorted', {
      count: sorted.length,
      topSessions: sorted[0]?.sessions
    }, 'Dashboard', 'DATA_PROCESS');
    return sorted;
  }, []);

  return (
    <PageTransition>
      <div className="space-y-4 sm:space-y-5 lg:space-y-6 content-bleed min-h-[calc(100vh-var(--header-h)-2rem)]">
        <div>
          <h1 className="text-fluid-2xl sm:text-fluid-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-fluid-sm sm:text-fluid-base text-muted-foreground mt-0.5">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Revenue"
            value={dashboardMetrics.revenue}
            icon={DollarSign}
            iconColor="blue"
            delay={0}
          />
          <MetricCard
            title="Number of Payments"
            value={dashboardMetrics.payments}
            icon={CreditCard}
            iconColor="purple"
            delay={0.1}
            formatAsCurrency={false}
          />
          <MetricCard
            title="Average Check"
            value={dashboardMetrics.averageCheck}
            icon={CheckCircle}
            iconColor="green"
            delay={0.2}
          />
          <MetricCard
            title="Number of Sessions"
            value={dashboardMetrics.sessions}
            icon={Calendar}
            iconColor="orange"
            delay={0.3}
            formatAsCurrency={false}
          />
        </div>

        {/* Today Events and Urgent Invoices Cards */}
        <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2">
          <TodayEventsCard sessions={sessions} delay={0.4} />
          <UrgentInvoicesCard invoices={invoices} delay={0.5} />
        </div>

        {/* Horizontal Scrollable Tape Layout for Charts */}
        <div className="relative">
          <div 
            ref={scrollContainerRef}
            className="overflow-x-auto overflow-y-hidden charts-tape-scroll"
            style={{
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
              scrollSnapStop: 'always',
              msOverflowStyle: 'none',
              scrollbarWidth: 'none',
              transition: 'scroll 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div className="flex gap-4 sm:gap-5 lg:gap-6" style={{ width: 'max-content' }}>
              <div 
                ref={(el) => { cardRefs.current[0] = el; }}
                className="flex-shrink-0 relative w-full min-w-[min(320px,100%)] max-w-full transition-transform duration-300 ease-out pr-20"
                style={{ 
                  width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always'
                }}
              >
                {/* Кнопка переключения — круг, контент не заходит в зону стрелки */}
                {currentIndex === 0 && cardRefs.current.length > 1 && (
                  <div
                    onClick={() => handleCardEdgeClick('right', 0)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer flex items-center justify-center"
                  >
                    <div className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-slate-200/80 shadow-md hover:bg-slate-50 hover:shadow-lg active:scale-95 transition-all">
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                )}
              <GlassChartCard 
                title="Session Types" 
                delay={0.4} 
                className="w-full chart-min-h"
                style={{ height: 'var(--chart-max-h)', minHeight: 'var(--chart-min-h)' }}
              >
              <div className="flex flex-col lg:flex-row items-center gap-3 sm:gap-4 lg:gap-6 h-full">
                {/* Chart Section - More Space */}
                <div className="flex-1 w-full lg:w-2/3 h-full min-w-0 min-h-[200px] sm:min-h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      {sessionTypesData.map((entry, index) => (
                        <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                          <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                        </linearGradient>
                      ))}
                    </defs>
                    <Pie
                      data={sessionTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                      outerRadius="75%"
                      innerRadius="38%"
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={3}
                    >
                      {sessionTypesData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={`url(#gradient-${index})`}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        padding: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Legend Section — фикс. высота, скролл колесом мыши без скроллбара */}
              <div className="w-full lg:w-1/3 min-w-0 flex flex-col min-h-0 max-h-[280px] lg:max-h-[320px]">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide pr-0.5 overscroll-behavior-y-contain">
                  <div className="space-y-2 sm:space-y-3">
                    {sessionTypesData.map((entry, index) => {
                      const total = sessionTypesData.reduce((sum, item) => sum + item.value, 0);
                      const percentage = ((entry.value / total) * 100).toFixed(1);
                      const trend = entry.trend != null;
                      return (
                        <div key={index} className="flex items-center gap-2 lg:gap-3 p-2 sm:p-2.5 lg:p-3 rounded-2xl" style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(10px)',
                        }}>
                          <div 
                            className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 rounded-full flex-shrink-0"
                            style={{ 
                              background: `linear-gradient(135deg, ${entry.color} 0%, ${entry.color}dd 100%)`,
                              boxShadow: `0 2px 8px ${entry.color}40`
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5 sm:mb-1">
                              <span className="font-medium text-fluid-xs sm:text-fluid-sm text-foreground truncate">{entry.name}</span>
                              <span className="font-semibold text-fluid-xs sm:text-fluid-sm flex-shrink-0 ml-1 sm:ml-2" style={{ color: entry.color }}>
                                {percentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200/20 rounded-xl h-2 sm:h-2.5 overflow-hidden">
                              <div 
                                className="h-full rounded-xl transition-all duration-500 min-w-[8px]"
                                style={{ 
                                  width: `${percentage}%`,
                                  background: `linear-gradient(90deg, ${entry.color} 0%, ${entry.color}cc 100%)`,
                                  boxShadow: `0 0 8px ${entry.color}60`
                                }}
                              />
                            </div>
                            <div className="text-fluid-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                              <span>{entry.value} sessions</span>
                              {entry.revenue != null && (
                                <span className="font-medium text-foreground/90">${entry.revenue.toLocaleString()}</span>
                              )}
                              {entry.avgDuration && (
                                <span>{entry.avgDuration}</span>
                              )}
                              {trend && (
                                <span className={entry.trend! >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                  {entry.trend! >= 0 ? '+' : ''}{entry.trend}%
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
              </GlassChartCard>
            </div>

              {/* Dynamics of Records - Enhanced Line Chart */}
              <div 
                ref={(el) => { cardRefs.current[1] = el; }}
                className="flex-shrink-0 relative w-full min-w-[min(320px,100%)] max-w-full transition-transform duration-300 ease-out pl-20 pr-20"
                style={{ 
                  width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always'
                }}
              >
                {currentIndex === 1 && (
                  <div
                    onClick={() => handleCardEdgeClick('left', 1)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer flex items-center justify-center"
                  >
                    <div className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-slate-200/80 shadow-md hover:bg-slate-50 hover:shadow-lg active:scale-95 transition-all">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                )}
                {currentIndex === 1 && cardRefs.current.length > 2 && (
                  <div
                    onClick={() => handleCardEdgeClick('right', 1)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer flex items-center justify-center"
                  >
                    <div className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-slate-200/80 shadow-md hover:bg-slate-50 hover:shadow-lg active:scale-95 transition-all">
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                )}
              <GlassChartCard 
                title="Dynamics of Records" 
                delay={0.5} 
                className="w-full chart-min-h"
                style={{ height: 'var(--chart-max-h)', minHeight: 'var(--chart-min-h)' }}
              >
              <div 
                className="w-full flex flex-col h-full" 
              >
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboardMetrics.dynamics}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="colorValueBorder" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0284c7" stopOpacity={1} />
                      <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.8} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(0, 0, 0, 0.08)"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="month" 
                    stroke="rgba(0, 0, 0, 0.4)"
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tickLine={{ stroke: 'rgba(0, 0, 0, 0.2)' }}
                    tick={{ fill: 'rgba(0, 0, 0, 0.6)' }}
                  />
                  <YAxis 
                    stroke="rgba(0, 0, 0, 0.4)"
                    style={{ fontSize: '12px', fontWeight: '500' }}
                    tickLine={{ stroke: 'rgba(0, 0, 0, 0.2)' }}
                    tick={{ fill: 'rgba(0, 0, 0, 0.6)' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      background: 'rgba(255, 255, 255, 0.9)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                    labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="url(#colorValueBorder)"
                    strokeWidth={3}
                    fill="url(#colorValue)"
                    dot={{ 
                      r: 5, 
                      fill: '#0284c7',
                      strokeWidth: 2,
                      stroke: '#fff'
                    }}
                    activeDot={{ 
                      r: 7, 
                      fill: '#0284c7',
                      strokeWidth: 3,
                      stroke: '#fff',
                      style: { filter: 'drop-shadow(0 0 8px rgba(2, 132, 199, 0.5))' }
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="url(#colorValueBorder)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ 
                      r: 7, 
                      fill: '#0284c7',
                      strokeWidth: 3,
                      stroke: '#fff'
                    }}
                  />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Statistics Summary */}
              <div className="mt-3 lg:mt-4 flex flex-wrap gap-2 lg:gap-4">
                <div className="flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[120px] p-2 lg:p-3 rounded-2xl" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div className="text-xs text-muted-foreground mb-1">Total Records</div>
                  <div className="text-base lg:text-lg font-semibold text-foreground">
                    {dashboardMetrics.dynamics.reduce((sum, item) => sum + item.value, 0)}
                  </div>
                </div>
                <div className="flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[120px] p-2 lg:p-3 rounded-2xl" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div className="text-xs text-muted-foreground mb-1">Average</div>
                  <div className="text-base lg:text-lg font-semibold text-foreground">
                    {(dashboardMetrics.dynamics.reduce((sum, item) => sum + item.value, 0) / dashboardMetrics.dynamics.length).toFixed(1)}
                  </div>
                </div>
                <div className="flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[120px] p-2 lg:p-3 rounded-2xl" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div className="text-xs text-muted-foreground mb-1">Peak</div>
                  <div className="text-base lg:text-lg font-semibold text-foreground">
                    {Math.max(...dashboardMetrics.dynamics.map(item => item.value))}
                  </div>
                </div>
                <div className="flex-1 min-w-[calc(50%-0.5rem)] lg:min-w-[120px] p-2 lg:p-3 rounded-2xl" style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                }}>
                  <div className="text-xs text-muted-foreground mb-1">Growth</div>
                  <div className="text-base lg:text-lg font-semibold" style={{ color: '#10b981' }}>
                    +{((dashboardMetrics.dynamics[dashboardMetrics.dynamics.length - 1].value / dashboardMetrics.dynamics[0].value - 1) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
              </GlassChartCard>
              </div>

              {/* Client Activity Ratings */}
              <div 
                ref={(el) => { cardRefs.current[2] = el; }}
                className="flex-shrink-0 relative w-full min-w-[min(320px,100%)] max-w-full transition-transform duration-300 ease-out pl-20 pr-20"
                style={{ 
                  width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always'
                }}
              >
                {currentIndex === 2 && (
                  <div
                    onClick={() => handleCardEdgeClick('left', 2)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer flex items-center justify-center"
                  >
                    <div className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-slate-200/80 shadow-md hover:bg-slate-50 hover:shadow-lg active:scale-95 transition-all">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                )}
                {currentIndex === 2 && cardRefs.current.length > 3 && (
                  <div
                    onClick={() => handleCardEdgeClick('right', 2)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer flex items-center justify-center"
                  >
                    <div className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-slate-200/80 shadow-md hover:bg-slate-50 hover:shadow-lg active:scale-95 transition-all">
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                )}
                <GlassChartCard 
                  title="Client Activity Ratings" 
                  delay={0.6}
                  className="w-full chart-min-h"
                  style={{ height: 'var(--chart-max-h)', minHeight: 'var(--chart-min-h)' }}
                >
                  <div className="flex-1 flex flex-col h-full" style={{ overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="align-middle">CLIENT</TableHead>
                          <TableHead className="align-middle text-right">SESSIONS</TableHead>
                          <TableHead className="align-middle text-right">LAST MEETING</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {topClients.map((client) => (
                          <TableRow key={client.id}>
                            <TableCell className="align-middle">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-50 flex-shrink-0 transition-all duration-300 ease-out"
                                  style={{
                                    boxShadow: `
                                      inset 3px 3px 6px rgba(0, 0, 0, 0.15),
                                      inset -2px -2px 4px rgba(255, 255, 255, 1)
                                    `
                                  }}
                                >
                                  <User className="h-4 w-4 text-slate-600" />
                                </div>
                                <span className="font-medium leading-none">{client.name}</span>
                              </div>
                            </TableCell>
                            <TableCell className="align-middle text-right">{client.sessions}</TableCell>
                            <TableCell className="align-middle text-right">
                              {format(new Date(client.lastMeeting), 'MMM dd, hh:mm a')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </GlassChartCard>
              </div>

              {/* Lead Sources Bar Chart */}
              <div 
                ref={(el) => { cardRefs.current[3] = el; }}
                className="flex-shrink-0 relative w-full min-w-[min(320px,100%)] max-w-full transition-transform duration-300 ease-out pl-20"
                style={{ 
                  width: containerWidth > 0 ? `${containerWidth}px` : '100%',
                  scrollSnapAlign: 'center',
                  scrollSnapStop: 'always'
                }}
              >
                {currentIndex === 3 && (
                  <div
                    onClick={() => handleCardEdgeClick('left', 3)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-20 cursor-pointer flex items-center justify-center"
                  >
                    <div className="rounded-full w-10 h-10 flex items-center justify-center bg-white border border-slate-200/80 shadow-md hover:bg-slate-50 hover:shadow-lg active:scale-95 transition-all">
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                )}
                <GlassChartCard 
                  title="Lead Sources" 
                  delay={0.7}
                  className="w-full chart-min-h"
                  style={{ height: 'var(--chart-max-h)', minHeight: 'var(--chart-min-h)' }}
                >
                  <div className="flex-1 flex flex-col h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardMetrics.leadSources}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0, 0, 0, 0.08)" />
                        <XAxis 
                          dataKey="source" 
                          stroke="rgba(0, 0, 0, 0.4)"
                          style={{ fontSize: '12px', fontWeight: '500' }}
                          tickLine={{ stroke: 'rgba(0, 0, 0, 0.2)' }}
                          tick={{ fill: 'rgba(0, 0, 0, 0.6)' }}
                        />
                        <YAxis 
                          stroke="rgba(0, 0, 0, 0.4)"
                          style={{ fontSize: '12px', fontWeight: '500' }}
                          tickLine={{ stroke: 'rgba(0, 0, 0, 0.2)' }}
                          tick={{ fill: 'rgba(0, 0, 0, 0.6)' }}
                        />
                        <Tooltip 
                          contentStyle={{
                            background: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Bar dataKey="value" fill="#0284c7" radius={[8, 8, 0, 0]}>
                          {dashboardMetrics.leadSources.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.source === 'Website' ? '#0369a1' : '#0284c7'} 
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </GlassChartCard>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
