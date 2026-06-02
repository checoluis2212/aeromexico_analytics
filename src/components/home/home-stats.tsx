import { createAdminClient } from '@/lib/supabase/admin';
import { Clock, CheckCircle2, Inbox } from 'lucide-react';

export async function HomeStats() {
  let total = 0;
  let active = 0;

  try {
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createAdminClient();
      const { count: t } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true });
      const { count: a } = await supabase
        .from('requests')
        .select('*', { count: 'exact', head: true })
        .in('delivery_status', [
          'backlog', 'discovery', 'requirements', 'ready_for_development',
          'development', 'analytics_qa', 'ready_for_release', 'blocked',
        ]);
      total = t ?? 0;
      active = a ?? 0;
    }
  } catch {
    /* stats opcionales — no tumbar la home */
  }

  const stats = [
    { label: 'Pedidos atendidos', value: total, icon: Inbox },
    { label: 'En progreso ahora', value: active, icon: Clock },
    { label: 'Respuesta directa', value: '24h', icon: CheckCircle2, isText: true },
  ];

  return (
    <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
      {stats.map((s) => (
        <div
          key={s.label}
          className="glass-card premium-border rounded-xl px-4 py-3.5 flex items-center gap-3"
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <s.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold tabular-nums leading-none">{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-1">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
