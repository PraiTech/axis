import { motion } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import logger from '@/lib/logger';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  useEffect(() => {
    logger.debug('ANIMATION', 'Page transition animation started', undefined, 'PageTransition', 'ANIMATE');
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
        logger.debug('ANIMATION', 'Animation started', undefined, 'PageTransition', 'ANIMATION_START');
      }}
      onAnimationComplete={() => {
        logger.debug('ANIMATION', 'Animation completed', undefined, 'PageTransition', 'ANIMATION_COMPLETE');
      }}
    >
      {children}
    </motion.div>
  );
}
