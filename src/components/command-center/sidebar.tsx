'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Inbox, Kanban, Store, MessageSquare, Zap,
  BookOpen, Library, Sparkles, TrendingUp, Award, User, Plane,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACC_NAV } from '@/types/command-center';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const iconMap: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="h-4 w-4" />,
  Inbox: <Inbox className="h-4 w-4" />,
  Kanban: <Kanban className="h-4 w-4" />,
  Store: <Store className="h-4 w-4" />,
  MessageSquare: <MessageSquare className="h-4 w-4" />,
  Zap: <Zap className="h-4 w-4" />,
  BookOpen: <BookOpen className="h-4 w-4" />,
  Library: <Library className="h-4 w-4" />,
  Sparkles: <Sparkles className="h-4 w-4" />,
  TrendingUp: <TrendingUp className="h-4 w-4" />,
  Award: <Award className="h-4 w-4" />,
  User: <User className="h-4 w-4" />,
};

export function CommandCenterSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border/60 bg-card/40 backdrop-blur-xl transition-all duration-300 h-screen sticky top-0',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center gap-3 px-4 h-16 border-b border-border/60">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
          <Plane className="h-4 w-4 text-primary" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-w-0">
            <p className="text-xs font-bold tracking-wide truncate">ANALYTICS</p>
            <p className="text-[10px] text-muted-foreground truncate">Command Center</p>
          </motion.div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {ACC_NAV.map((item) => {
          const active = pathname === item.href || (item.href !== '/command-center' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all',
                active
                  ? 'bg-primary/15 text-primary font-medium ring-1 ring-primary/20'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              )}
              title={collapsed ? item.label : undefined}
            >
              {iconMap[item.icon]}
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border/60">
        <Button
          variant="ghost"
          size="icon"
          className="w-full"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
    </aside>
  );
}
