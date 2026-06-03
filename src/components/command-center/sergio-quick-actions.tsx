import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Inbox, Columns3, Activity, PlusCircle, PieChart, Video } from 'lucide-react';

export function SergioQuickActions() {
  const links = [
    { href: '/command-center/admin', label: 'Mi panel', icon: Inbox },
    { href: '/command-center/pedidos', label: 'Bandeja', icon: Inbox },
    { href: '/command-center/board', label: 'Tablero', icon: Columns3 },
    { href: '/command-center/looker-dashboards', label: 'Looker Studio', icon: PieChart },
    { href: '/command-center/gtm-videos', label: 'GTM Debug', icon: Video },
    { href: '/command-center/events', label: 'Validar eventos', icon: Activity },
    { href: '/pedir', label: 'Registrar pedido (compañero)', icon: PlusCircle },
  ];

  return (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
      <p className="w-full text-[11px] text-muted-foreground mb-1">Accesos rápidos</p>
      {links.map(({ href, label, icon: Icon }) => (
        <Button key={href} variant="outline" size="sm" className="h-8 text-xs" asChild>
          <Link href={href}>
            <Icon className="mr-1.5 h-3.5 w-3.5" />
            {label}
          </Link>
        </Button>
      ))}
    </div>
  );
}
