import { useState, useRef } from 'react';
import { PageTransition } from '@/components/shared/PageTransition';
import { investments as initialInvestments, investmentTemplates as initialTemplates } from '@/data/mockData';
import type { Investment as InvestmentType, InvestmentTemplate } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Percent, Plus } from 'lucide-react';
import { PortfolioPerformanceChart } from '@/components/investment/PortfolioPerformanceChart';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { AddInvestmentDialog } from '@/components/investment/AddInvestmentDialog';
import { InvestmentDetailModal } from '@/components/investment/InvestmentDetailModal';

// Type label override (e.g. Real Estate → REIT)
const typeLabel: Record<string, string> = {
  Stocks: 'Stocks',
  'Real Estate': 'REIT',
  Crypto: 'Crypto',
  Bonds: 'Bonds',
};

// SVG Icons from design (bar chart, building, crypto, dollar)
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
    <line x1="9" y1="22" x2="9" y2="22.01" />
    <line x1="15" y1="22" x2="15" y2="22.01" />
    <line x1="12" y1="22" x2="12" y2="22.01" />
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
const IconTrend = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
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

// Неоморфные тени как у KPI-карточек дашборда
const iconShadowPressed = `
  inset 5px 5px 10px rgba(0, 0, 0, 0.2),
  inset -4px -4px 8px rgba(255, 255, 255, 1),
  inset 2px 2px 5px rgba(0, 0, 0, 0.12)
`;
const iconShadowRaised = `
  5px 5px 10px rgba(0, 0, 0, 0.15),
  -3px -3px 6px rgba(255, 255, 255, 1),
  inset 0 1px 2px rgba(255, 255, 255, 0.6)
`;

export default function Investment() {
  const [hoveredRowId, setHoveredRowId] = useState<string | null>(null);
  const [investments, setInvestments] = useState<InvestmentType[]>(initialInvestments);
  const [templates, setTemplates] = useState<InvestmentTemplate[]>(initialTemplates);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<InvestmentType | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const clickTimeoutRefs = useRef<Map<string, number>>(new Map());

  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const totalReturn = investments.reduce((sum, inv) => sum + inv.return, 0);
  const initialValue = totalValue - totalReturn;
  const totalReturnPercent = initialValue > 0 ? (totalReturn / initialValue) * 100 : 0;
  const weightPercent = (val: number) => totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : '0.0';

  const handleAddTemplate = (templateData: Omit<InvestmentTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: InvestmentTemplate = {
      ...templateData,
      id: `tpl${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTemplates([...templates, newTemplate]);
  };

  const handleAddInvestment = (investmentData: Omit<InvestmentType, 'id' | 'currentValue' | 'return' | 'returnPercent'>) => {
    // Генерируем случайные значения для демонстрации (в реальном приложении это будет из API)
    const returnPercent = Math.random() * 20 - 5; // От -5% до +15%
    const returnAmount = (investmentData.amount * returnPercent) / 100;
    const currentValue = investmentData.amount + returnAmount;

    const newInvestment: InvestmentType = {
      ...investmentData,
      id: `inv${Date.now()}`,
      currentValue: Math.round(currentValue),
      return: Math.round(returnAmount),
      returnPercent: Math.round(returnPercent * 100) / 100,
    };
    setInvestments([...investments, newInvestment]);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Investment</h1>
            <p className="text-muted-foreground">
              Track your investment portfolio and performance
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Добавить инвестицию
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <MetricCard
            title="Total Portfolio Value"
            value={totalValue}
            icon={DollarSign}
            iconColor="blue"
            delay={0}
          />
          <MetricCard
            title="Total Return"
            value={`+$${totalReturn.toLocaleString()}`}
            icon={TrendingUp}
            iconColor="green"
            trend={{ value: `+${totalReturnPercent.toFixed(2)}% return`, isPositive: true }}
            delay={0.1}
          />
          <MetricCard
            title="Return %"
            value={`+${totalReturnPercent.toFixed(2)}%`}
            icon={Percent}
            iconColor="green"
            delay={0.2}
          />
        </div>

        {/* Performance Chart — functional, beautiful, wow */}
        <PortfolioPerformanceChart totalValue={totalValue} totalReturn={totalReturn} />

        {/* Investments Table — новый дизайн строк и колонок */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-0 shadow-xl overflow-hidden rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-slate-100">
            <CardHeader className="px-8 py-5 bg-slate-50/50 border-b border-slate-100">
              <CardTitle className="text-lg font-semibold text-slate-800 tracking-tight">Investment Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Table Header — новый дизайн */}
              <div className="grid grid-cols-12 gap-4 px-8 py-5 border-b border-slate-50 bg-slate-50/50 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                <div className="col-span-5">Asset</div>
                <div className="col-span-3 text-right">Valuation</div>
                <div className="col-span-2 text-right">Profit</div>
                <div className="col-span-2 text-right">Return</div>
              </div>

              {/* Asset Rows — новый дизайн */}
              <div className="divide-y divide-slate-50">
                {investments.map((investment, index) => {
                  const Icon = iconByType[investment.type] || IconStocks;
                  const iconBg = iconBgByType[investment.type] || iconBgByType.Stocks;
                  const label = typeLabel[investment.type] || investment.type;
                  const weight = weightPercent(investment.currentValue);
                  const isPositive = investment.return >= 0;

                  // Обработчик двойного клика на строку инвестиции
                  const handleRowDoubleClick = () => {
                    setSelectedInvestment(investment);
                    setIsDetailModalOpen(true);
                  };

                  // Обработчик одинарного клика (для предотвращения конфликта с двойным)
                  const handleRowClick = () => {
                    const existingTimeout = clickTimeoutRefs.current.get(investment.id);
                    
                    if (existingTimeout !== undefined) {
                      // Это двойной клик
                      window.clearTimeout(existingTimeout);
                      clickTimeoutRefs.current.delete(investment.id);
                      handleRowDoubleClick();
                    } else {
                      // Это первый клик - ждем возможного второго
                      const timeoutId = window.setTimeout(() => {
                        clickTimeoutRefs.current.delete(investment.id);
                        // Здесь можно добавить логику для одинарного клика, если нужно
                      }, 300); // Задержка для определения двойного клика
                      clickTimeoutRefs.current.set(investment.id, timeoutId);
                    }
                  };

                  return (
                    <motion.div
                      key={investment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + index * 0.08, duration: 0.4 }}
                      className="group grid grid-cols-12 gap-4 px-8 py-6 items-center hover:bg-slate-50 transition-colors duration-200 cursor-pointer"
                      onMouseEnter={() => setHoveredRowId(investment.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                      onClick={handleRowClick}
                    >
                      <div className="col-span-5 flex items-center gap-5">
                        <div
                          className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center transition-all duration-300 ease-out`}
                          style={{
                            boxShadow: hoveredRowId === investment.id ? iconShadowRaised : iconShadowPressed,
                            transform: hoveredRowId === investment.id ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)',
                          }}
                        >
                          <Icon />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900">{investment.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">{label}</span>
                            <span className="text-xs text-slate-400">{weight}% weight</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-span-3 text-right">
                        <div className="text-base font-bold text-slate-900 tabular-nums">${investment.currentValue.toLocaleString()}</div>
                        <div className="text-xs text-slate-400 mt-0.5 tabular-nums">Initial: ${investment.amount.toLocaleString()}</div>
                      </div>
                      <div className="col-span-2 text-right">
                        <div className="text-sm font-semibold text-emerald-600 tabular-nums">
                          {isPositive ? '+' : ''}${Math.abs(investment.return).toLocaleString()}
                        </div>
                      </div>
                      <div className="col-span-2 flex justify-end">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-emerald-700">
                          <IconTrend />
                          <span className="text-xs font-bold tabular-nums">
                            {isPositive ? '+' : ''}{investment.returnPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AddInvestmentDialog
          open={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          templates={templates}
          onAddTemplate={handleAddTemplate}
          onAddInvestment={handleAddInvestment}
        />

        <InvestmentDetailModal
          open={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedInvestment(null);
          }}
          investment={selectedInvestment}
        />
      </div>
    </PageTransition>
  );
}
