import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { assertSergioAdmin } from '@/lib/auth/guards';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { AvailabilityToggle } from '@/components/availability/availability-toggle';
import { getSergioAvailability } from '@/lib/availability';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Inbox,
  Sparkles,
} from 'lucide-react';

export const metadata = { title: 'Mi panel' };

export default async function SergioAdminPage() {
  await assertSergioAdmin();

  const supabase = await createClient();
  const availability = await getSergioAvailability();

  const [{ data: pendingAccept }, { data: openRequests }, { count: urgentCount }] = await Promise.all([
    supabase
      .from('requests')
      .select('id, title, type, priority, company, requester_name, created_at, sergio_decision')
      .eq('sergio_decision', 'pending')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase
      .from('requests')
      .select('id, title, priority, delivery_status, updated_at')
      .eq('sergio_decision', 'accepted')
      .not('delivery_status', 'in', '("done","cancelled")')
      .order('updated_at', { ascending: false })
      .limit(5),
    supabase
      .from('requests')
      .select('*', { count: 'exact', head: true })
      .eq('sergio_decision', 'accepted')
      .in('priority', ['p0_critical', 'p1_high'])
      .not('delivery_status', 'in', '("done","cancelled")'),
  ]);

  const pending = pendingAccept ?? [];
  const active = openRequests ?? [];

  return (
    <>
      <CommandCenterTopBar
        title="Mi panel"
        subtitle="Tu espacio de operación — cola, semáforo y decisiones"
      />

      <div className="p-5 space-y-5 max-w-5xl">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Por aceptar', value: pending.length, icon: Sparkles, accent: pending.length > 0 ? 'text-signal' : 'text-muted-foreground' },
            { label: 'Activos', value: active.length, icon: Inbox, accent: 'text-primary' },
            { label: 'Urgentes', value: urgentCount ?? 0, icon: AlertTriangle, accent: (urgentCount ?? 0) > 0 ? 'text-destructive' : 'text-muted-foreground' },
            { label: 'Semáforo', value: availability.capacity === 'available' ? 'OK' : availability.capacity === 'limited' ? 'Limitado' : 'Full', icon: CheckCircle2, accent: availability.capacity === 'available' ? 'text-radar' : 'text-signal' },
          ].map(({ label, value, icon: Icon, accent }) => (
            <Card key={label} className="glass-card border-border/50">
              <CardContent className="pt-4 pb-3 flex items-center gap-3">
                <Icon className={`h-5 w-5 shrink-0 ${accent}`} />
                <div>
                  <p className="text-xl font-bold tabular-nums leading-none">{value}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <AvailabilityToggle initial={availability} />

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-2 flex flex-row items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Pedidos por aceptar
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Revisa capacidad con IA, elige fecha y acepta o rechaza.
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/command-center/pedidos">
                Ver bandeja
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No hay pedidos esperando tu respuesta.
              </p>
            ) : (
              pending.map((r) => (
                <Link
                  key={r.id}
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
                    <Badge variant="outline" className="text-[10px] border-signal/40 text-signal">
                      {priorityLabels[r.priority] ?? r.priority}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border-border/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              En curso (aceptados)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {active.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Cola vacía después de aceptar.</p>
            ) : (
              active.map((r) => (
                <Link
                  key={r.id}
                  href={`/command-center/pedidos/${r.id}`}
                  className="block p-3 rounded-lg border border-border/40 hover:border-primary/20 text-sm"
                >
                  <span className="font-medium line-clamp-1">{r.title}</span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {r.delivery_status?.replace(/_/g, ' ')}
                  </span>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
