import { motion } from 'framer-motion';
import { format, parseISO, differenceInDays } from 'date-fns';
import { AlertCircle, FileText, DollarSign, Calendar } from 'lucide-react';
import type { Invoice } from '@/data/mockData';
import { cn } from '@/lib/utils';

interface UrgentInvoicesCardProps {
  invoices: Invoice[];
  delay?: number;
}

export function UrgentInvoicesCard({ invoices, delay = 0 }: UrgentInvoicesCardProps) {
  const today = new Date();
  
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'paid');

  const getDaysUntilNum = (dueDateString: string) =>
    differenceInDays(parseISO(dueDateString), today);

  // Сортировка по срочности: сначала просроченные (самые старые первыми), потом сегодня, завтра, через 2–3 дня
  const sortByUrgency = (a: Invoice, b: Invoice) => {
    const daysA = getDaysUntilNum(a.dueDate);
    const daysB = getDaysUntilNum(b.dueDate);
    return daysA - daysB; // отрицательные (просрочка) первыми, потом 0, 1, 2, 3
  };

  const urgentInvoices = unpaidInvoices
    .filter(inv => getDaysUntilNum(inv.dueDate) <= 3)
    .sort(sortByUrgency);

  const regularInvoices = unpaidInvoices
    .filter(inv => getDaysUntilNum(inv.dueDate) > 3)
    .sort(sortByUrgency);

  const getDaysUntil = (dueDateString: string) => {
    const dueDate = parseISO(dueDateString);
    const daysUntil = differenceInDays(dueDate, today);
    if (daysUntil < 0) return 'Overdue';
    if (daysUntil === 0) return 'Today';
    if (daysUntil === 1) return 'Tomorrow';
    return `In ${daysUntil} days`;
  };

  const getInvoiceType = (invoice: Invoice) => {
    const description = (invoice.items[0]?.description || '').toLowerCase();
    const name = (invoice.clientName || '').toLowerCase();
    if (description.includes('rent') || name.includes('rent')) return 'Rent';
    if (description.includes('utilit') || name.includes('utilit')) return 'Utilities';
    if (description.includes('equipment') || name.includes('equipment')) return 'Equipment';
    if (description.includes('insur') || name.includes('insur')) return 'Insurance';
    if (description.includes('subscription') || name.includes('subscription')) return 'Subscription';
    return 'Other';
  };

  const allSections = (
    <>
      {urgentInvoices.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1.5">
            URGENT INVOICES
          </div>
          <div className="space-y-1.5">
            {urgentInvoices.map((invoice) => {
              const daysUntil = differenceInDays(parseISO(invoice.dueDate), today);
              const isOverdue = daysUntil < 0;
              return (
                <div
                  key={invoice.id}
                  className={cn(
                    'p-2.5 rounded-lg border transition-colors',
                    isOverdue
                      ? 'bg-red-50/90 border-red-200/60 hover:bg-red-100/80'
                      : 'bg-amber-50/90 border-amber-200/60 hover:bg-amber-100/80'
                  )}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <FileText className="h-3 w-3 text-orange-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800">{getInvoiceType(invoice)}</span>
                    <span className={cn('text-[10px] font-medium', isOverdue ? 'text-red-600' : 'text-amber-700')}>
                      {getDaysUntil(invoice.dueDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    {format(parseISO(invoice.dueDate), 'dd.MM.yyyy')}
                  </div>
                  {invoice.items[0] && (
                    <div className="text-xs text-gray-600 truncate mt-0.5">{invoice.items[0].description}</div>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <DollarSign className="h-3 w-3 text-gray-500 flex-shrink-0" />
                    <span className="text-sm font-bold text-slate-900">${invoice.amount}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {regularInvoices.length > 0 && (
        <div>
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
            NON-URGENT INVOICES
          </div>
          <div className="space-y-1.5">
            {regularInvoices.map((invoice) => (
              <div
                key={invoice.id}
                className="p-2.5 rounded-lg bg-slate-50/80 border border-slate-200/60 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <FileText className="h-3 w-3 text-slate-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-slate-800">{getInvoiceType(invoice)}</span>
                  <span className="text-[10px] text-slate-500">{getDaysUntil(invoice.dueDate)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <Calendar className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  {format(parseISO(invoice.dueDate), 'dd.MM.yyyy')}
                </div>
                {invoice.items[0] && (
                  <div className="text-xs text-gray-600 truncate mt-0.5">{invoice.items[0].description}</div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <DollarSign className="h-3 w-3 text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-bold text-slate-900">${invoice.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="h-[340px] flex flex-col"
    >
      <div className="rounded-2xl flex flex-col h-full overflow-hidden border border-slate-200/80 bg-white shadow-[0_4px_14px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="flex-shrink-0 px-4 pt-4 pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="icon-inset flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <AlertCircle className="h-4 w-4" />
            </span>
            Срочные инвойсы
          </h3>
        </div>
        <div className="dashboard-card-scroll flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 py-3 pr-1 [scrollbar-gutter:stable]">
          {unpaidInvoices.length > 0 ? allSections : (
            <div className="flex h-full min-h-[200px] items-center justify-center text-slate-400 text-sm">
              No unpaid invoices
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
