import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, MessageSquare } from 'lucide-react';
import {
  slackInteractiveEnabled,
} from '@/lib/notifications/slack-interactive';
import { getNotificationWebhookUrls } from '@/lib/notifications/channels';

function envFlag(name: string): boolean {
  const v = process.env[name];
  return v !== 'false' && v !== '0';
}

export function AgentOperationsCard() {
  const agentOn = envFlag('REQUEST_AGENT_ENABLED');
  const autoAcceptOn = envFlag('REQUEST_AGENT_AUTO_ACCEPT');
  const webhooks = getNotificationWebhookUrls().length;
  const slackInteractive = slackInteractiveEnabled();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return (
    <Card className="glass-card border-border/60 lg:col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="h-4 w-4 text-primary" />
          Agente de pedidos y Slack
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="flex flex-wrap gap-2">
          <Badge variant={agentOn ? 'default' : 'secondary'}>
            Agente {agentOn ? 'ON' : 'OFF'}
          </Badge>
          <Badge variant={autoAcceptOn ? 'default' : 'outline'}>
            Auto-aceptar {autoAcceptOn ? 'ON' : 'OFF'}
          </Badge>
          <Badge variant={webhooks > 0 ? 'default' : 'outline'}>
            Webhooks {webhooks > 0 ? webhooks : 0}
          </Badge>
          <Badge variant={slackInteractive ? 'default' : 'outline'}>
            Slack botones {slackInteractive ? 'ON' : 'OFF'}
          </Badge>
        </div>

        <div className="rounded-lg border border-border/50 bg-muted/20 p-3 space-y-2 text-xs text-muted-foreground leading-relaxed">
          <p className="font-medium text-foreground text-sm">Auto-aceptar (`.env.local`)</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>
              <code className="text-[11px]">REQUEST_AGENT_ENABLED=true</code> — triaje y respuesta al
              cliente
            </li>
            <li>
              <code className="text-[11px]">REQUEST_AGENT_AUTO_ACCEPT=true</code> — acepta solo si:
              no es P0, semáforo no está lleno, IA recomienda accept y confianza alta/media
            </li>
            <li>
              <code className="text-[11px]">false</code> en cualquiera → todo queda pendiente de ti
            </li>
          </ul>
        </div>

        <div className="rounded-lg border border-primary/20 bg-primary/[0.04] p-3 space-y-2 text-xs leading-relaxed">
          <p className="font-medium text-foreground text-sm flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Decidir desde Slack (botones)
          </p>
          <p className="text-muted-foreground">
            Cuando el agente <strong>no</strong> auto-acepta, llega un mensaje con{' '}
            <strong>Aceptar</strong> / <strong>Rechazar</strong> / enlace al panel.
          </p>
          <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
            <li>
              App en{' '}
              <a
                href="https://api.slack.com/apps"
                className="text-primary underline"
                target="_blank"
                rel="noreferrer"
              >
                api.slack.com/apps
              </a>{' '}
              → Bot Token Scopes: <code className="text-[11px]">chat:write</code>
            </li>
            <li>
              Interactivity → Request URL:{' '}
              <code className="text-[11px] break-all">
                {siteUrl}/api/integrations/slack/interactions
              </code>
            </li>
            <li>
              Instala la app en el canal y copia el <code className="text-[11px]">channel ID</code>{' '}
              (C…)
            </li>
            <li>
              En <code className="text-[11px]">.env.local</code>:{' '}
              <code className="text-[11px]">SLACK_BOT_TOKEN</code>,{' '}
              <code className="text-[11px]">SLACK_SIGNING_SECRET</code>,{' '}
              <code className="text-[11px]">SLACK_CHANNEL_ID</code>
            </li>
          </ol>
          <p className="text-muted-foreground">
            Aceptar desde Slack usa la <strong>fecha sugerida</strong> del triaje (cámbiala en el
            panel si hace falta).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
