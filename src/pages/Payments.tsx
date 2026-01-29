import { useState } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { ChartCard } from '@/components/dashboard/ChartCard';
import { GlassChartCard } from '@/components/dashboard/GlassChartCard';
import { DollarSign, TrendingDown, Plus, CreditCard, ArrowUpRight, ArrowDownRight, CheckCircle2, Clock, XCircle, Wallet, Filter, Wallet2, Coins, Building2, Sparkles } from 'lucide-react';
import { dashboardMetrics, bankCards, transactions, clients } from '@/data/mockData';
import type { Transaction } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, subYears, subDays } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { TimePicker } from '@/components/ui/time-picker';
import {
  defaultSalesFilters,
  defaultTxFilters,
  aggregateSalesWithFilters,
  filterTransactions,
  computeSalesSummary,
  getUniqueCategories,
  getUniqueClients,
  countActiveFilters,
  countTxActiveFilters,
  type SalesFilters,
  type TxFilters,
} from '@/lib/salesFilters';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { AccountDetailModal } from '@/components/payments/AccountDetailModal';

type BankCardItem = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  holder: string;
  expiry: string;
  type: string;
  cardNumber?: string;
  cvc?: string;
};

type AccountType = 'card' | 'crypto' | 'exchange' | 'bank' | 'stripe';

type Account = {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
  currency: string;
  status: string;
  // Card specific
  holder?: string;
  expiry?: string;
  cardNumber?: string;
  // Crypto specific
  walletAddress?: string;
  cryptoType?: string; // BTC, ETH, etc.
  // Exchange specific
  exchangeName?: string; // Binance, Coinbase, etc.
  apiKey?: string;
  // Bank specific
  iban?: string;
  swift?: string;
  bankName?: string;
  accountNumber?: string;
  // Stripe specific
  stripeAccountId?: string;
  stripeEmail?: string;
};

function generateCardId(list: BankCardItem[]) {
  const numIds = list.map(c => parseInt(c.id.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
  return `card${numIds.length ? Math.max(...numIds) + 1 : 1}`;
}

function generateAccountId(list: Account[]) {
  const numIds = list.map(a => parseInt(a.id.replace(/\D/g, ''), 10)).filter(n => !isNaN(n));
  return `acc${numIds.length ? Math.max(...numIds) + 1 : 1}`;
}

// Mock accounts data
const mockAccounts: Account[] = [
  // Cards
  {
    id: 'acc1',
    type: 'card',
    name: 'Main Card',
    balance: 64200,
    currency: 'USD',
    status: 'active',
    holder: 'NICK OHNY',
    expiry: '05/26',
    cardNumber: '4532 **** **** 1234',
  },
  {
    id: 'acc2',
    type: 'card',
    name: 'Work Card',
    balance: 44200,
    currency: 'USD',
    status: 'active',
    holder: 'JOHN SMITH',
    expiry: '08/27',
    cardNumber: '5421 **** **** 5678',
  },
  // Crypto
  {
    id: 'acc3',
    type: 'crypto',
    name: 'Bitcoin Wallet',
    balance: 2.5,
    currency: 'BTC',
    status: 'active',
    walletAddress: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    cryptoType: 'BTC',
  },
  {
    id: 'acc4',
    type: 'crypto',
    name: 'Ethereum Wallet',
    balance: 15.8,
    currency: 'ETH',
    status: 'active',
    walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    cryptoType: 'ETH',
  },
  {
    id: 'acc5',
    type: 'crypto',
    name: 'USDT Wallet',
    balance: 50000,
    currency: 'USDT',
    status: 'active',
    walletAddress: 'TQr9y2BvFzF8vJqJwJqJwJqJwJqJwJqJwJq',
    cryptoType: 'USDT',
  },
  // Exchanges
  {
    id: 'acc6',
    type: 'exchange',
    name: 'Binance Account',
    balance: 125000,
    currency: 'USD',
    status: 'active',
    exchangeName: 'Binance',
    apiKey: 'bin_****1234',
  },
  {
    id: 'acc7',
    type: 'exchange',
    name: 'Coinbase Pro',
    balance: 85000,
    currency: 'USD',
    status: 'active',
    exchangeName: 'Coinbase',
    apiKey: 'cb_****5678',
  },
  // Bank
  {
    id: 'acc8',
    type: 'bank',
    name: 'Main Account',
    balance: 250000,
    currency: 'USD',
    status: 'active',
    iban: 'GB82 WEST 1234 5698 7654 32',
    swift: 'CHASUS33',
    bankName: 'Chase Bank',
    accountNumber: '1234567890',
  },
  {
    id: 'acc9',
    type: 'bank',
    name: 'Euro Account',
    balance: 150000,
    currency: 'EUR',
    status: 'active',
    iban: 'DE89 3704 0044 0532 0130 00',
    swift: 'COBADEFF',
    bankName: 'Commerzbank',
    accountNumber: '9876543210',
  },
  // Stripe
  {
    id: 'acc10',
    type: 'stripe',
    name: 'Stripe Production',
    balance: 45000,
    currency: 'USD',
    status: 'active',
    stripeAccountId: 'acct_1A2B3C4D5E6F7G8H9',
    stripeEmail: 'payments@example.com',
  },
  {
    id: 'acc11',
    type: 'stripe',
    name: 'Stripe Test',
    balance: 0,
    currency: 'USD',
    status: 'active',
    stripeAccountId: 'acct_test123456',
    stripeEmail: 'test@example.com',
  },
];

export default function Payments() {
  const [activeTab, setActiveTab] = useState<'payments' | 'accounts'>('payments');
  const [accountsSubTab, setAccountsSubTab] = useState<AccountType>('card');
  const [cardsList, setCardsList] = useState<BankCardItem[]>(() => [...bankCards]);
  const [accountsList, setAccountsList] = useState<Account[]>(() => mockAccounts);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>(() => [...transactions]);
  const [addCardOpen, setAddCardOpen] = useState(false);
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('card');
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountDetailOpen, setAccountDetailOpen] = useState(false);
  const [addCardForm, setAddCardForm] = useState({
    holder: '',
    type: 'visa' as 'visa' | 'mastercard',
    expiry: '',
    amount: '',
    cardNumber: '',
    cvc: '',
  });
  const [addAccountForm, setAddAccountForm] = useState({
    name: '',
    balance: '',
    currency: 'USD',
    // Card
    holder: '',
    cardType: 'visa' as 'visa' | 'mastercard',
    expiry: '',
    cardNumber: '',
    cvc: '',
    // Crypto
    walletAddress: '',
    cryptoType: 'BTC',
    // Exchange
    exchangeName: '',
    apiKey: '',
    // Bank
    iban: '',
    swift: '',
    bankName: '',
    accountNumber: '',
    // Stripe
    stripeAccountId: '',
    stripeEmail: '',
  });
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
  const [infoDialog, setInfoDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
  }>({ open: false, title: '', message: '' });

  const [salesFilters, setSalesFilters] = useState<SalesFilters>(defaultSalesFilters);
  const [salesFilterOpen, setSalesFilterOpen] = useState(false);
  const [salesFilterDraft, setSalesFilterDraft] = useState<SalesFilters>(defaultSalesFilters);
  const [txFilters, setTxFilters] = useState<TxFilters>(() => {
    const now = new Date();
    return { ...defaultTxFilters, dateFrom: subDays(now, 7), dateTo: now };
  });
  const [txFilterOpen, setTxFilterOpen] = useState(false);
  const [txFilterDraft, setTxFilterDraft] = useState<TxFilters>(defaultTxFilters);
  const [txDatePreset, setTxDatePreset] = useState<'7days' | '30days' | '90days'>('7days');

  const openSalesFilter = () => {
    setSalesFilterDraft({ ...salesFilters });
    setSalesFilterOpen(true);
  };
  const openTxFilter = () => {
    setTxFilterDraft({ ...txFilters });
    setTxFilterOpen(true);
  };
  const applySalesPreset = (preset: 'thisMonth' | 'last3' | 'thisYear' | 'lastYear') => {
    const now = new Date();
    switch (preset) {
      case 'thisMonth':
        setSalesFilterDraft((d) => ({ ...d, dateFrom: startOfMonth(now), dateTo: endOfMonth(now) }));
        break;
      case 'last3':
        setSalesFilterDraft((d) => ({ ...d, dateFrom: subMonths(now, 3), dateTo: now }));
        break;
      case 'thisYear':
        setSalesFilterDraft((d) => ({ ...d, dateFrom: startOfYear(now), dateTo: now }));
        break;
      case 'lastYear':
        setSalesFilterDraft((d) => ({
          ...d,
          dateFrom: startOfYear(subYears(now, 1)),
          dateTo: endOfYear(subYears(now, 1)),
        }));
        break;
    }
  };
  const toggleCategory = (cat: string, isSales: boolean) => {
    if (isSales) {
      setSalesFilterDraft((d) => ({
        ...d,
        categories: d.categories.includes(cat) ? d.categories.filter((c) => c !== cat) : [...d.categories, cat],
      }));
    } else {
      setTxFilterDraft((d) => ({
        ...d,
        categories: d.categories.includes(cat) ? d.categories.filter((c) => c !== cat) : [...d.categories, cat],
      }));
    }
  };
  const toggleStatus = (s: 'completed' | 'pending' | 'failed', isSales: boolean) => {
    if (isSales) {
      setSalesFilterDraft((d) => ({
        ...d,
        statuses: d.statuses.includes(s) ? d.statuses.filter((x) => x !== s) : [...d.statuses, s],
      }));
    } else {
      setTxFilterDraft((d) => ({
        ...d,
        statuses: d.statuses.includes(s) ? d.statuses.filter((x) => x !== s) : [...d.statuses, s],
      }));
    }
  };

  const salesChartData = aggregateSalesWithFilters(transactionsList, salesFilters);
  const salesSummary = computeSalesSummary(salesChartData);
  const filteredTx = filterTransactions(transactionsList, txFilters);
  const recentTransactions = filteredTx.slice(0, 10);
  const categories = getUniqueCategories(transactionsList);
  const txClients = getUniqueClients(transactionsList);
  const salesFilterCount = countActiveFilters(salesFilters);
  const txFilterCount = countTxActiveFilters(txFilters);
  const totalBalance = cardsList.reduce((sum, card) => sum + card.amount, 0);
  const totalTransactions = transactionsList.length;
  const completedTransactions = transactionsList.filter(t => t.status === 'completed').length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyIncome = transactionsList
    .filter(t => {
      const txDate = new Date(t.date);
      return txDate.getMonth() === currentMonth &&
             txDate.getFullYear() === currentYear &&
             t.type === 'income' &&
             t.status === 'completed';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const avgTransaction = transactionsList.length > 0
    ? transactionsList.reduce((sum, t) => sum + t.amount, 0) / transactionsList.length
    : 0;

  const showInfo = (title: string, message: string) => {
    setInfoDialog({ open: true, title, message });
  };

  const handleAddCard = () => {
    if (!addCardForm.holder.trim() || !addCardForm.expiry.trim() || !addCardForm.amount.trim() || !addCardForm.cardNumber.trim()) return;
    const amount = parseFloat(addCardForm.amount);
    if (isNaN(amount) || amount < 0) return;
    const id = generateCardId(cardsList);
    const newCard: BankCardItem = {
      id,
      holder: addCardForm.holder.trim().toUpperCase(),
      type: addCardForm.type,
      expiry: addCardForm.expiry.trim(),
      amount,
      currency: 'USD',
      status: 'active',
      cardNumber: addCardForm.cardNumber.trim(),
      cvc: addCardForm.cvc.trim() || undefined,
    };
    setCardsList(prev => [...prev, newCard]);
    setAddCardForm({ holder: '', type: 'visa', expiry: '', amount: '', cardNumber: '', cvc: '' });
    setAddCardOpen(false);
  };

  const handleAddAccount = () => {
    if (!addAccountForm.name.trim() || !addAccountForm.balance.trim()) return;
    const balance = parseFloat(addAccountForm.balance);
    if (isNaN(balance) || balance < 0) return;
    
    const id = generateAccountId(accountsList);
    const newAccount: Account = {
      id,
      type: accountType,
      name: addAccountForm.name.trim(),
      balance,
      currency: addAccountForm.currency,
      status: 'active',
    };

    // Add type-specific fields
    if (accountType === 'card') {
      newAccount.holder = addAccountForm.holder.trim().toUpperCase();
      newAccount.expiry = addAccountForm.expiry.trim();
      newAccount.cardNumber = addAccountForm.cardNumber.trim();
    } else if (accountType === 'crypto') {
      newAccount.walletAddress = addAccountForm.walletAddress.trim();
      newAccount.cryptoType = addAccountForm.cryptoType;
    } else if (accountType === 'exchange') {
      newAccount.exchangeName = addAccountForm.exchangeName.trim();
      newAccount.apiKey = addAccountForm.apiKey.trim();
    } else if (accountType === 'bank') {
      newAccount.iban = addAccountForm.iban.trim();
      newAccount.swift = addAccountForm.swift.trim();
      newAccount.bankName = addAccountForm.bankName.trim();
      newAccount.accountNumber = addAccountForm.accountNumber.trim();
    } else if (accountType === 'stripe') {
      newAccount.stripeAccountId = addAccountForm.stripeAccountId.trim();
      newAccount.stripeEmail = addAccountForm.stripeEmail.trim();
    }

    setAccountsList(prev => [...prev, newAccount]);
    setAddAccountForm({
      name: '',
      balance: '',
      currency: 'USD',
      holder: '',
      cardType: 'visa',
      expiry: '',
      cardNumber: '',
      cvc: '',
      walletAddress: '',
      cryptoType: 'BTC',
      exchangeName: '',
      apiKey: '',
      iban: '',
      swift: '',
      bankName: '',
      accountNumber: '',
      stripeAccountId: '',
      stripeEmail: '',
    });
    setAddAccountOpen(false);
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
      setCardsList(prev => prev.map(card => 
        card.id === addTransactionForm.cardId 
          ? { ...card, amount: Math.max(0, card.amount - amount) }
          : card
      ));
    } else {
      // Update card balance if it's income
      setCardsList(prev => prev.map(card => 
        card.id === addTransactionForm.cardId 
          ? { ...card, amount: card.amount + amount }
          : card
      ));
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
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">
            Manage your payments and financial overview
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'payments' | 'accounts')} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="accounts" className="flex items-center gap-2">
              <Wallet2 className="h-4 w-4" />
              Счета
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="space-y-6 mt-6">

            {/* Metrics — одинаковый размер карточек */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 items-stretch [&>*]:min-w-0">
          <MetricCard
            title="Total Balance"
            value={dashboardMetrics.totalBalance}
            icon={DollarSign}
            iconColor="green"
            trend={{ value: '+8% To the last month', isPositive: true }}
            delay={0}
          />
          <MetricCard
            title="Total Spending"
            value={dashboardMetrics.totalSpending}
            icon={TrendingDown}
            iconColor="red"
            trend={{ value: '-8% To the last month', isPositive: false }}
            delay={0.1}
          />
          <MetricCard
            title="Monthly Income"
            value={monthlyIncome}
            icon={DollarSign}
            iconColor="green"
            trend={{ value: 'This month', isPositive: true }}
            delay={0.15}
          />
          <MetricCard
            title="Avg Transaction"
            value={Math.round(avgTransaction)}
            icon={TrendingDown}
            iconColor="orange"
            trend={{ value: 'Per transaction', isPositive: true }}
            delay={0.2}
          />
          <MetricCard
            title="Transactions"
            value={String(totalTransactions)}
            icon={CreditCard}
            iconColor="purple"
            trend={{ value: `${completedTransactions} completed`, isPositive: true }}
            delay={0.25}
          />
        </div>

        {/* Sales Overview - Full Width */}
        <GlassChartCard 
          title="Sales Overview" 
          delay={0.2}
          className="w-full"
          style={{ height: 'clamp(600px, calc(100vh - 200px), 800px)' }}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <Select
                value={salesFilters.period}
                onValueChange={(v: 'monthly' | 'weekly' | 'yearly') =>
                  setSalesFilters((f) => ({ ...f, period: v }))
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={openSalesFilter}
                className="flex items-center gap-1.5"
              >
                <Filter className="h-4 w-4" />
                Filter{salesFilterCount > 0 ? ` (${salesFilterCount})` : ''}
              </Button>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7} />
                    </linearGradient>
                    <linearGradient id="barGradientHighlight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1e40af" stopOpacity={1} />
                      <stop offset="100%" stopColor="#1e40af" stopOpacity={0.7} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="rgba(0, 0, 0, 0.08)"
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="label" 
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
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="rect"
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)" 
                    radius={[8, 8, 0, 0]}
                    name={salesFilters.type === 'expense' ? 'Expenses' : salesFilters.type === 'all' ? 'Net' : 'Sales'}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Statistics Summary */}
            <div className="mt-4 flex flex-wrap gap-4 flex-shrink-0">
              <div className="flex-1 min-w-[120px] p-3 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <div className="text-xs text-muted-foreground mb-1">
                  {salesFilters.type === 'expense' ? 'Total Expenses' : salesFilters.type === 'all' ? 'Net' : 'Total Sales'}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  ${Math.abs(salesSummary.total).toLocaleString()}
                </div>
              </div>
              <div className="flex-1 min-w-[120px] p-3 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <div className="text-xs text-muted-foreground mb-1">Average</div>
                <div className="text-lg font-semibold text-foreground">
                  ${salesSummary.average.toLocaleString()}
                </div>
              </div>
              <div className="flex-1 min-w-[120px] p-3 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <div className="text-xs text-muted-foreground mb-1">Peak</div>
                <div className="text-lg font-semibold text-foreground">
                  {salesSummary.peakLabel}
                </div>
              </div>
              <div className="flex-1 min-w-[120px] p-3 rounded-xl" style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
              }}>
                <div className="text-xs text-muted-foreground mb-1">Growth</div>
                <div className="text-lg font-semibold" style={{ color: salesSummary.growthPercent >= 0 ? '#10b981' : '#ef4444' }}>
                  {salesSummary.growthPercent >= 0 ? '+' : ''}{salesSummary.growthPercent}%
                </div>
              </div>
            </div>
          </div>
            </GlassChartCard>

            {/* Recent Transactions */}
        <ChartCard title="Recent Transactions" delay={0.6}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Select
                value={txDatePreset}
                onValueChange={(v: '7days' | '30days' | '90days') => {
                  setTxDatePreset(v);
                  const now = new Date();
                  const days = v === '7days' ? 7 : v === '30days' ? 30 : 90;
                  setTxFilters((f) => ({ ...f, dateFrom: subDays(now, days), dateTo: now }));
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="90days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={openTxFilter}
                className="flex items-center gap-1.5"
              >
                <Filter className="h-4 w-4" />
                Filter{txFilterCount > 0 ? ` (${txFilterCount})` : ''}
              </Button>
            </div>
            <Button
              className="bg-green-500 hover:bg-green-600 text-white"
              size="sm"
              onClick={() => setAddTransactionOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200/50">
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Client</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Category</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Status</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider text-right">Amount</TableHead>
                  <TableHead className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((transaction, index) => {
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
                      label: 'Failed'
                    }
                  };
                  const status = statusConfig[transaction.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow 
                      key={transaction.id}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors"
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
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {transaction.type === 'income' ? 'Income' : 'Expense'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-foreground">
                            {format(new Date(transaction.date), 'MMM dd, yyyy')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(transaction.date), 'hh:mm a')}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
            </ChartCard>
          </TabsContent>

          <TabsContent value="accounts" className="space-y-6 mt-6">
            <Tabs value={accountsSubTab} onValueChange={(v) => setAccountsSubTab(v as AccountType)} className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="card" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Карты
                </TabsTrigger>
                <TabsTrigger value="crypto" className="flex items-center gap-2">
                  <Coins className="h-4 w-4" />
                  Крипто
                </TabsTrigger>
                <TabsTrigger value="exchange" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Биржи
                </TabsTrigger>
                <TabsTrigger value="bank" className="flex items-center gap-2">
                  <Wallet2 className="h-4 w-4" />
                  Банк
                </TabsTrigger>
                <TabsTrigger value="stripe" className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Stripe
                </TabsTrigger>
              </TabsList>

              {(['card', 'crypto', 'exchange', 'bank', 'stripe'] as AccountType[]).map((type) => {
                const filteredAccounts = accountsList.filter(acc => acc.type === type);
                const totalBalance = filteredAccounts.reduce((sum, a) => sum + a.balance, 0);
                
                const getAccountIcon = () => {
                  switch (type) {
                    case 'card': return CreditCard;
                    case 'crypto': return Coins;
                    case 'exchange': return Building2;
                    case 'bank': return Wallet2;
                    case 'stripe': return Sparkles;
                    default: return Wallet2;
                  }
                };
                
                const getAccountTypeLabel = () => {
                  switch (type) {
                    case 'card': return 'Cards';
                    case 'crypto': return 'Crypto Accounts';
                    case 'exchange': return 'Exchanges';
                    case 'bank': return 'Bank Accounts';
                    case 'stripe': return 'Stripe Accounts';
                    default: return 'Accounts';
                  }
                };

                const getCardGradient = () => {
                  switch (type) {
                    case 'card': return 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)';
                    case 'crypto': return 'linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)';
                    case 'exchange': return 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(22, 163, 74, 0.12) 100%)';
                    case 'bank': return 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(79, 70, 229, 0.12) 100%)';
                    case 'stripe': return 'linear-gradient(135deg, rgba(139, 92, 246, 0.12) 0%, rgba(124, 58, 237, 0.12) 100%)';
                    default: return 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(139, 92, 246, 0.12) 100%)';
                  }
                };

                const getCardBorder = () => {
                  switch (type) {
                    case 'card': return 'rgba(59, 130, 246, 0.3)';
                    case 'crypto': return 'rgba(251, 191, 36, 0.3)';
                    case 'exchange': return 'rgba(34, 197, 94, 0.3)';
                    case 'bank': return 'rgba(99, 102, 241, 0.3)';
                    case 'stripe': return 'rgba(139, 92, 246, 0.3)';
                    default: return 'rgba(59, 130, 246, 0.3)';
                  }
                };

                const getIconColor = () => {
                  switch (type) {
                    case 'card': return 'text-blue-600';
                    case 'crypto': return 'text-yellow-600';
                    case 'exchange': return 'text-green-600';
                    case 'bank': return 'text-indigo-600';
                    case 'stripe': return 'text-purple-600';
                    default: return 'text-blue-600';
                  }
                };

                const AccountIcon = getAccountIcon();
                
                return (
                  <TabsContent key={type} value={type} className="space-y-6">
                    <GlassChartCard title={getAccountTypeLabel()} delay={0.3} className="w-full">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground mb-1">{getAccountTypeLabel()}</h3>
                          {totalBalance > 0 && (
                            <p className="text-sm text-muted-foreground">
                              Общий баланс: {totalBalance.toLocaleString()} {filteredAccounts[0]?.currency || 'USD'}
                            </p>
                          )}
                        </div>
                        <Button 
                          className="bg-green-500 hover:bg-green-600 text-white" 
                          onClick={() => {
                            setAccountType(type);
                            setAddAccountOpen(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Добавить
                        </Button>
                      </div>
                      
                      {filteredAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredAccounts.map((account, index) => {
                            const accountPercentage = totalBalance > 0
                              ? (account.balance / totalBalance) * 100
                              : 0;
                            
                            return (
                              <motion.div
                                key={account.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 + index * 0.05 }}
                                whileHover={{ y: -4, scale: 1.02 }}
                                className="relative group cursor-pointer"
                                onDoubleClick={() => {
                                  setSelectedAccount(account);
                                  setAccountDetailOpen(true);
                                }}
                              >
                                <div
                                  className="p-6 rounded-xl h-full transition-all duration-300 border-2"
                                  style={{
                                    background: getCardGradient(),
                                    borderColor: getCardBorder(),
                                    backdropFilter: 'blur(10px)',
                                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                  }}
                                >
                                  <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${getIconColor().replace('text-', 'bg-').replace('-600', '-100')}`}>
                                        <AccountIcon className={`h-5 w-5 ${getIconColor()}`} />
                                      </div>
                                      <div>
                                        <div className="text-sm font-semibold text-foreground">{account.name}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {type === 'card' && account.cardNumber ? account.cardNumber : 
                                           type === 'crypto' && account.cryptoType ? account.cryptoType :
                                           type === 'exchange' && account.exchangeName ? account.exchangeName :
                                           type === 'bank' && account.bankName ? account.bankName :
                                           type === 'stripe' && account.stripeEmail ? account.stripeEmail : ''}
                                        </div>
                                      </div>
                                    </div>
                                    <span 
                                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                                      style={{
                                        background: 'rgba(16, 185, 129, 0.15)',
                                        color: '#10b981'
                                      }}
                                    >
                                      {account.status}
                                    </span>
                                  </div>
                                  
                                  <div className="mb-4">
                                    <div className="text-xs text-muted-foreground mb-1">Баланс</div>
                                    <div className="text-2xl font-bold text-foreground mb-1">
                                      {account.balance.toLocaleString()} {account.currency}
                                    </div>
                                    {filteredAccounts.length > 1 && (
                                      <div className="text-xs text-muted-foreground">
                                        {accountPercentage.toFixed(1)}% от общего
                                      </div>
                                    )}
                                  </div>
                                  
                                  {filteredAccounts.length > 1 && (
                                    <div className="mb-4">
                                      <div className="w-full h-2 rounded-full bg-gray-200/50 overflow-hidden">
                                        <div 
                                          className="h-full rounded-full transition-all duration-500"
                                          style={{
                                            width: `${accountPercentage}%`,
                                            background: type === 'card' ? 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)' :
                                                       type === 'crypto' ? 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)' :
                                                       type === 'exchange' ? 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)' :
                                                       type === 'bank' ? 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)' :
                                                       'linear-gradient(90deg, #8b5cf6 0%, #7c3aed 100%)'
                                          }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                  
                                  {type === 'card' && account.holder && (
                                    <div className="pt-3 border-t border-gray-200/30">
                                      <div className="text-xs text-muted-foreground mb-1">Владелец</div>
                                      <div className="text-sm font-semibold text-foreground">{account.holder}</div>
                                    </div>
                                  )}
                                  {type === 'crypto' && account.walletAddress && (
                                    <div className="pt-3 border-t border-gray-200/30">
                                      <div className="text-xs text-muted-foreground mb-1">Адрес кошелька</div>
                                      <div className="text-xs font-mono text-foreground break-all">
                                        {account.walletAddress.slice(0, 8)}...{account.walletAddress.slice(-6)}
                                      </div>
                                    </div>
                                  )}
                                  {type === 'exchange' && account.exchangeName && (
                                    <div className="pt-3 border-t border-gray-200/30">
                                      <div className="text-xs text-muted-foreground mb-1">Биржа</div>
                                      <div className="text-sm font-semibold text-foreground">{account.exchangeName}</div>
                                    </div>
                                  )}
                                  {type === 'bank' && account.bankName && (
                                    <div className="pt-3 border-t border-gray-200/30">
                                      <div className="text-xs text-muted-foreground mb-1">Банк</div>
                                      <div className="text-sm font-semibold text-foreground">{account.bankName}</div>
                                    </div>
                                  )}
                                  {type === 'stripe' && account.stripeEmail && (
                                    <div className="pt-3 border-t border-gray-200/30">
                                      <div className="text-xs text-muted-foreground mb-1">Email</div>
                                      <div className="text-sm font-semibold text-foreground">{account.stripeEmail}</div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-16 text-muted-foreground">
                          <AccountIcon className="h-16 w-16 mx-auto mb-4 opacity-30" />
                          <p className="text-lg font-medium mb-2">No {getAccountTypeLabel().toLowerCase()}</p>
                          <p className="text-sm">Click "Add" to create a new account</p>
                        </div>
                      )}
                    </GlassChartCard>
                  </TabsContent>
                );
              })}
            </Tabs>
          </TabsContent>
        </Tabs>

        <Dialog open={addCardOpen} onOpenChange={setAddCardOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                New card
              </DialogTitle>
              <DialogDescription>
                Add a payment card. Holder name, type, expiry and initial balance are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="card-holder">Cardholder name *</Label>
                <Input
                  id="card-holder"
                  value={addCardForm.holder}
                  onChange={(e) => setAddCardForm(f => ({ ...f, holder: e.target.value }))}
                  placeholder="JOHN DOE"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-number">Card number *</Label>
                <Input
                  id="card-number"
                  value={addCardForm.cardNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
                    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                    setAddCardForm(f => ({ ...f, cardNumber: formatted }));
                  }}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Type *</Label>
                  <Select
                    value={addCardForm.type}
                    onValueChange={(v: 'visa' | 'mastercard') => setAddCardForm(f => ({ ...f, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visa">Visa</SelectItem>
                      <SelectItem value="mastercard">Mastercard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="card-cvc">CVC</Label>
                  <Input
                    id="card-cvc"
                    type="text"
                    value={addCardForm.cvc}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setAddCardForm(f => ({ ...f, cvc: value }));
                    }}
                    placeholder="123"
                    maxLength={4}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-expiry">Expiry (MM/YY) *</Label>
                <Input
                  id="card-expiry"
                  value={addCardForm.expiry}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                      value = value.slice(0, 2) + '/' + value.slice(2, 4);
                    }
                    setAddCardForm(f => ({ ...f, expiry: value }));
                  }}
                  placeholder="12/26"
                  maxLength={5}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="card-amount">Initial balance ($) *</Label>
                <Input
                  id="card-amount"
                  type="number"
                  min={0}
                  value={addCardForm.amount}
                  onChange={(e) => setAddCardForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="10000"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddCardOpen(false)}>Cancel</Button>
              <Button
                onClick={handleAddCard}
                disabled={!addCardForm.holder.trim() || !addCardForm.expiry.trim() || !addCardForm.amount.trim() || !addCardForm.cardNumber.trim() || parseFloat(addCardForm.amount) < 0}
              >
                Add card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
                    {cardsList.map((card) => (
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

        {/* Sales Overview Filter Dialog */}
        <Dialog open={salesFilterOpen} onOpenChange={setSalesFilterOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Sales Overview Filters
              </DialogTitle>
              <DialogDescription>
                Filter chart and metrics by date range, type, category, status, and client.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-4 py-2">
              <div className="space-y-2">
                <Label>Date range</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => applySalesPreset('thisMonth')}>
                    This month
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applySalesPreset('last3')}>
                    Last 3 months
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applySalesPreset('thisYear')}>
                    This year
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => applySalesPreset('lastYear')}>
                    Last year
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">From</Label>
                    <Calendar
                      value={salesFilterDraft.dateFrom ?? undefined}
                      onChange={(d) => setSalesFilterDraft((f) => ({ ...f, dateFrom: d ?? null }))}
                      placeholder="Start date"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">To</Label>
                    <Calendar
                      value={salesFilterDraft.dateTo ?? undefined}
                      onChange={(d) => setSalesFilterDraft((f) => ({ ...f, dateTo: d ?? null }))}
                      placeholder="End date"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select
                    value={salesFilterDraft.period}
                    onValueChange={(v: 'monthly' | 'weekly' | 'yearly') =>
                      setSalesFilterDraft((f) => ({ ...f, period: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={salesFilterDraft.type}
                    onValueChange={(v: 'income' | 'expense' | 'all') =>
                      setSalesFilterDraft((f) => ({ ...f, type: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-3 p-3 rounded-lg border bg-muted/30">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={salesFilterDraft.categories.includes(cat)}
                          onChange={() => toggleCategory(cat, true)}
                          className="rounded border-input focus:outline-2 focus:outline-ring focus:outline-offset-0"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-3 p-3 rounded-lg border bg-muted/30">
                  {(['completed', 'pending', 'failed'] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                      <input
                        type="checkbox"
                        checked={salesFilterDraft.statuses.includes(s)}
                        onChange={() => toggleStatus(s, true)}
                        className="rounded border-input focus:outline-2 focus:outline-ring focus:outline-offset-0"
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
              </div>
              {txClients.length > 0 && (
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select
                    value={salesFilterDraft.clientId ?? 'all'}
                    onValueChange={(v) =>
                      setSalesFilterDraft((f) => ({ ...f, clientId: v === 'all' ? null : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All clients</SelectItem>
                      {txClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setSalesFilterDraft(defaultSalesFilters);
                }}
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  setSalesFilters(salesFilterDraft);
                  setSalesFilterOpen(false);
                }}
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Recent Transactions Filter Dialog */}
        <Dialog open={txFilterOpen} onOpenChange={setTxFilterOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Transaction Filters
              </DialogTitle>
              <DialogDescription>
                Filter the recent transactions table by type, category, status, and client. Date range is set by the dropdown above the table.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[50vh] pr-2 space-y-4 py-2">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={txFilterDraft.type}
                  onValueChange={(v: 'income' | 'expense' | 'all') =>
                    setTxFilterDraft((f) => ({ ...f, type: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {categories.length > 0 && (
                <div className="space-y-2">
                  <Label>Categories</Label>
                  <div className="flex flex-wrap gap-3 p-3 rounded-lg border bg-muted/30">
                    {categories.map((cat) => (
                      <label key={cat} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input
                          type="checkbox"
                          checked={txFilterDraft.categories.includes(cat)}
                          onChange={() => toggleCategory(cat, false)}
                          className="rounded border-input focus:outline-2 focus:outline-ring focus:outline-offset-0"
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex flex-wrap gap-3 p-3 rounded-lg border bg-muted/30">
                  {(['completed', 'pending', 'failed'] as const).map((s) => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                      <input
                        type="checkbox"
                        checked={txFilterDraft.statuses.includes(s)}
                        onChange={() => toggleStatus(s, false)}
                        className="rounded border-input focus:outline-2 focus:outline-ring focus:outline-offset-0"
                      />
                      <span>{s}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Leave all unchecked to include all statuses.</p>
              </div>
              {txClients.length > 0 && (
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select
                    value={txFilterDraft.clientId ?? 'all'}
                    onValueChange={(v) =>
                      setTxFilterDraft((f) => ({ ...f, clientId: v === 'all' ? null : v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All clients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All clients</SelectItem>
                      {txClients.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() =>
                  setTxFilterDraft({ ...defaultTxFilters, dateFrom: txFilters.dateFrom, dateTo: txFilters.dateTo })
                }
              >
                Reset
              </Button>
              <Button
                onClick={() => {
                  setTxFilters(txFilterDraft);
                  setTxFilterOpen(false);
                }}
              >
                Apply
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={addAccountOpen} onOpenChange={setAddAccountOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet2 className="h-5 w-5" />
                Добавить счет
              </DialogTitle>
              <DialogDescription>
                Выберите тип счета и заполните необходимые данные
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[60vh] pr-2 space-y-4 py-2">
              <div className="grid gap-2">
                <Label>Тип счета *</Label>
                <Select
                  value={accountType}
                  onValueChange={(v: AccountType) => setAccountType(v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Карта
                      </div>
                    </SelectItem>
                    <SelectItem value="crypto">
                      <div className="flex items-center gap-2">
                        <Coins className="h-4 w-4" />
                        Крипто счет
                      </div>
                    </SelectItem>
                    <SelectItem value="exchange">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Биржа
                      </div>
                    </SelectItem>
                    <SelectItem value="bank">
                      <div className="flex items-center gap-2">
                        <Wallet2 className="h-4 w-4" />
                        Банковский счет (IBAN/SWIFT)
                      </div>
                    </SelectItem>
                    <SelectItem value="stripe">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Stripe
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="account-name">Account Name *</Label>
                <Input
                  id="account-name"
                  value={addAccountForm.name}
                  onChange={(e) => setAddAccountForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="My main account"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="account-balance">Balance *</Label>
                  <Input
                    id="account-balance"
                    type="number"
                    min={0}
                    value={addAccountForm.balance}
                    onChange={(e) => setAddAccountForm(f => ({ ...f, balance: e.target.value }))}
                    placeholder="0"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="account-currency">Currency</Label>
                  <Select
                    value={addAccountForm.currency}
                    onValueChange={(v) => setAddAccountForm(f => ({ ...f, currency: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="RUB">RUB</SelectItem>
                      <SelectItem value="BTC">BTC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Card specific fields */}
              {accountType === 'card' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="card-holder-acc">Имя владельца *</Label>
                    <Input
                      id="card-holder-acc"
                      value={addAccountForm.holder}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, holder: e.target.value }))}
                      placeholder="JOHN DOE"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="card-number-acc">Номер карты *</Label>
                    <Input
                      id="card-number-acc"
                      value={addAccountForm.cardNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\s/g, '').replace(/\D/g, '').slice(0, 16);
                        const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                        setAddAccountForm(f => ({ ...f, cardNumber: formatted }));
                      }}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Тип карты</Label>
                      <Select
                        value={addAccountForm.cardType}
                        onValueChange={(v: 'visa' | 'mastercard') => setAddAccountForm(f => ({ ...f, cardType: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="visa">Visa</SelectItem>
                          <SelectItem value="mastercard">Mastercard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="card-expiry-acc">Срок действия (MM/YY)</Label>
                      <Input
                        id="card-expiry-acc"
                        value={addAccountForm.expiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setAddAccountForm(f => ({ ...f, expiry: value }));
                        }}
                        placeholder="12/26"
                        maxLength={5}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Crypto specific fields */}
              {accountType === 'crypto' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="crypto-type">Тип криптовалюты</Label>
                    <Select
                      value={addAccountForm.cryptoType}
                      onValueChange={(v) => setAddAccountForm(f => ({ ...f, cryptoType: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                        <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                        <SelectItem value="USDT">Tether (USDT)</SelectItem>
                        <SelectItem value="BNB">Binance Coin (BNB)</SelectItem>
                        <SelectItem value="SOL">Solana (SOL)</SelectItem>
                        <SelectItem value="XRP">Ripple (XRP)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="wallet-address">Адрес кошелька</Label>
                    <Input
                      id="wallet-address"
                      value={addAccountForm.walletAddress}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, walletAddress: e.target.value }))}
                      placeholder="0x..."
                    />
                  </div>
                </>
              )}

              {/* Exchange specific fields */}
              {accountType === 'exchange' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="exchange-name">Exchange Name *</Label>
                    <Select
                      value={addAccountForm.exchangeName}
                      onValueChange={(v) => setAddAccountForm(f => ({ ...f, exchangeName: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select exchange" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Binance">Binance</SelectItem>
                        <SelectItem value="Coinbase">Coinbase</SelectItem>
                        <SelectItem value="Kraken">Kraken</SelectItem>
                        <SelectItem value="Bybit">Bybit</SelectItem>
                        <SelectItem value="OKX">OKX</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="api-key">API Key</Label>
                    <Input
                      id="api-key"
                      type="password"
                      value={addAccountForm.apiKey}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, apiKey: e.target.value }))}
                      placeholder="Enter API key"
                    />
                  </div>
                </>
              )}

              {/* Bank specific fields */}
              {accountType === 'bank' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="bank-name">Название банка *</Label>
                    <Input
                      id="bank-name"
                      value={addAccountForm.bankName}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, bankName: e.target.value }))}
                      placeholder="Bank name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="iban">IBAN</Label>
                    <Input
                      id="iban"
                      value={addAccountForm.iban}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, iban: e.target.value.toUpperCase() }))}
                      placeholder="GB82 WEST 1234 5698 7654 32"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="swift">SWIFT/BIC</Label>
                    <Input
                      id="swift"
                      value={addAccountForm.swift}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, swift: e.target.value.toUpperCase() }))}
                      placeholder="CHASUS33"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="account-number">Номер счета</Label>
                    <Input
                      id="account-number"
                      value={addAccountForm.accountNumber}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, accountNumber: e.target.value }))}
                      placeholder="1234567890"
                    />
                  </div>
                </>
              )}

              {/* Stripe specific fields */}
              {accountType === 'stripe' && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="stripe-account-id">Stripe Account ID</Label>
                    <Input
                      id="stripe-account-id"
                      value={addAccountForm.stripeAccountId}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, stripeAccountId: e.target.value }))}
                      placeholder="acct_..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="stripe-email">Email аккаунта Stripe</Label>
                    <Input
                      id="stripe-email"
                      type="email"
                      value={addAccountForm.stripeEmail}
                      onChange={(e) => setAddAccountForm(f => ({ ...f, stripeEmail: e.target.value }))}
                      placeholder="account@example.com"
                    />
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddAccountOpen(false)}>Отмена</Button>
              <Button
                onClick={handleAddAccount}
                disabled={!addAccountForm.name.trim() || !addAccountForm.balance.trim() || parseFloat(addAccountForm.balance) < 0}
              >
                Добавить счет
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

        <AccountDetailModal
          open={accountDetailOpen}
          onOpenChange={setAccountDetailOpen}
          account={selectedAccount}
          transactions={transactionsList}
        />
      </div>
    </PageTransition>
  );
}
