import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  delay?: number;
}

export function Skeleton({ className = '', delay = 0 }: SkeletonProps) {
  return (
    <motion.div
      className={`bg-muted rounded animate-pulse ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    />
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" delay={0} />
        <Skeleton className="h-5 w-96" delay={0.02} />
      </div>

      {/* Metrics Cards Skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="bg-card rounded-lg border border-border p-6 space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * i, duration: 0.15 }}
          >
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-16" />
          </motion.div>
        ))}
      </div>

      {/* Charts Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            className="bg-card rounded-lg border border-border p-6 space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + 0.03 * i, duration: 0.15 }}
          >
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-64 w-full" />
          </motion.div>
        ))}
      </div>

      {/* Table Skeleton */}
      <motion.div
        className="bg-card rounded-lg border border-border p-6 space-y-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.15 }}
      >
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-4">
      <Skeleton className="h-6 w-32" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}
