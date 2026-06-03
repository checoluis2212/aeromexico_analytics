/**
 * Skills de aprendizaje para el modo Consultor — contexto estructurado
 * que enseña al LLM a responder como mentor de analytics en Aeroméxico.
 */

import { analyticsStack } from '@/lib/constants';
import { buildUseCasesContextForAgent } from '@/lib/ai/aeromexico-use-cases';
import { buildAnalyticsConceptsContext } from '@/lib/ai/analytics-concepts';
import {
  HUMAN_EXPLAIN_SKILL,
  TOPIC_GUARD_SKILL,
  CONSULTANT_DIALOGUE_SKILL,
  type ChatTurn,
} from '@/lib/ai/assistant-agent-skills';

export type ConsultantSkillDomain =
  | 'ga4_fundamentals'
  | 'gtm_implementation'
  | 'funnels_conversion'
  | 'dashboards_reporting'
  | 'data_quality'
  | 'bigquery_advanced'
  | 'business_strategy';

const SKILL_DOMAINS: Record<
  ConsultantSkillDomain,
  { title: string; triggers: RegExp; teach: string }
> = {
  ga4_fundamentals: {
    title: 'GA4 — fundamentos',
    triggers: /\b(ga4|google analytics|evento|par[aá]metro|sesi[oó]n|usuario|propiedad|stream)\b/i,
    teach: `Explica eventos vs parámetros vs user properties. Usa ejemplos Aeroméxico (search, purchase). Menciona DebugView para validar. Enlaza [Eventos GA4](/event-catalog) y [Glosario](/glosario).`,
  },
  gtm_implementation: {
    title: 'GTM e implementación',
    triggers: /\b(gtm|tag manager|tag|trigger|variable|data\s*layer|datalayer|implement)\b/i,
    teach: `Explica flujo: data layer → trigger → tag GA4. No des pasos de prod sin advertir validación. Diferencia gtag directo vs GTM. Si piden implementación en prod → [Pedir con IA](/pedir).`,
  },
  funnels_conversion: {
    title: 'Embudos y conversión',
    triggers: /\b(embudo|funnel|checkout|conversi[oó]n|abandono|booking|compra|drop.?off)\b/i,
    teach: `Define pasos del embudo con eventos concretos. Explica por qué importa cada paso para decisiones de Marketing/E-commerce. Sugiere qué revisar primero (implementación vs definición vs UX).`,
  },
  dashboards_reporting: {
    title: 'Dashboards y reportes',
    triggers: /\b(dashboard|tablero|looker|reporte|kpi|visualiz|m[eé]trica|roas|adquisici|acquisition)\b/i,
    teach: `Si piden un reporte o "qué info necesitas": lista datos concretos (canales, fechas, definición de conversión/revenue, gasto de ads, UTMs, decisión de negocio). NO definas ROAS/UTM como glosario salvo que pregunten "qué es".`,
  },
  data_quality: {
    title: 'Calidad y reconciliación',
    triggers: /\b(no cuadr|discrepan|validar|reconcil|calidad|duplicad|muestra|sampling)\b/i,
    teach: `Lista causas comunes: doble tag, timezone, definición purchase, refunds, ad blockers. Propón plan: evento → parámetro → comparar con fuente de verdad. Tono calmado — es frustración frecuente.`,
  },
  bigquery_advanced: {
    title: 'BigQuery y análisis avanzado',
    triggers: /\b(bigquery|sql|query|dataset|export|cohorte|attribution|atribuci[oó]n)\b/i,
    teach: `Cuándo GA4 UI no alcanza. Menciona export GA4→BQ, ventanas de atribución, joins con CRM. No inventes queries — describe enfoque y qué datos harían falta.`,
  },
  business_strategy: {
    title: 'Estrategia y priorización',
    triggers: /\b(prioriz|roadmap|qu[eé] medir|por d[oó]nde|empezar|roi|decisi[oó]n|stakeholder)\b/i,
    teach: `Conecta analytics con decisión concreta. Framework: situación → pregunta → dato → acción. Ofrece 2-3 caminos con trade-offs. Pedido formal solo si quieren ejecutar.`,
  },
};

export function detectConsultantSkills(message: string): ConsultantSkillDomain[] {
  return (Object.entries(SKILL_DOMAINS) as [ConsultantSkillDomain, (typeof SKILL_DOMAINS)[ConsultantSkillDomain]][])
    .filter(([, s]) => s.triggers.test(message))
    .map(([id]) => id);
}

export function buildConsultantLearningContext(
  message: string,
  opts?: { clientContext?: string; history?: ChatTurn[] }
): string {
  const stack = analyticsStack.map((s) => s.short).join(', ');
  const activeSkills = detectConsultantSkills(message);
  const conceptBlock = buildAnalyticsConceptsContext(message);

  const skillBlocks = activeSkills.length
    ? activeSkills
        .map((id) => {
          const s = SKILL_DOMAINS[id];
          return `### Skill: ${s.title}\n${s.teach}`;
        })
        .join('\n\n')
    : Object.values(SKILL_DOMAINS)
        .slice(0, 4)
        .map((s) => `- ${s.title}: ${s.teach.split('.')[0]}.`)
        .join('\n');

  const historyHint =
    opts?.history && opts.history.length > 0
      ? `HISTORIAL RECIENTE: ${opts.history.length} mensajes — continúa el hilo, no reinicies.`
      : '';

  return [
    `MODO: Consultor de analytics (aprendizaje + asesoría). Stack Aeroméxico: ${stack}.`,
    HUMAN_EXPLAIN_SKILL,
    TOPIC_GUARD_SKILL,
    CONSULTANT_DIALOGUE_SKILL,
    opts?.clientContext ?? '',
    historyHint,
    `METODOLOGÍA DE ENSEÑANZA:
1. Responde PRIMERO a lo que el usuario acaba de escribir — no cambies de tema ni pegues una ficha de escenario.
2. Si falta contexto, haz 1-2 preguntas concretas (qué comparan, fechas, canal, web/app).
3. Explica en prosa corta, sin jerga; conecta con Aeroméxico solo si aplica.
4. Un siguiente paso que pueda hacer hoy.
5. [Pedir trabajo](/pedir?empezar=1) solo si quieren que lo ejecutemos — opcional.`,
    `SKILLS ACTIVAS PARA ESTA PREGUNTA:\n${skillBlocks}`,
    `CASOS DE USO (referencia interna — NO copies como plantilla al usuario):\n${buildUseCasesContextForAgent()}`,
    conceptBlock ? `CONCEPTOS RELACIONADOS:\n${conceptBlock}` : '',
    `RECURSOS DEL PORTAL: [Eventos GA4](/event-catalog) · [Glosario](/glosario) · [FAQ](/faq) · [Analytics OS](/analytics-os)`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export {
  CONSULTOR_WELCOME,
  CONSULTOR_SUGGESTIONS,
  CLIENT_AGENT_SHORTCUTS,
} from '@/lib/ai/client-agent-shortcuts';
