import { assertSergioAdmin } from '@/lib/auth/guards';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { CommandCenterPageContent } from '@/components/command-center/command-center-page-content';
import { SkillsMarketplaceManager } from '@/components/command-center/skills-marketplace-manager';
import { BigQueryProbeButton } from '@/components/command-center/bigquery-probe-button';
import { listOrchestratorSkills } from '@/lib/ai/orchestrator-skills-server';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Datos IA' };

export default async function IntegracionesPage() {
  await assertSergioAdmin();
  const skills = await listOrchestratorSkills();

  return (
    <>
      <CommandCenterTopBar
        title="Datos para el AI Agent"
        subtitle="BigQuery para Admin Agent y AI Agent del portal — chats separados, misma conexión"
      />
      <CommandCenterPageContent className="space-y-5">
        <Link
          href="/command-center/admin"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al panel
        </Link>

        <div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            <strong className="text-foreground">Qué hace esto:</strong> si BigQuery está conectado,
            el <strong className="text-foreground">Admin Agent</strong> y el{' '}
            <strong className="text-foreground">AI Agent del portal</strong> pueden leer agregados del
            almacén — cada uno con su chat y permisos; no comparten conversación. El cliente no configura nada.
          </p>
          <p className="mt-2 text-xs">
            Las demás apps (Slack, Meta, etc.) son opcionales y van abajo, colapsadas.
          </p>
        </div>

        <div className="flex justify-end">
          <BigQueryProbeButton />
        </div>
        <SkillsMarketplaceManager initialSkills={skills} />
      </CommandCenterPageContent>
    </>
  );
}
