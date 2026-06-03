import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { assertSergioAdmin } from '@/lib/auth/guards';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { AvailabilityToggle } from '@/components/availability/availability-toggle';
import { getSergioAvailability } from '@/lib/availability';
import { CAPACITY_CONFIG } from '@/lib/availability-config';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { SERGIO_EXTRA_NAV } from '@/lib/command-center/nav';
import { SergioAdminExtras } from '@/components/command-center/sergio-admin-extras';
import {
  ArrowRight,
  Bot,
  Clock,
  Database,
  Inbox,
  PieChart,
  Video,
} from 'lucide-react';

export const metadata = { title: 'Mi panel' };

export default async function SergioAdminPage() {
  await assertSergioAdmin();

  const supabase = await createClient();
  const availability = await getSergioAvailability();

  const { data: pending } = await supabase
    .from('requests')
    .select('id, title, type, priority, company, requester_name, created_at')
    .eq('sergio_decision', 'pending')
    .order('created_at', { ascending: false })
    .limit(6);

  const pendingList = pending ?? [];
  const semaforoLabel = CAPACITY_CONFIG[availability.capacity].label;

  return (
    <>
      <CommandCenterTopBar
        title="Mi panel"
        subtitle="Semáforo y pedidos que esperan tu respuesta"
      />

      <CommandCenterPageContent className="space-y-6">
        <AvailabilityToggle initial={availability} />

        <Link
          href="/command-center/agent"
          className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/[0.06] p-4 hover:border-primary/50 transition-colors"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary shrink-0">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">Agente IA — Command Center</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Bandeja global, solicitantes, semáforo y acciones con confirmación
            </p>
          </div>
          <ArrowRight className="h-4 w-4 text-primary shrink-0" />
        </Link>

        <Card
          className={
            pendingList.length > 0
              ? 'border-signal/40 bg-signal/[0.06]'
              : 'border-border/50'
          }
        >
          <CardContent className="pt-5 pb-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-2xl font-bold tabular-nums">{pendingList.length}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {pendingList.length === 1
                    ? 'pedido espera tu respuesta'
                    : 'pedidos esperan tu respuesta'}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Semáforo: <span className="text-foreground font-medium">{semaforoLabel}</span>
                </p>
              </div>
              <Button asChild className="glow-aero shrink-0">
                <Link href="/command-center/pedidos">
                  Ir a pedidos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {pendingList.length > 0 ? (
              <ul className="space-y-2 border-t border-border/40 pt-3">
                {pendingList.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/command-center/pedidos/${r.id}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border/40 hover:border-primary/30 hover:bg-secondary/20 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {r.requester_name}
                          {r.company ? ` · ${r.company}` : ''}
                          {' · '}
                          {requestTypeLabels[r.type] ?? r.type}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <Badge variant="outline" className="text-[10px]">
                          {priorityLabels[r.priority] ?? r.priority}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(new Date(r.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground border-t border-border/40 pt-3">
                No hay pedidos nuevos. Revisa la bandeja si quieres ver todo el historial.
              </p>
            )}
          </CardContent>
        </Card>

        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
            Accesos rápidos
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href="/command-center/looker-dashboards"
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-4 hover:border-primary/30 transition-colors"
            >
              <PieChart className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Looker</p>
                <p className="text-[11px] text-muted-foreground">Subir dashboard</p>
              </div>
            </Link>
            <Link
              href="/command-center/gtm-videos"
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-4 hover:border-primary/30 transition-colors"
            >
              <Video className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Videos GTM</p>
                <p className="text-[11px] text-muted-foreground">Prueba de tags</p>
              </div>
            </Link>
            <Link
              href="/command-center/integraciones"
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/30 p-4 hover:border-primary/30 transition-colors"
            >
              <Database className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-sm font-medium">Datos IA</p>
                <p className="text-[11px] text-muted-foreground">BigQuery</p>
              </div>
            </Link>
          </div>
        </div>

        <details className="rounded-xl border border-border/40 bg-muted/10 px-4 py-3 group">
          <summary className="text-sm font-medium cursor-pointer list-none flex items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
            Más herramientas
            <span className="text-xs text-muted-foreground group-open:hidden">Ver</span>
          </summary>
          <ul className="mt-3 space-y-1 border-t border-border/40 pt-3">
            {SERGIO_EXTRA_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-primary py-1.5 block"
                >
                  {item.label}
                  <span className="text-[11px] ml-1">— {item.hint}</span>
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/command-center/executive"
                className="text-sm text-muted-foreground hover:text-primary py-1.5 block"
              >
                Resumen KPIs — números del negocio
              </Link>
            </li>
          </ul>
          <SergioAdminExtras />
        </details>
      </CommandCenterPageContent>
    </>
  );
}
