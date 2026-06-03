'use client';

import { NotificationTestButton } from '@/components/command-center/notification-test-button';

/** Prueba Slack/Teams — solo en sección avanzada del panel */
export function SergioAdminExtras() {
  return (
    <div className="mt-3 pt-3 border-t border-border/40">
      <p className="text-xs text-muted-foreground mb-2">Probar avisos a Slack o Teams</p>
      <NotificationTestButton />
    </div>
  );
}
