import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from 'recharts';
import { format } from 'date-fns';
import { CheckCircle2, Clock, XCircle, CreditCard, Wallet2, Coins, Building2, Sparkles, Info, TrendingUp } from 'lucide-react';
import type { Transaction } from '@/data/mockData';

type AccountType = 'card' | 'crypto' | 'exchange' | 'bank' | 'stripe';

type Account = {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
  currency: string;
  status: string;
  holder?: string;
  expiry?: string;
  cardNumber?: string;
  walletAddress?: string;
  cryptoType?: string;
  exchangeName?: string;
  apiKey?: string;
  iban?: string;
  swift?: string;
  bankName?: string;
  accountNumber?: string;
  stripeAccountId?: string;
  stripeEmail?: string;
};

interface AccountDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  transactions: Transaction[];
}

export function AccountDetailModal({ open, onOpenChange, account, transactions }: AccountDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'transactions' | 'chart'>('info');

  // Фильтруем транзакции для этого счета
  const accountTransactions = useMemo(() => {
    if (!account) return [];
    // Предполагаем, что транзакции связаны через cardId или accountId
    // В реальном приложении это должно быть более точное сопоставление
    return transactions.filter(tx => {
      // Здесь можно добавить логику фильтрации по accountId если она есть в Transaction
      return true; // Пока показываем все транзакции
    });
  }, [account, transactions]);

  // Подготавливаем данные для графика доходов/расходов
  const chartData = useMemo(() => {
    if (!accountTransactions.length) return [];

    // Группируем по месяцам
    const grouped = accountTransactions.reduce((acc, tx) => {
      const date = new Date(tx.date);
      const monthKey = format(date, 'MMM yyyy');
      
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      
      if (tx.type === 'income') {
        acc[monthKey].income += tx.amount;
      } else {
        acc[monthKey].expense += tx.amount;
      }
      
      return acc;
    }, {} as Record<string, { month: string; income: number; expense: number }>);

    return Object.values(grouped).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
  }, [accountTransactions]);

  if (!account) return null;

  const getAccountIcon = () => {
    switch (account.type) {
      case 'card': return CreditCard;
      case 'crypto': return Coins;
      case 'exchange': return Building2;
      case 'bank': return Wallet2;
      case 'stripe': return Sparkles;
      default: return Wallet2;
    }
  };

  const AccountIcon = getAccountIcon();

  const totalIncome = accountTransactions
    .filter(tx => tx.type === 'income' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = accountTransactions
    .filter(tx => tx.type === 'expense' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-hidden flex flex-col p-0 gap-0 rounded-2xl shadow-2xl border-0"
        style={{ maxWidth: 'min(92vw, 1200px)', width: '92vw' }}
      >
        <DialogHeader className="px-8 pt-8 pb-6 bg-gradient-to-br from-muted/60 to-muted/30 border-b rounded-t-2xl">
          <div className="flex items-start justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-primary/15 shadow-sm">
                <AccountIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {account.name}
                </DialogTitle>
                <p className="text-muted-foreground mt-1">
                  {account.type === 'card' && 'Card'}
                  {account.type === 'crypto' && 'Crypto Account'}
                  {account.type === 'exchange' && 'Exchange'}
                  {account.type === 'bank' && 'Bank Account'}
                  {account.type === 'stripe' && 'Stripe'}
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Balance</div>
              <div className="text-3xl font-bold text-primary mt-0.5">
                {account.balance.toLocaleString()} {account.currency}
              </div>
              <span
                className="inline-flex items-center mt-2 px-3 py-1 rounded-full text-sm font-medium"
                style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}
              >
                {account.status}
              </span>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'info' | 'transactions' | 'chart')} className="flex-1 flex flex-col min-h-0 px-8 pb-8">
          <TabsList className="grid w-full grid-cols-3 h-12 mb-8 bg-muted/40 p-1 rounded-xl">
            <TabsTrigger
              value="info"
              className="flex items-center gap-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground"
            >
              <Info className="h-4 w-4" />
              Full Information
            </TabsTrigger>
            <TabsTrigger
              value="transactions"
              className="flex items-center gap-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground"
            >
              <CreditCard className="h-4 w-4" />
              All Transactions
            </TabsTrigger>
            <TabsTrigger
              value="chart"
              className="flex items-center gap-2.5 rounded-lg text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-md data-[state=active]:text-foreground"
            >
              <TrendingUp className="h-4 w-4" />
              Income/Expense Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="flex-1 overflow-y-auto pr-1 space-y-6 mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Main Information */}
              <div className="p-6 rounded-2xl border bg-card shadow-sm">
                <h3 className="text-lg font-semibold mb-5 text-foreground">Main Information</h3>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Name</div>
                    <div className="text-base font-semibold text-foreground">{account.name}</div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Type</div>
                    <div className="text-base font-semibold text-foreground">
                      {account.type === 'card' && 'Card'}
                      {account.type === 'crypto' && 'Crypto Account'}
                      {account.type === 'exchange' && 'Exchange'}
                      {account.type === 'bank' && 'Bank Account'}
                      {account.type === 'stripe' && 'Stripe'}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Balance</div>
                    <div className="text-xl font-bold text-primary">
                      {account.balance.toLocaleString()} {account.currency}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Status</div>
                    <span
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium"
                      style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}
                    >
                      {account.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Детали в зависимости от типа счета */}
              {account.type === 'card' && (
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-foreground">Card Details</h3>
                  <div className="grid grid-cols-2 gap-5">
                    {account.holder && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Holder</div>
                        <div className="text-base font-semibold text-foreground">{account.holder}</div>
                      </div>
                    )}
                    {account.cardNumber && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Card Number</div>
                        <div className="text-base font-semibold font-mono text-foreground">{account.cardNumber}</div>
                      </div>
                    )}
                    {account.expiry && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Expiry Date</div>
                        <div className="text-base font-semibold text-foreground">{account.expiry}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {account.type === 'crypto' && (
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-foreground">Crypto Account Details</h3>
                  <div className="grid grid-cols-2 gap-5">
                    {account.cryptoType && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Cryptocurrency Type</div>
                        <div className="text-base font-semibold text-foreground">{account.cryptoType}</div>
                      </div>
                    )}
                    {account.walletAddress && (
                      <div className="col-span-2">
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Wallet Address</div>
                        <div className="text-base font-semibold font-mono break-all text-foreground">{account.walletAddress}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {account.type === 'exchange' && (
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-foreground">Exchange Details</h3>
                  <div className="grid grid-cols-2 gap-5">
                    {account.exchangeName && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Exchange Name</div>
                        <div className="text-base font-semibold text-foreground">{account.exchangeName}</div>
                      </div>
                    )}
                    {account.apiKey && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">API Key</div>
                        <div className="text-base font-semibold font-mono text-foreground">{account.apiKey}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {account.type === 'bank' && (
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-foreground">Bank Account Details</h3>
                  <div className="grid grid-cols-2 gap-5">
                    {account.bankName && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Bank</div>
                        <div className="text-base font-semibold text-foreground">{account.bankName}</div>
                      </div>
                    )}
                    {account.accountNumber && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Account Number</div>
                        <div className="text-base font-semibold font-mono text-foreground">{account.accountNumber}</div>
                      </div>
                    )}
                    {account.iban && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">IBAN</div>
                        <div className="text-base font-semibold font-mono text-foreground">{account.iban}</div>
                      </div>
                    )}
                    {account.swift && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">SWIFT</div>
                        <div className="text-base font-semibold font-mono text-foreground">{account.swift}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {account.type === 'stripe' && (
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-foreground">Stripe Details</h3>
                  <div className="grid grid-cols-2 gap-5">
                    {account.stripeAccountId && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Account ID</div>
                        <div className="text-base font-semibold font-mono text-foreground">{account.stripeAccountId}</div>
                      </div>
                    )}
                    {account.stripeEmail && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1.5">Email</div>
                        <div className="text-base font-semibold text-foreground">{account.stripeEmail}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Статистика — на всю ширину */}
            <div className="p-6 rounded-2xl border bg-card shadow-sm">
              <h3 className="text-lg font-semibold mb-5 text-foreground">Statistics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Income</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    +{totalIncome.toLocaleString()} {account.currency}
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-rose-50 border border-rose-100">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Expenses</div>
                  <div className="text-2xl font-bold text-rose-600">
                    -{totalExpense.toLocaleString()} {account.currency}
                  </div>
                </div>
                <div className="p-5 rounded-xl bg-sky-50 border border-sky-100">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Transactions</div>
                  <div className="text-2xl font-bold text-sky-600">
                    {accountTransactions.length}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="flex-1 overflow-y-auto pr-1 mt-0">
            {accountTransactions.length > 0 ? (
              <div className="border rounded-2xl overflow-hidden shadow-sm bg-card">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b">
                      <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Client</TableHead>
                      <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Category</TableHead>
                      <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</TableHead>
                      <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {accountTransactions.map((transaction) => {
                      const statusConfig = {
                        completed: { 
                          icon: CheckCircle2, 
                          color: 'text-green-600', 
                          bg: 'bg-green-50',
                          label: 'Completed'
                        },
                        pending: { 
                          icon: Clock, 
                          color: 'text-yellow-600', 
                          bg: 'bg-yellow-50',
                          label: 'Pending'
                        },
                        failed: { 
                          icon: XCircle, 
                          color: 'text-red-600', 
                          bg: 'bg-red-50',
                          label: 'Error'
                        }
                      };
                      const status = statusConfig[transaction.status];
                      const StatusIcon = status.icon;
                      
                      return (
                        <TableRow 
                          key={transaction.id}
                          className="border-b hover:bg-gray-50/50 transition-colors"
                        >
                          <TableCell className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-xs">
                                {transaction.clientName.charAt(0)}
                              </div>
                              <div>
                                <div className="font-semibold text-foreground">{transaction.clientName}</div>
                                <div className="text-xs text-muted-foreground">{transaction.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700">
                              {transaction.category}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${status.bg} ${status.color}`}>
                              <StatusIcon className="h-3.5 w-3.5" />
                              {status.label}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 text-right">
                            <div className="flex flex-col items-end">
                              <span className={`font-bold text-base ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString()} {account.currency}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {transaction.type === 'income' ? 'Income' : 'Expense'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-foreground">
                                {format(new Date(transaction.date), 'dd.MM.yyyy')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(transaction.date), 'HH:mm')}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground border rounded-2xl bg-card/50">
                <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No transactions</p>
                <p className="text-sm">Transactions for this account will be displayed here</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chart" className="flex-1 overflow-y-auto pr-1 mt-0">
            {chartData.length > 0 ? (
              <div className="space-y-6">
                <div className="p-6 rounded-2xl border bg-card shadow-sm">
                  <h3 className="text-lg font-semibold mb-5 text-foreground">Income and Expense Chart</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                          </linearGradient>
                          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ef4444" stopOpacity={0.8} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.1} />
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
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '12px',
                            padding: '12px',
                            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                          }}
                          labelStyle={{ color: '#1f2937', fontWeight: '600' }}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="rect"
                        />
                        <Area 
                          type="monotone" 
                          dataKey="income" 
                          stroke="#10b981" 
                          fill="url(#incomeGradient)"
                          name="Income"
                          strokeWidth={2}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="expense" 
                          stroke="#ef4444" 
                          fill="url(#expenseGradient)"
                          name="Expenses"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Сводка по графику */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="p-5 rounded-2xl border bg-card shadow-sm">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Average Income</div>
                    <div className="text-2xl font-bold text-emerald-600">
                      {chartData.length > 0 
                        ? (chartData.reduce((sum, d) => sum + d.income, 0) / chartData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : 0} {account.currency}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl border bg-card shadow-sm">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Average Expense</div>
                    <div className="text-2xl font-bold text-rose-600">
                      {chartData.length > 0 
                        ? (chartData.reduce((sum, d) => sum + d.expense, 0) / chartData.length).toLocaleString(undefined, { maximumFractionDigits: 0 })
                        : 0} {account.currency}
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl border bg-card shadow-sm">
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Net Profit</div>
                    <div className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {(totalIncome - totalExpense >= 0 ? '+' : '')}{(totalIncome - totalExpense).toLocaleString()} {account.currency}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground border rounded-2xl bg-card/50">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No data for chart</p>
                <p className="text-sm">Transactions will appear here after they are added</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
