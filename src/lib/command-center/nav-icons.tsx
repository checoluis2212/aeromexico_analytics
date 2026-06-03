import type { ReactNode } from 'react';
import {
  BarChart3,
  Bot,
  Columns3,
  Globe,
  Home,
  Inbox,
  PieChart,
  Sparkles,
  Users,
  Video,
  Zap,
} from 'lucide-react';

const iconClass = 'h-[18px] w-[18px]';

/** Mapa único de iconos — sidebar y secciones comparten esto. */
export const COMMAND_CENTER_NAV_ICONS: Record<string, ReactNode> = {
  Home: <Home className={iconClass} strokeWidth={1.75} />,
  Inbox: <Inbox className={iconClass} strokeWidth={1.75} />,
  Bot: <Bot className={iconClass} strokeWidth={1.75} />,
  BarChart3: <BarChart3 className={iconClass} strokeWidth={1.75} />,
  Columns3: <Columns3 className={iconClass} strokeWidth={1.75} />,
  Zap: <Zap className={iconClass} strokeWidth={1.75} />,
  Users: <Users className={iconClass} strokeWidth={1.75} />,
  Sparkles: <Sparkles className={iconClass} strokeWidth={1.75} />,
  PieChart: <PieChart className={iconClass} strokeWidth={1.75} />,
  Video: <Video className={iconClass} strokeWidth={1.75} />,
  Globe: <Globe className={iconClass} strokeWidth={1.75} />,
};

export function navIcon(name: string): ReactNode {
  return COMMAND_CENTER_NAV_ICONS[name] ?? COMMAND_CENTER_NAV_ICONS.Home;
}
