import { NextRequest, NextResponse } from 'next/server';
import { requireCommandCenterAccess } from '@/lib/auth/require-api-session';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const session = await requireCommandCenterAccess();
    if (session instanceof NextResponse) return session;

    const body = await request.json();

    try {
      const res = await fetch(`${AI_URL}/generate-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) return NextResponse.json(await res.json());
    } catch {
      // fallback
    }

    return NextResponse.json(generateFallback(body));
  } catch {
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 });
  }
}

function generateFallback(body: {
  title?: string;
  business_goal?: string;
  problem_statement?: string;
  decision_to_be_made?: string;
  type?: string;
}) {
  const title = body.title ?? 'Analytics Request';
  return {
    user_story: `Como stakeholder de ${body.type ?? 'analytics'}, necesito ${title.toLowerCase()} para ${body.business_goal ?? 'tomar decisiones basadas en datos'}, de modo que ${body.decision_to_be_made ?? 'pueda optimizar resultados de negocio'}.`,
    acceptance_criteria: [
      'Los datos están disponibles en el dashboard/reporte acordado',
      'Las métricas coinciden con la fuente de verdad (±5% tolerancia)',
      'El owner del reporte/evento está documentado en el catálogo',
      'QA completado en DebugView / BigQuery antes de go-live',
      'Documentación actualizada en Knowledge Hub',
    ],
    analytics_requirements: [
      `Implementar tracking para: ${body.problem_statement ?? 'caso de uso definido'}`,
      'Definir eventos y parámetros en Event Catalog',
      'Configurar GTM tags con naming convention estándar',
      'Validar en GA4 DebugView y comparar con baseline',
      body.type === 'bigquery' ? 'Crear/actualizar tabla en BigQuery mart' : 'Conectar data source en Looker Studio',
    ],
    measurement_plan: `## Measurement Plan — ${title}\n\n**Business Goal:** ${body.business_goal ?? 'N/A'}\n\n**Problem:** ${body.problem_statement ?? 'N/A'}\n\n**Decision:** ${body.decision_to_be_made ?? 'N/A'}\n\n### KPIs\n- Métrica primaria alineada al business goal\n- Métricas secundarias de contexto\n\n### Events\n- Definir en Event Catalog con owner\n\n### QA\n- Pre-deploy: GTM Preview + DebugView\n- Post-deploy: comparación 7 días vs baseline`,
    qa_checklist: [
      'GTM Preview — tags firing correctamente',
      'GA4 DebugView — eventos con parámetros completos',
      'Comparación pre/post deploy (7 días)',
      'Validación con stakeholder / product owner',
      'Actualización Event Catalog y Data Dictionary',
      'Sign-off documentado en Request Center',
    ],
  };
}
