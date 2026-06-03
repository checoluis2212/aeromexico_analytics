'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const BANNER_DISMISS_KEY = 'aero-notif-banner-dismissed-v1';

type Settings = {
  enabled: boolean;
  slackConfigured: boolean;
  teamsConfigured: boolean;
};

type Props = {
  variant?: 'banner' | 'inline' | 'link';
  className?: string;
  /** Tras enviar pedido: no usa dismiss persistente del banner */
  afterOrder?: boolean;
};

export function NotificationSetupPrompt({
  variant = 'banner',
  className,
  afterOrder = false,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (variant === 'banner' && !afterOrder) {
      setDismissed(localStorage.getItem(BANNER_DISMISS_KEY) === '1');
    }
  }, [variant, afterOrder]);

  useEffect(() => {
    fetch('/api/profile/notification-settings', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: Settings | null) => {
        if (!data) {
          setNeedsSetup(true);
          return;
        }
        const configured =
          data.enabled && (data.slackConfigured || data.teamsConfigured);
        setNeedsSetup(!configured);
      })
      .catch(() => setNeedsSetup(false))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !needsSetup || (dismissed && variant === 'banner' && !afterOrder)) {
    return null;
  }

  const profileHref = '/perfil#notificaciones';

  if (variant === 'link') {
    return (
      <Button asChild variant="outline" size="sm" className={className}>
        <Link href={profileHref}>
          <Bell className="mr-2 h-3.5 w-3.5" />
          Slack / Teams
        </Link>
      </Button>
    );
  }

  if (variant === 'inline') {
    return (
      <div
        className={cn(
          'rounded-xl border border-primary/20 bg-primary/[0.05] px-4 py-3 text-left',
          className
        )}
      >
        <p className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary shrink-0" />
          ¿Quieres avisos en Slack o Teams?
        </p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Configura tu canal y te aviso cuando avance tu pedido — sin revisar el portal a cada rato.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild size="sm" className="h-8 glow-aero">
            <Link href={profileHref}>Configurar ahora</Link>
          </Button>
          {!afterOrder && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={() => setDismissed(true)}
            >
              Después
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-xl border border-border/50 bg-card/50 p-4 sm:flex sm:items-center sm:gap-4',
        className
      )}
      role="region"
      aria-label="Configurar notificaciones Slack Teams"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary mb-3 sm:mb-0">
        <Bell className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Recibe avisos donde ya trabajas</p>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Conecta Slack o Teams en tu perfil y te aviso cuando se acepte tu pedido, cambie de estado
          o haya un comentario nuevo.
        </p>
      </div>
      <div className="flex items-center gap-2 mt-3 sm:mt-0 shrink-0">
        <Button asChild size="sm" variant="outline">
          <Link href={profileHref}>Configurar</Link>
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label="Ocultar"
          onClick={() => {
            localStorage.setItem(BANNER_DISMISS_KEY, '1');
            setDismissed(true);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
