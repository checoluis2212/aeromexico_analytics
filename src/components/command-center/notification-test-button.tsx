'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useTrackEvent } from '@/components/analytics/analytics-context';

type Status = {
  configured: boolean;
  slack: boolean;
  teams: boolean;
  webhookCount: number;
};

export function NotificationTestButton() {
  const track = useTrackEvent();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  async function loadStatus() {
    const res = await fetch('/api/notifications/test', { credentials: 'include' });
    if (res.ok) setStatus(await res.json());
  }

  async function sendTest() {
    setLoading(true);
    try {
      if (!status) await loadStatus();
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');
      track('cc_integration_test', { integration: 'slack_teams' });
      toast.success('Mensaje de prueba enviado', {
        description: 'Revisa Slack y/o Teams.',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Slack / Teams
          </p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Webhooks en <code className="text-[10px]">.env.local</code>. Prueba la conexión antes de producción.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={loading}
          onClick={() => void sendTest()}
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            'Probar'
          )}
        </Button>
      </div>
      <NotificationStatus onLoad={loadStatus} status={status} setStatus={setStatus} />
    </div>
  );
}

function NotificationStatus({
  onLoad,
  status,
  setStatus,
}: {
  onLoad: () => Promise<void>;
  status: Status | null;
  setStatus: (s: Status | null) => void;
}) {
  const [checked, setChecked] = useState(false);

  if (!checked && !status) {
    return (
      <button
        type="button"
        className="text-[11px] text-primary hover:underline"
        onClick={() => {
          setChecked(true);
          void onLoad().then(() => setChecked(true));
        }}
      >
        Ver estado de configuración
      </button>
    );
  }

  if (!status) return null;

  return (
    <div className="flex flex-wrap gap-3 text-[11px]">
      <span className="inline-flex items-center gap-1">
        {status.slack ? (
          <CheckCircle2 className="h-3 w-3 text-radar" />
        ) : (
          <AlertCircle className="h-3 w-3 text-muted-foreground" />
        )}
        Slack {status.slack ? 'OK' : 'sin URL'}
      </span>
      <span className="inline-flex items-center gap-1">
        {status.teams ? (
          <CheckCircle2 className="h-3 w-3 text-radar" />
        ) : (
          <AlertCircle className="h-3 w-3 text-muted-foreground" />
        )}
        Teams {status.teams ? 'OK' : 'sin URL'}
      </span>
      <span className="text-muted-foreground">
        {status.configured
          ? `${status.webhookCount} webhook(s) activo(s)`
          : 'Añade SLACK_WEBHOOK_URL o TEAMS_WEBHOOK_URL'}
      </span>
    </div>
  );
}
