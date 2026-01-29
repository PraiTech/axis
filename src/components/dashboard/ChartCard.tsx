import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  delay?: number;
}

export function ChartCard({ title, children, delay = 0 }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.22, 1, 0.36, 1] // easeOutCubic для плавности
      }}
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] // easeInOut для плавного hover
        }
      }}
      style={{ willChange: 'transform, opacity' }}
    >
      <Card className="hover:shadow-xl transition-shadow duration-500 ease-out flex flex-col h-full">
        <CardHeader className="flex-shrink-0">
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}
