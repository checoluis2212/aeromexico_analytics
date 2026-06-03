'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Bell, Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type Settings = {
  enabled: boolean;
  slackConfigured: boolean;
  teamsConfigured: boolean;
  slackHint: string | null;
  teamsHint: string | null;
  notify_submitted: boolean;
  notify_accepted: boolean;
  notify_status_change: boolean;
  notify_comment: boolean;
};

const DEFAULT: Settings = {
  enabled: false,
  slackConfigured: false,
  teamsConfigured: false,
  slackHint: null,
  teamsHint: null,
  notify_submitted: true,
  notify_accepted: true,
  notify_status_change: true,
  notify_comment: true,
};

const EVENT_OPTIONS: { key: keyof Pick<
  Settings,
  'notify_submitted' | 'notify_accepted' | 'notify_status_change' | 'notify_comment'
>; label: string; hint: string }[] = [
  { key: 'notify_submitted', label: 'Pedido recibido', hint: 'Confirmación al enviar' },
  { key: 'notify_accepted', label: 'Aceptación o rechazo', hint: 'Cuando Sergio responde' },
  { key: 'notify_status_change', label: 'Cambios de estado', hint: 'Avance en el tablero' },
  { key: 'notify_comment', label: 'Nuevos comentarios', hint: 'Mensajes en tu pedido' },
];

export function NotificationSettingsCard() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [slackInput, setSlackInput] = useState('');
  const [teamsInput, setTeamsInput] = useState('');
  const [clearSlack, setClearSlack] = useState(false);
  const [clearTeams, setClearTeams] = useState(false);
  const [settings, setSettings] = useState<Settings>(DEFAULT);

  useEffect(() => {
    fetch('/api/profile/notification-settings', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : DEFAULT))
      .then((data) => setSettings({ ...DEFAULT, ...data }))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) return;
    if (typeof window === 'undefined') return;
    if (window.location.hash !== '#notificaciones') return;
    const el = document.getElementById('notificaciones');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    el?.classList.add('ring-2', 'ring-primary/40');
    const t = setTimeout(() => el?.classList.remove('ring-2', 'ring-primary/40'), 2400);
    return () => clearTimeout(t);
  }, [loading]);

  const hasWebhook =
    settings.slackConfigured ||
    settings.teamsConfigured ||
    slackInput.trim().length > 0 ||
    teamsInput.trim().length > 0;

  async function save() {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        enabled: settings.enabled,
        notify_submitted: settings.notify_submitted,
        notify_accepted: settings.notify_accepted,
        notify_status_change: settings.notify_status_change,
        notify_comment: settings.notify_comment,
      };

      if (clearSlack) payload.slack_webhook_url = null;
      else if (slackInput.trim()) payload.slack_webhook_url = slackInput.trim();

      if (clearTeams) payload.teams_webhook_url = null;
      else if (teamsInput.trim()) payload.teams_webhook_url = teamsInput.trim();

      const res = await fetch('/api/profile/notification-settings', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error al guardar');

      setSettings({ ...DEFAULT, ...data });
      setSlackInput('');
      setTeamsInput('');
      setClearSlack(false);
      setClearTeams(false);
      toast.success('Notificaciones guardadas');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  }

  async function sendTest() {
    setTesting(true);
    try {
      if (slackInput.trim() || teamsInput.trim()) {
        await save();
      }
      const res = await fetch('/api/profile/notification-settings', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error');
      toast.success('Prueba enviada', { description: 'Revisa Slack y/o Teams.' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setTesting(false);
    }
  }

  function toggleEvent(key: (typeof EVENT_OPTIONS)[number]['key']) {
    setSettings((s) => ({ ...s, [key]: !s[key] }));
  }

  if (loading) {
    return (
      <Card className="glass-card premium-border lg:col-span-2">
        <CardContent className="py-10 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card id="notificaciones" className="glass-card premium-border lg:col-span-2 scroll-mt-24">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          Notificaciones · Slack / Teams
        </CardTitle>
        <CardDescription>
          Recibe avisos de <strong>tus pedidos</strong> en el canal que elijas. Las URLs se guardan
          de forma privada — solo tú las configuras.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="slack_webhook">Webhook de Slack</Label>
            {settings.slackConfigured && !clearSlack && !slackInput && (
              <p className="text-[11px] text-radar flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Configurado {settings.slackHint}
              </p>
            )}
            <Input
              id="slack_webhook"
              type="url"
              value={slackInput}
              onChange={(e) => {
                setSlackInput(e.target.value);
                setClearSlack(false);
              }}
              placeholder={
                settings.slackConfigured
                  ? 'Pega una URL nueva para reemplazar'
                  : 'https://hooks.slack.com/services/...'
              }
              className="font-mono text-xs"
              autoComplete="off"
            />
            {settings.slackConfigured && (
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setClearSlack(true);
                  setSlackInput('');
                }}
              >
                Quitar Slack
              </button>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teams_webhook">Webhook de Microsoft Teams</Label>
            {settings.teamsConfigured && !clearTeams && !teamsInput && (
              <p className="text-[11px] text-radar flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Configurado {settings.teamsHint}
              </p>
            )}
            <Input
              id="teams_webhook"
              type="url"
              value={teamsInput}
              onChange={(e) => {
                setTeamsInput(e.target.value);
                setClearTeams(false);
              }}
              placeholder={
                settings.teamsConfigured
                  ? 'Pega una URL nueva para reemplazar'
                  : 'https://....webhook.office.com/...'
              }
              className="font-mono text-xs"
              autoComplete="off"
            />
            {settings.teamsConfigured && (
              <button
                type="button"
                className="text-[11px] text-muted-foreground hover:text-destructive"
                onClick={() => {
                  setClearTeams(true);
                  setTeamsInput('');
                }}
              >
                Quitar Teams
              </button>
            )}
          </div>
        </div>

        <details className="rounded-lg border border-border/50 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer font-medium text-foreground">
            ¿Cómo obtengo la URL?
          </summary>
          <ul className="mt-2 space-y-1.5 list-disc pl-4 leading-relaxed">
            <li>
              <strong>Slack:</strong> api.slack.com/apps → Incoming Webhooks → elige el canal de tu
              equipo.
            </li>
            <li>
              <strong>Teams:</strong> canal → Workflows / Conector entrante → copia la URL del
              webhook.
            </li>
            <li>Puedes usar solo uno o ambos — recibirás el aviso en cada canal configurado.</li>
          </ul>
        </details>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Activar notificaciones externas</p>
              <p className="text-xs text-muted-foreground">
                Además de la campana en el portal
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.enabled}
              disabled={!hasWebhook}
              onClick={() => setSettings((s) => ({ ...s, enabled: !s.enabled }))}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors shrink-0',
                settings.enabled ? 'bg-primary' : 'bg-muted',
                !hasWebhook && 'opacity-40 cursor-not-allowed'
              )}
            >
              <span
                className={cn(
                  'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform',
                  settings.enabled && 'translate-x-5'
                )}
              />
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {EVENT_OPTIONS.map(({ key, label, hint }) => (
              <label
                key={key}
                className={cn(
                  'flex items-start gap-2.5 rounded-lg border border-border/50 px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-colors',
                  !settings.enabled && 'opacity-50 pointer-events-none'
                )}
              >
                <input
                  type="checkbox"
                  checked={settings[key]}
                  onChange={() => toggleEvent(key)}
                  className="mt-0.5 rounded border-border"
                />
                <span>
                  <span className="text-sm font-medium block">{label}</span>
                  <span className="text-[11px] text-muted-foreground">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button onClick={save} disabled={saving} className="glow-aero">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Guardar'}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={testing || (!hasWebhook && !settings.slackConfigured && !settings.teamsConfigured)}
            onClick={() => void sendTest()}
          >
            {testing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Enviar prueba
          </Button>
          {!hasWebhook && (
            <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Añade al menos un webhook
            </span>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground flex items-center gap-1">
          <ExternalLink className="h-3 w-3" />
          El canal de Sergio (operaciones) se configura aparte en el servidor — esto es solo para ti.
        </p>
      </CardContent>
    </Card>
  );
}
