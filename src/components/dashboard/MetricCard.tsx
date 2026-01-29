import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import logger from '@/lib/logger';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: 'blue' | 'purple' | 'green' | 'orange' | 'red';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
  formatAsCurrency?: boolean;
}

const iconColorClasses = {
  blue: 'bg-[#eff6ff] text-[#3b82f6]',
  purple: 'bg-[#f5f3ff] text-[#8b5cf6]',
  green: 'bg-[#ecfdf5] text-[#10b981]',
  orange: 'bg-[#fff7ed] text-[#f97316]',
  red: 'bg-[#fef2f2] text-[#ef4444]',
};

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor = 'blue',
  trend,
  delay = 0,
  formatAsCurrency = true
}: MetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    logger.debug('COMPONENT', `Карточка метрики "${title}" отрендерена`, {
      title,
      value,
      delay
    }, 'MetricCard', 'RENDER');
  }, [title, value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="group h-full min-w-0"
    >
      <div 
        className="bg-white rounded-[20px] p-4 sm:p-5 lg:p-6 flex items-center gap-3 sm:gap-4 lg:gap-5 cursor-default transition-all duration-300 ease-out overflow-hidden h-full min-h-[120px]"
        style={{
          // Неоморфный эффект впадины: темная тень сверху-слева, светлая снизу-справа
          boxShadow: `
            inset 3px 3px 6px rgba(0, 0, 0, 0.08),
            inset -3px -3px 6px rgba(255, 255, 255, 1),
            0 2px 4px rgba(0, 0, 0, 0.02)
          `,
          border: 'none'
        }}
        onMouseEnter={(e) => {
          setIsHovered(true);
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = `
            inset 2px 2px 5px rgba(0, 0, 0, 0.07),
            inset -2px -2px 5px rgba(255, 255, 255, 1),
            0 4px 8px rgba(0, 0, 0, 0.04)
          `;
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = `
            inset 3px 3px 6px rgba(0, 0, 0, 0.08),
            inset -3px -3px 6px rgba(255, 255, 255, 1),
            0 2px 4px rgba(0, 0, 0, 0.02)
          `;
        }}
      >
        {/* Иконка слева - вдавленная по умолчанию, выпуклая при hover */}
        <div 
          className={cn(
            "rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ease-out",
            "w-[var(--metric-icon-size)] h-[var(--metric-icon-size)] min-w-[2rem] min-h-[2rem]",
            iconColorClasses[iconColor]
          )}
          style={{
            fontWeight: 600,
            // По умолчанию: вдавленная (вмятая) - усиленный эффект
            // При hover: выпуклая башенка
            boxShadow: isHovered 
              ? `
                  5px 5px 10px rgba(0, 0, 0, 0.15),
                  -3px -3px 6px rgba(255, 255, 255, 1),
                  inset 0 1px 2px rgba(255, 255, 255, 0.6)
                `
              : `
                  inset 5px 5px 10px rgba(0, 0, 0, 0.2),
                  inset -4px -4px 8px rgba(255, 255, 255, 1),
                  inset 2px 2px 5px rgba(0, 0, 0, 0.12)
                `,
            transform: isHovered ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)'
          }}
        >
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
        
        {/* Контент справа - одинаковый размер карточек */}
        <div className="flex flex-col min-w-0 flex-1">
          <span 
            className="font-semibold text-fluid-sm text-slate-500 mb-0.5 block truncate"
            style={{ fontWeight: 600 }}
          >
            {title}
          </span>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              delay: delay + 0.15, 
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="text-fluid-2xl text-slate-800 font-bold tracking-tight leading-tight truncate"
            style={{ fontWeight: 700 }}
          >
            {typeof value === 'number' 
              ? (formatAsCurrency ? `$${value.toLocaleString()}` : value.toLocaleString())
              : value}
          </motion.span>
          {trend && (
            <p className={cn(
              "text-fluid-xs mt-1.5 flex items-center gap-1 min-h-[1.25rem]",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              <span className="flex-shrink-0">{trend.isPositive ? '↑' : '↓'}</span>
              <span className="truncate">{trend.value}</span>
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
