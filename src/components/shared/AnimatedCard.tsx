import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
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
      className={cn("transition-shadow duration-500 ease-out", className)}
    >
      <Card className="h-full hover:shadow-xl transition-shadow duration-500 ease-out">
        {children}
      </Card>
    </motion.div>
  );
}
