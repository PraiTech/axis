import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell } from 'recharts';
import type { Investment } from '@/data/mockData';
import { TrendingUp, TrendingDown, DollarSign, Percent, Calendar } from 'lucide-react';

interface InvestmentDetailModalProps {
  open: boolean;
  onClose: () => void;
  investment: Investment | null;
}

// SVG Icons
const IconStocks = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21v-7" />
    <path d="M19 21v-15" />
    <path d="M12 21v-11" />
  </svg>
);
const IconRealEstate = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <rect x="8" y="6" width="8" height="10" rx="1" />
  </svg>
);
const IconCrypto = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.279 5.308m-.425 2.502L2.095 7.164" />
  </svg>
);
const IconBonds = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="2" x2="12" y2="22" />
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const iconByType: Record<string, () => JSX.Element> = {
  Stocks: IconStocks,
  'Real Estate': IconRealEstate,
  Crypto: IconCrypto,
  Bonds: IconBonds,
};

const iconBgByType: Record<string, string> = {
  Stocks: 'bg-blue-50 text-blue-600',
  'Real Estate': 'bg-indigo-50 text-indigo-600',
  Crypto: 'bg-amber-50 text-amber-600',
  Bonds: 'bg-teal-50 text-teal-600',
};

export function InvestmentDetailModal({
  open,
  onClose,
  investment,
}: InvestmentDetailModalProps) {
  const [activeTab, setActiveTab] = useState('info');

  // Генерируем данные для графика с начала инвестиции
  const chartData = useMemo(() => {
    if (!investment) return [];
    
    const startDate = new Date(investment.date);
    const months = [];
    const now = new Date();
    
    // Создаем данные по месяцам от даты инвестиции до текущей даты
    let currentDate = new Date(startDate);
    let currentValue = investment.amount;
    
    while (currentDate <= now) {
      const monthName = currentDate.toLocaleDateString('ru-RU', { month: 'short', year: 'numeric' });
      
      // Симулируем рост стоимости (в реальном приложении это будет из API)
      if (currentDate.getTime() === startDate.getTime()) {
        currentValue = investment.amount;
      } else {
        // Линейная интерполяция от начальной суммы до текущей стоимости
        const totalMonths = Math.max(1, Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));
        const monthsPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
        const progress = Math.min(1, monthsPassed / totalMonths);
        currentValue = investment.amount + (investment.currentValue - investment.amount) * progress;
      }
      
      months.push({
        date: monthName,
        value: Math.round(currentValue),
        amount: investment.amount,
      });
      
      // Переходим к следующему месяцу
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }
    
    return months;
  }, [investment]);

  // Данные для аналитики
  const analyticsData = useMemo(() => {
    if (!investment) return {
      daysInvested: 0,
      monthsInvested: 0,
      annualizedReturn: 0,
      totalReturn: 0,
      totalReturnPercent: 0,
      currentValue: 0,
      initialAmount: 0,
    };
    
    const daysInvested = Math.floor(
      (new Date().getTime() - new Date(investment.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    const monthsInvested = Math.floor(daysInvested / 30);
    const annualizedReturn = monthsInvested > 0 
      ? (Math.pow(investment.currentValue / investment.amount, 12 / monthsInvested) - 1) * 100
      : 0;
    
    return {
      daysInvested,
      monthsInvested,
      annualizedReturn,
      totalReturn: investment.return,
      totalReturnPercent: investment.returnPercent,
      currentValue: investment.currentValue,
      initialAmount: investment.amount,
    };
  }, [investment]);

  if (!investment) return null;

  const Icon = iconByType[investment.type] || IconStocks;
  const iconBg = iconBgByType[investment.type] || iconBgByType.Stocks;
  const isPositive = investment.return >= 0;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen) onClose();
    }}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
              <Icon />
            </div>
            <span>{investment.name}</span>
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">All Info</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Tab 1: All Info */}
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Current Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${investment.currentValue.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Initial Investment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${investment.amount.toLocaleString()}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Profit/Loss
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}${investment.return.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Percent className="h-4 w-4" />
                    Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{investment.returnPercent.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Detailed Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Investment Type</label>
                    <p className="text-lg font-semibold mt-1">{investment.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Investment Date
                    </label>
                    <p className="text-lg font-semibold mt-1">
                      {new Date(investment.date).toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Initial Amount</label>
                    <p className="text-lg font-semibold mt-1">${investment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Current Value</label>
                    <p className="text-lg font-semibold mt-1">${investment.currentValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Absolute Profit/Loss</label>
                    <p className={`text-lg font-semibold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}${investment.return.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Percentage Return</label>
                    <p className={`text-lg font-semibold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {isPositive ? '+' : ''}{investment.returnPercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Charts */}
          <TabsContent value="charts" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Value Chart from Investment Start</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Initial Amount"
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      name="Current Value"
                      dot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comparison of Initial and Current Value</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Initial Amount', value: investment.amount },
                    { name: 'Current Value', value: investment.currentValue },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="value" fill="#8884d8">
                      <Cell fill="#94a3b8" />
                      <Cell fill={isPositive ? '#10b981' : '#ef4444'} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Analytics */}
          <TabsContent value="analytics" className="space-y-4 mt-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Days in Investment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData.daysInvested}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ~{analyticsData.monthsInvested} months
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Annual Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${analyticsData.annualizedReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analyticsData.annualizedReturn >= 0 ? '+' : ''}{analyticsData.annualizedReturn.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Profit
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}${analyticsData.totalReturn.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Percentage Return
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{analyticsData.totalReturnPercent.toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isPositive ? (
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-600" />
                  )}
                  Profit/Loss Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Initial Investment</div>
                    <div className="text-2xl font-bold mt-1">${investment.amount.toLocaleString()}</div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm text-muted-foreground">Current Value</div>
                    <div className="text-2xl font-bold mt-1">${investment.currentValue.toLocaleString()}</div>
                  </div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">Net Profit/Loss</div>
                  <div className={`text-3xl font-bold mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}${investment.return.toLocaleString()} ({isPositive ? '+' : ''}{investment.returnPercent.toFixed(2)}%)
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
