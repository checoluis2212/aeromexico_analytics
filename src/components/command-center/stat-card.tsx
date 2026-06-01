'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Activity, BarChart3, CheckCircle2, Clock, DollarSign, Inbox,
  LayoutDashboard, ShieldAlert, Target, TrendingUp, Users, Zap,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP = {
  activity: Activity,
  barChart3: BarChart3,
  checkCircle2: CheckCircle2,
  clock: Clock,
  dollarSign: DollarSign,
  inbox: Inbox,
  layoutDashboard: LayoutDashboard,
  shieldAlert: ShieldAlert,
  target: Target,
  trendUp: TrendingUp,
  users: Users,
  zap: Zap,
} as const;

export type StatIconKey = keyof typeof ICON_MAP;

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon?: StatIconKey;
  className?: string;
  delay?: number;
}

export function StatCard({ label, value, change, trend, icon, className, delay = 0 }: StatCardProps) {
  const Icon: LucideIcon | undefined = icon ? ICON_MAP[icon] : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className={cn(
        'rounded-xl border border-border/60 bg-card/50 p-5 hover:border-primary/25 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
          {change && (
            <p className={cn(
              'text-xs mt-1',
              trend === 'up' && 'text-radar',
              trend === 'down' && 'text-destructive',
              trend === 'neutral' && 'text-muted-foreground'
            )}>
              {change}
            </p>
          )}
        </div>
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
