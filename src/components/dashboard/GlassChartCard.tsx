import { motion } from 'framer-motion';
import { ReactNode, CSSProperties } from 'react';
import { cn } from '@/lib/utils';

interface GlassChartCardProps {
  title: string;
  children: ReactNode;
  delay?: number;
  className?: string;
  style?: CSSProperties;
}

export function GlassChartCard({ 
  title, 
  children, 
  delay = 0,
  className,
  style
}: GlassChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1]
      }}
      className={cn("flex flex-col h-full", className)}
    >
      <div
        className="rounded-[20px] p-4 sm:p-5 lg:p-6 flex flex-col h-full overflow-hidden"
        style={{
          background: '#fff',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
          ...style
        }}
      >
        <div className="flex-shrink-0 mb-3 sm:mb-4">
          <h3 className="text-fluid-lg sm:text-fluid-xl font-semibold text-foreground">{title}</h3>
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          {children}
        </div>
      </div>
    </motion.div>
  );
}
