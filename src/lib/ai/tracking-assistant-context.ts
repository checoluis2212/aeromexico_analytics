import { getSergioAvailability } from '@/lib/availability';
import { CAPACITY_CONFIG } from '@/lib/availability-config';
import { analyticsGlossary } from '@/lib/glossary';
import { analyticsFaqs } from '@/lib/faqs';
import { requestTypes, services } from '@/lib/constants';
import { createClient } from '@/lib/supabase/server';
import { ASSISTANT_STYLE_INSTRUCTION, reassuranceContextHint } from '@/lib/ai/assistant-style';
import {
  buildAnalyticsConceptsContext,
  formatAnalyticsConceptReply,
  matchAnalyticsConcept,
} from '@/lib/ai/analytics-concepts';
import { buildAssistantProductContext } from '@/lib/ai/assistant-product-context';
import { getUseCaseById } from '@/lib/ai/aeromexico-use-cases';
import { invokeSergioAnalyticsLLM } from '@/lib/ai/consultor-reply';
import {
  formatRequestSnapshotContext,
  formatUserOrdersContext,
  formatUserOrdersReply,
  loadRequestSnapshotForAssistant,
  loadUserOrdersForAssistant,
  wantsUserOrdersQuery,
  type RequestAssistantSnapshot,
} from '@/lib/ai/request-assistant-context';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { requestTypeLabels } from '@/lib/constants';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  buildSiteGuideContext,
  formatSiteGuideReply,
  isSiteGuideQuestion,
} from '@/lib/ai/site-guide';
import {
  HUMAN_EXPLAIN_SKILL,
  TOPIC_GUARD_SKILL,
  type ChatTurn,
} from '@/lib/ai/assistant-agent-skills';

export type EventCatalogRow = {
  event_name: string;
  description: string | null;
  parameters: unknown;
  example_code: string | null;
  use_cases: string[] | null;
  category: string | null;
  health_status: string | null;
};

type EventParameter = {
  name: string;
  type?: string;
  required?: boolean;
  description?: string;
};

/** Temas claramente fuera de analytics / portal — respuesta corta sin LLM */
const CLEARLY_OFF_TOPIC_RE =
  /\b(receta|cocinar|horno|pastel|clima|pron[oó]stico del tiempo|f[uú]tbol|hor[oó]scopo|pol[ií]tica|elecci[oó]n|m[eé]dico|doctor|medicina|enfermed|boleto barato|itinerario de vuelo|pel[ií]cula|serie de tv|meme|chiste)\b/i;

/** Temas válidos aunque no digan "GA4" */
const IN_SCOPE_RE =
  /\b(analytic|ga4|gtm|tag|medir|medici[oó]n|dato|dashboard|embudo|funnel|checkout|conversi[oó]n|kpi|reporte|looker|bigquery|evento|tracking|portal|pedido|preg[uú]ntale|sergio|aerom[eé]xico|marketing|e-?commerce|app|campan|roas|revenue|atribuci[oó]n|glosario|faq|cat[aá]logo|mis pedidos|request)\b/i;

export function isOffTopicForGa4Assistant(
  message: string,
  history: ChatTurn[] = []
): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (IN_SCOPE_RE.test(trimmed)) return false;
  if (isSiteGuideQuestion(trimmed)) return false;

  const recentUser = history
    .filter((h) => h.role === 'user')
    .slice(-3)
    .map((h) => h.content ?? '')
    .join(' ');
  if (IN_SCOPE_RE.test(recentUser) && trimmed.length < 80) return false;

  return CLEARLY_OFF_TOPIC_RE.test(trimmed.toLowerCase());
}

export function getOffTopicReply(): string {
  return `Eso se me sale de lo mío. Aquí te ayudo con **analytics en Aeroméxico**: medir campañas, embudos, GA4, tus pedidos en el portal…

Si tienes algo de datos o medición, cuéntame y lo vemos.`;
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((t) => t.length > 2);
}

function scoreEvent(event: EventCatalogRow, tokens: string[]): number {
  const haystack = [
    event.event_name,
    event.description ?? '',
    event.category ?? '',
    ...(event.use_cases ?? []),
  ]
    .join(' ')
    .toLowerCase();

  let score = 0;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 2;
    if (event.event_name.toLowerCase().includes(token)) score += 3;
  }
  return score;
}

function filterEvents(events: EventCatalogRow[], message: string, max = 12): EventCatalogRow[] {
  const tokens = tokenize(message);
  if (tokens.length === 0) return events.slice(0, max);

  const ranked = [...events]
    .map((e) => ({ e, score: scoreEvent(e, tokens) }))
    .sort((a, b) => b.score - a.score);

  const relevant = ranked.filter((r) => r.score > 0).slice(0, max);
  if (relevant.length > 0) return relevant.map(({ e }) => e);

  return events.slice(0, max);
}

function formatParametersSimple(params: unknown): string {
  if (!Array.isArray(params) || params.length === 0) return 'aún no documentados';
  return (params as EventParameter[])
    .slice(0, 5)
    .map((p) => p.name)
    .join(', ');
}

function formatEventBlockSimple(event: EventCatalogRow): string {
  return `- **${event.event_name}**: ${event.description ?? 'evento en catálogo'} (datos: ${formatParametersSimple(event.parameters)})`;
}

function matchGlossaryWithAnalogy(message: string): string | null {
  const lower = message.toLowerCase();
  for (const entry of analyticsGlossary) {
    const term = entry.term.toLowerCase();
    const termCore = term.replace(/\s*\([^)]*\)/, '').trim();
    if (lower.includes(term) || lower.includes(termCore)) {
      return `## ${entry.term}

${entry.def}

Si quieres ver cómo lo usamos en Aeroméxico, mira [Eventos GA4](/event-catalog). Si necesitas que lo implementemos en prod, cuéntamelo en [Pedir con IA](/pedir).`;
    }
  }
  return null;
}

function wantsCapacity(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('capacidad') ||
    lower.includes('cola') ||
    lower.includes('semáforo') ||
    lower.includes('disponible') ||
    lower.includes('cuánto tard') ||
    lower.includes('puedes tomar')
  );
}

export async function buildTrackingAssistantContext(
  message: string,
  opts?: {
    scenarioId?: string;
    requestId?: string;
    userId?: string;
    userEmail?: string;
    history?: ChatTurn[];
    clientContext?: string;
  }
): Promise<{
  context: string;
  events: EventCatalogRow[];
}> {
  const scenarioId = opts?.scenarioId;
  const history = opts?.history ?? [];
  const supabase = await createClient();
  const includeCapacity = wantsCapacity(message);
  const conceptContext = buildAnalyticsConceptsContext(message);

  const clientContext = opts?.clientContext ?? '';

  const [availability, eventsResult] = await Promise.all([
    includeCapacity ? getSergioAvailability() : Promise.resolve(null),
    supabase
      .from('event_catalog')
      .select(
        'event_name, description, parameters, example_code, use_cases, category, health_status'
      )
      .eq('is_active', true)
      .order('event_name'),
  ]);

  const allEvents = (eventsResult.data ?? []) as EventCatalogRow[];
  const events = filterEvents(allEvents, message);

  const glossaryBlock = analyticsGlossary
    .map((g) => `- ${g.term}: ${g.def}`)
    .join('\n');

  const faqBlock = analyticsFaqs
    .filter((f) => f.category === 'casos' || f.category === 'pedir')
    .slice(0, 8)
    .map((f) => `- ${f.q} → ${f.a}`)
    .join('\n');

  const servicesBlock = services.map((s) => `- ${s.title}: ${s.description}`).join('\n');

  const requestBlock = requestTypes
    .map((t) => `- ${t.label}: ${t.description}`)
    .join('\n');

  const eventsBlock =
    events.length > 0
      ? events.map(formatEventBlockSimple).join('\n')
      : '- (consultar catálogo)';

  const parts: string[] = [];

  parts.push(ASSISTANT_STYLE_INSTRUCTION);
  parts.push(HUMAN_EXPLAIN_SKILL);
  parts.push(TOPIC_GUARD_SKILL);
  if (clientContext) parts.push(clientContext);
  parts.push(reassuranceContextHint(message, history));
  parts.push(buildAssistantProductContext());
  parts.push(buildSiteGuideContext());

  const scenario = scenarioId ? getUseCaseById(scenarioId) : null;
  if (scenario) {
    parts.push(
      `Escenario activo: ${scenario.title} (${scenario.area}). Situación: ${scenario.userSituation}. Ayuda: ${scenario.sergioHelp}. Tipo pedido sugerido: ${scenario.requestType}.`
    );
  }

  if (opts?.userId && opts.userEmail) {
    const orders = await loadUserOrdersForAssistant(opts.userId, opts.userEmail);
    parts.push(formatUserOrdersContext(orders));

    if (opts.requestId) {
      const snapshot = await loadRequestSnapshotForAssistant(
        opts.requestId,
        opts.userId,
        opts.userEmail
      );
      if (snapshot) {
        parts.push(formatRequestSnapshotContext(snapshot));
      }
    }
  }

  if (conceptContext) parts.push(conceptContext);

  if (includeCapacity && availability) {
    const capacity = CAPACITY_CONFIG[availability.capacity];
    parts.push(
      `Semáforo Sergio: ${capacity.label}. ${availability.note?.trim() || capacity.headline}`
    );
  }

  parts.push(`Catálogo eventos GA4 Aeroméxico:\n${eventsBlock}`);
  parts.push(`Qué hace Sergio (services):\n${servicesBlock}`);
  parts.push(`Tipos de pedido:\n${requestBlock}`);
  parts.push(`Glosario:\n${glossaryBlock}`);
  if (faqBlock) parts.push(`FAQs:\n${faqBlock}`);

  return {
    context: parts.join('\n\n'),
    events,
  };
}

function formatOrderStatusReply(snapshot: RequestAssistantSnapshot): string {
  const statusLabel = mapDeliveryStatusForUser(snapshot.delivery_status ?? snapshot.status);
  const typeLabel = requestTypeLabels[snapshot.type] ?? snapshot.type;
  const due = snapshot.committed_due_date
    ? format(new Date(snapshot.committed_due_date), "d 'de' MMMM yyyy", { locale: es })
    : null;
  const ref = snapshot.reference_code ? ` (${snapshot.reference_code})` : '';

  let body = `Tu pedido **"${snapshot.title}"**${ref} está en **${statusLabel}**. Es un pedido de **${typeLabel}**`;

  if (snapshot.sergio_decision === 'accepted' && due) {
    body += ` y Sergio lo aceptó con fecha orientativa **${due}**`;
  } else if (snapshot.sergio_decision === 'pending') {
    body += `. Sergio aún lo está revisando para confirmarte si lo toma y para cuándo`;
  } else if (snapshot.sergio_decision === 'rejected') {
    body += `. En este momento no pudo tomarse; revisa los comentarios o escríbenos si cambió la situación`;
  }

  body += '.';

  if (snapshot.recent_comments.length > 0) {
    const last = snapshot.recent_comments[snapshot.recent_comments.length - 1];
    body += ` Lo último que quedó registrado: *${last.author}* — "${last.content.slice(0, 180)}${last.content.length > 180 ? '…' : ''}"`;
  }

  body += `\n\nDetalle completo en [Mis pedidos](/mis-pedidos/${snapshot.id}). Si necesitas cambiar el alcance, [Pedir con IA](/pedir) o comenta en el hilo del pedido.`;

  return `## Estado de tu pedido\n\n${body}`;
}

function wantsOrderStatus(message: string): boolean {
  return /\b(en qu[eé] va|estado|status|cu[aá]ndo est[aá]|listo|termin|avance|sigue|necesito hacer|falta algo)\b/i.test(
    message
  );
}

export async function generateTrackingFallbackReply(
  message: string,
  context: string,
  events: EventCatalogRow[],
  opts?: { requestId?: string; userId?: string; userEmail?: string }
): Promise<string> {
  if (isOffTopicForGa4Assistant(message)) {
    return getOffTopicReply();
  }

  if (isSiteGuideQuestion(message)) {
    return formatSiteGuideReply(message);
  }

  if (opts?.userId && opts.userEmail && wantsUserOrdersQuery(message)) {
    const orders = await loadUserOrdersForAssistant(opts.userId, opts.userEmail);
    return formatUserOrdersReply(orders);
  }

  if (opts?.requestId && opts.userId && opts.userEmail && wantsOrderStatus(message)) {
    const snapshot = await loadRequestSnapshotForAssistant(
      opts.requestId,
      opts.userId,
      opts.userEmail
    );
    if (snapshot) return formatOrderStatusReply(snapshot);
  }

  const llmReply = await invokeSergioAnalyticsLLM({ message, context, history: [] });
  if (llmReply) return llmReply;

  const glossaryHit = matchGlossaryWithAnalogy(message);
  if (glossaryHit) return glossaryHit;

  const lower = message.toLowerCase();

  if (wantsCapacity(message)) {
    const capacityMatch = context.match(/Semáforo Sergio: ([^\n]+)/);
    return `## Mi cola ahora

${capacityMatch?.[1] ?? 'Puedo recibir pedidos; te confirmo tiempos concretos cuando los revise.'}

Si quieres que **haga** algo, cuéntamelo en [Pedir con IA](/pedir).`;
  }

  if (/\b(eventos|tenemos|cat[aá]logo|lista)\b/.test(lower)) {
    const names = events.slice(0, 6).map((e) => `\`${e.event_name}\``).join(', ');
    return `## Eventos que medimos

En Aeroméxico no medimos "a ojo". Tenemos un **catálogo oficial** de eventos en GA4 — cada uno registra una acción concreta: buscar vuelo, llegar al pago, completar compra. Eso permite armar embudos y dashboards que todos entienden igual.

Entre los documentados aparecen, por ejemplo: ${names || 'varios eventos de negocio'}. La lista completa, con parámetros y ejemplos, está en [Eventos GA4](/event-catalog).`;
  }

  const tokens = tokenize(message);
  const matches = events.filter((e) => tokens.some((t) => e.event_name.toLowerCase().includes(t)));

  if (matches.length > 0) {
    const e = matches[0];
    return `## ${e.event_name}

${e.description ?? 'Es uno de los eventos que registramos en GA4 cuando ocurre una acción concreta en web o app.'}

Lleva datos como ${formatParametersSimple(e.parameters)}. Para ver cómo encaja con el resto de la medición en Aeroméxico, revisa el [catálogo completo](/event-catalog).`;
  }

  if (lower.includes('checkout') || lower.includes('purchase') || lower.includes('compra')) {
    const purchase = events.find((ev) => ev.event_name.includes('purchase'));
    if (purchase) {
      return formatAnalyticsConceptReply(
        {
          id: 'purchase_hit',
          match: /./,
          title: 'Compra (purchase)',
          explain: `${purchase.description ?? 'Se dispara cuando alguien termina de pagar.'} Lleva datos como ${formatParametersSimple(purchase.parameters)}. Si falta un paso del checkout o no cuadra con lo que ves en reportes, cuéntamelo en [Pedir con IA](/pedir).`,
          analogy: `Es la señal de "venta hecha" — el momento en que el negocio confirma que hubo ingreso.`,
        },
        message
      );
    }
  }

  return `## Cuéntame tu situación

Soy tu copiloto de analytics en Aeroméxico — embudos de compra, dashboards de campaña, números que no cuadran, medir un lanzamiento…

Elige un escenario arriba o escribe con tus palabras. Si después quieres que Sergio lo ejecute, usa **Pedido guiado** (opcional) o [Pedir con IA](/pedir).`;
}
