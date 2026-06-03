'use client';

import { useCallback, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Loader2, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import type { OrchestratorSkillRow } from '@/lib/ai/orchestrator-skills-server';
import {
  ORCHESTRATOR_DATA_WAREHOUSE_SLUG,
  SKILLS_MARKETPLACE_CATALOG,
} from '@/lib/ai/skills-marketplace-catalog';
import { cn } from '@/lib/utils';

type Props = {
  initialSkills: OrchestratorSkillRow[];
};

const STATUS_LABELS: Record<OrchestratorSkillRow['connection_status'], string> = {
  connected: 'Listo',
  not_configured: 'Falta configurar en el servidor',
  error: 'Error',
};

function SkillRow({
  skill,
  busy,
  onPatch,
}: {
  skill: OrchestratorSkillRow;
  busy: boolean;
  onPatch: (slug: string, body: { enabled?: boolean }) => void;
}) {
  const canActivate = skill.connection_status === 'connected';
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border/50 bg-secondary/10 px-3 py-3">
      <Database className="h-5 w-5 text-primary shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">BigQuery</p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Fuente de números para el AI Agent
        </p>
        <Badge variant="outline" className="mt-1.5 text-[9px]">
          {STATUS_LABELS[skill.connection_status]}
        </Badge>
      </div>
      <div className="shrink-0">
        {busy ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Switch
            checked={skill.enabled}
            disabled={!canActivate && !skill.enabled}
            onCheckedChange={(on: boolean) => onPatch(skill.slug, { enabled: on })}
            aria-label="Activar BigQuery"
          />
        )}
      </div>
      {!canActivate && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-[10px] shrink-0"
          onClick={() =>
            toast.info(
              'Pon GOOGLE_CLOUD_PROJECT_ID y GOOGLE_APPLICATION_CREDENTIALS en .env.local del servidor.'
            )
          }
        >
          Ayuda
        </Button>
      )}
    </li>
  );
}

export function SkillsMarketplaceManager({ initialSkills }: Props) {
  const [skills, setSkills] = useState(initialSkills);
  const [saving, setSaving] = useState<string | null>(null);

  const patch = useCallback(async (slug: string, body: { enabled?: boolean }) => {
    setSaving(slug);
    try {
      const res = await fetch('/api/command-center/orchestrator-skills', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, ...body }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const { skill } = await res.json();
      setSkills((prev) => prev.map((s) => (s.slug === slug ? skill : s)));
      toast.success('Guardado');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(null);
    }
  }, []);

  const warehouse = useMemo(
    () => skills.find((s) => s.slug === ORCHESTRATOR_DATA_WAREHOUSE_SLUG),
    [skills]
  );

  const auxiliary = useMemo(
    () => skills.filter((s) => s.slug !== ORCHESTRATOR_DATA_WAREHOUSE_SLUG),
    [skills]
  );

  return (
    <div className="space-y-4">
      <Card className="glass-card border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">BigQuery (lo importante)</CardTitle>
          <p className="text-xs text-muted-foreground">
            Encendido = el AI Agent puede usar datos del almacén.
          </p>
        </CardHeader>
        <CardContent>
          {warehouse ? (
            <ul>
              <SkillRow
                skill={warehouse}
                busy={saving === warehouse.slug}
                onPatch={(slug, body) => void patch(slug, body)}
              />
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">BigQuery no aparece en el catálogo.</p>
          )}
        </CardContent>
      </Card>

      {auxiliary.length > 0 && (
        <details className="rounded-xl border border-border/40 bg-muted/10 group">
          <summary className="flex items-center justify-between gap-2 px-4 py-3 cursor-pointer text-sm font-medium list-none [&::-webkit-details-marker]:hidden">
            Otras conexiones (opcional)
            <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
          </summary>
          <CardContent className="px-4 pb-4 pt-0">
            <p className="text-[11px] text-muted-foreground mb-3">
              No hacen falta para que el AI Agent responda con cifras. Solo si más adelante las
              usas.
            </p>
            <ul className="space-y-2">
              {auxiliary.map((skill) => {
                const def = SKILLS_MARKETPLACE_CATALOG.find((s) => s.slug === skill.slug);
                const canActivate = skill.connection_status === 'connected';
                return (
                  <li
                    key={skill.slug}
                    className="flex items-center justify-between gap-2 rounded-lg border border-border/40 px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-medium">{skill.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {def?.description ?? ''}
                      </p>
                    </div>
                    {saving === skill.slug ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                    ) : (
                      <Switch
                        checked={skill.enabled}
                        disabled={!canActivate && !skill.enabled}
                        onCheckedChange={(on: boolean) => void patch(skill.slug, { enabled: on })}
                        className="shrink-0"
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </details>
      )}
    </div>
  );
}
