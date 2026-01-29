import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import logger from '@/lib/logger';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  useEffect(() => {
    logger.debug('ANIMATION', 'Анимация перехода страницы запущена', undefined, 'PageTransition', 'ANIMATE');
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ 
        duration: 0.25, 
        ease: [0.22, 1, 0.36, 1]
      }}
      onAnimationStart={() => {
        logger.debug('ANIMATION', 'Анимация началась', undefined, 'PageTransition', 'ANIMATION_START');
      }}
      onAnimationComplete={() => {
        logger.debug('ANIMATION', 'Анимация завершена', undefined, 'PageTransition', 'ANIMATION_COMPLETE');
      }}
    >
      {children}
    </motion.div>
  );
}
