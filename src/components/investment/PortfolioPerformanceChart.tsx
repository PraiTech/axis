import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Sparkles, DollarSign, Percent } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import type { TooltipProps } from 'recharts';

const RANGES = ['1M', '3M', '6M', '1Y', 'All'] as const;
type RangeKey = (typeof RANGES)[number];

// Extended mock history (last 14 months) — in production would come from API
function buildPerformanceHistory(currentTotal: number): { month: string; value: number; short: string }[] {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const now = new Date();
  const result: { month: string; value: number; short: string }[] = [];
  // Start from ~14 months ago, end with current total
  const seed = currentTotal * 0.88;
  const step = (currentTotal - seed) / 13;
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = months[d.getMonth()];
    const yearLabel = d.getFullYear().toString().slice(2);
    const value = i === 0 ? currentTotal : Math.round(seed + step * (13 - i) + (Math.random() - 0.5) * step * 0.3);
    result.push({
      month: `${monthLabel} ${yearLabel}`,
      value: Math.max(0, value),
      short: monthLabel,
    });
  }
  return result;
}

function filterByRange(
  data: { month: string; value: number; short: string }[],
  range: RangeKey
): { month: string; value: number; short: string }[] {
  const n = data.length;
  if (range === 'All') return data;
  const count = range === '1M' ? 1 : range === '3M' ? 3 : range === '6M' ? 6 : 12;
  return data.slice(Math.max(0, n - count), n);
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Custom tooltip for premium look
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const v = payload[0].value ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8 }}
      className="relative rounded-2xl border border-blue-200/60 bg-gradient-to-br from-white to-blue-50/30 px-5 py-4 shadow-2xl shadow-blue-500/10 backdrop-blur-md"
      style={{
        boxShadow: '0 10px 40px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1)',
      }}
    >
      <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 rounded-sm border-l border-t border-blue-200/60 bg-gradient-to-br from-white to-blue-50/30" />
      <div className="text-xs font-semibold text-blue-600 uppercase tracking-widest">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <Sparkles className="h-4 w-4 text-blue-500" />
        <div className="text-2xl font-bold tabular-nums text-slate-900">{formatCurrency(v)}</div>
      </div>
    </motion.div>
  );
}

interface PortfolioPerformanceChartProps {
  totalValue: number;
  totalReturn: number;
  className?: string;
}

export function PortfolioPerformanceChart({ totalValue, totalReturn, className = '' }: PortfolioPerformanceChartProps) {
  const [range, setRange] = useState<RangeKey>('6M');

  const fullData = useMemo(() => buildPerformanceHistory(totalValue), [totalValue]);
  const data = useMemo(() => filterByRange(fullData, range), [fullData, range]);

  const firstValue = data[0]?.value ?? 0;
  const lastValue = data[data.length - 1]?.value ?? totalValue;
  const changeAmount = lastValue - firstValue;
  const changePercent = firstValue > 0 ? (changeAmount / firstValue) * 100 : 0;
  const isPositive = changeAmount >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200/40 bg-gradient-to-br from-white via-white to-blue-50/20 p-5 shadow-2xl shadow-blue-500/5 sm:p-6 lg:p-8 ${className}`}
      style={{
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(59, 130, 246, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
      }}
    >
      {/* Decorative gradient orb */}
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-400/20 via-purple-400/10 to-transparent blur-3xl transition-opacity duration-1000 group-hover:opacity-80" />
      <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-tr from-emerald-400/15 via-blue-400/10 to-transparent blur-3xl transition-opacity duration-1000 group-hover:opacity-80" />
      {/* Header + range tabs */}
      <div className="relative mb-6 flex flex-wrap items-center justify-between gap-4 sm:mb-8">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Portfolio Performance</h3>
          <p className="mt-1 text-sm text-slate-500">Track your investment growth over time</p>
        </div>
        <div className="flex rounded-2xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100/80 p-1.5 shadow-inner">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={`relative rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-300 sm:px-5 sm:py-2.5 sm:text-sm ${
                range === r
                  ? 'text-slate-900 shadow-lg'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {r}
              {range === r && (
                <motion.span
                  layoutId="portfolio-range-pill"
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-white to-blue-50/50 shadow-md"
                  transition={{ type: 'spring', bounce: 0.25, duration: 0.5 }}
                  style={{ zIndex: -1 }}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* KPI strip — enhanced with cards */}
      <div className="relative mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
        {/* Current Value Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="group/kpi relative overflow-hidden rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-lg shadow-blue-500/5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100" />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <div className="rounded-lg bg-blue-100 p-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Current Value</div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={lastValue}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-2xl font-bold tabular-nums text-slate-900 sm:text-3xl"
              >
                {formatCurrency(lastValue)}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Change Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`group/kpi relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${
            isPositive
              ? 'border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30 shadow-emerald-500/5 hover:shadow-emerald-500/10'
              : 'border-rose-200/60 bg-gradient-to-br from-white to-rose-50/30 shadow-rose-500/5 hover:shadow-rose-500/10'
          }`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100 ${
              isPositive ? 'from-emerald-500/5 to-transparent' : 'from-rose-500/5 to-transparent'
            }`}
          />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              {isPositive ? (
                <div className="rounded-lg bg-emerald-100 p-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
              ) : (
                <div className="rounded-lg bg-rose-100 p-2">
                  <TrendingDown className="h-4 w-4 text-rose-600" />
                </div>
              )}
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Change (Period)</div>
            </div>
            <motion.div
              className={`text-2xl font-bold tabular-nums sm:text-3xl ${
                isPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
              initial={false}
              animate={{ opacity: 1 }}
            >
              {isPositive ? '+' : ''}{formatCurrency(changeAmount)}
            </motion.div>
          </div>
        </motion.div>

        {/* Return % Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`group/kpi relative overflow-hidden rounded-2xl border p-5 shadow-lg transition-all duration-300 hover:shadow-xl ${
            isPositive
              ? 'border-emerald-200/60 bg-gradient-to-br from-white to-emerald-50/30 shadow-emerald-500/5 hover:shadow-emerald-500/10'
              : 'border-rose-200/60 bg-gradient-to-br from-white to-rose-50/30 shadow-rose-500/5 hover:shadow-rose-500/10'
          }`}
        >
          <div
            className={`absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover/kpi:opacity-100 ${
              isPositive ? 'from-emerald-500/5 to-transparent' : 'from-rose-500/5 to-transparent'
            }`}
          />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2">
              <div className={`rounded-lg p-2 ${isPositive ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                <Percent className={`h-4 w-4 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`} />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Return %</div>
            </div>
            <motion.div
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xl font-bold tabular-nums sm:text-2xl ${
                isPositive
                  ? 'bg-emerald-100/80 text-emerald-700 shadow-sm shadow-emerald-500/10'
                  : 'bg-rose-100/80 text-rose-700 shadow-sm shadow-rose-500/10'
              }`}
            >
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Chart */}
      <div className="relative h-[320px] w-full sm:h-[380px]" style={{ minHeight: 'var(--chart-min-h, 320px)' }}>
        {/* Glow effect behind chart */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/3 to-transparent blur-2xl" />
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 16, right: 16, left: 8, bottom: 8 }}
          >
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.5} />
                <stop offset="30%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="60%" stopColor="#6366f1" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="portfolioLine" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#2563eb" />
                <stop offset="50%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgb(226 232 240)"
              vertical={false}
              strokeOpacity={0.5}
            />
            <XAxis
              dataKey="short"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              dy={12}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              width={56}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{
                stroke: '#3b82f6',
                strokeWidth: 2,
                strokeDasharray: '6 4',
                strokeOpacity: 0.4,
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="url(#portfolioLine)"
              strokeWidth={3}
              fill="url(#portfolioGradient)"
              isAnimationActive
              animationDuration={1200}
              animationEasing="ease-out"
              dot={false}
              activeDot={{
                r: 8,
                fill: '#fff',
                stroke: '#3b82f6',
                strokeWidth: 3,
                filter: 'url(#glow)',
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-3 w-8 rounded-full bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-500 shadow-sm shadow-blue-500/30" />
            <span className="font-semibold">Portfolio Value</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
