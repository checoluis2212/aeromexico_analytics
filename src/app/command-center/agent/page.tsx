import { assertSergioAdmin } from '@/lib/auth/guards';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { AdminAgentPanel } from '@/components/command-center/admin-agent-panel';
import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { aiAgentClientPreviewHref } from '@/lib/ai/assistant-modes';
import { commandCenterContentClass } from '@/lib/layout/command-center';
import { cn } from '@/lib/utils';

export const metadata = { title: 'Agente IA — Command Center' };

export default async function AdminAgentPage() {
  await assertSergioAdmin();

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <CommandCenterTopBar
        title="Agente IA"
        subtitle="Bandeja global · semáforo · eventos · BigQuery"
      />

      <div
        className={cn(
          commandCenterContentClass,
          'flex flex-1 flex-col min-h-0 gap-4 py-5 sm:py-6 pb-6'
        )}
      >
        <AdminAgentPanel className="flex-1 min-h-0" />

        <p className="shrink-0 text-center text-xs text-muted-foreground">
          Vista previa del portal cliente —{' '}
          <Link
            href={aiAgentClientPreviewHref()}
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            AI Agent (portal)
            <ExternalLink className="h-3 w-3" />
          </Link>
        </p>
      </div>
    </div>
  );
}
