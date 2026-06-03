import { requestTypes, requestPriorities } from '@/lib/constants';
import type { CreateRequestInput } from '@/lib/requests/create-request';
import { getUseCaseById } from '@/lib/ai/aeromexico-use-cases';
import { resolveUserMessageForDraft } from '@/lib/ai/request-prefill';

export type AssistantRequestDraft = {
  title: string;
  type: CreateRequestInput['type'];
  priority: CreateRequestInput['priority'];
  description: string;
  company?: string;
};

export type RequestChatAction = 'start_request' | 'confirm_request' | 'cancel_request';

const DRAFT_MARKER = 'Pedido listo para enviar';

const EXPLICIT_START_RE =
  /\b(pedir desde aqu[ií]|enviar pedido|crear solicitud|quiero pedir|haz(el)?\s*(el\s*)?pedido|mandar pedido|abrir solicitud|solicitud formal)\b/i;

/** Intención de crear pedido nuevo (modo consultor en chat — abre wizard embebido). */
const NEW_REQUEST_INTENT_RE =
  /\b(nuevo pedido|nueva solicitud|crear (un )?pedido|hacer (un )?pedido|levantar (un )?pedido|mandar (un )?pedido|necesito pedir|solicitar (un )?trabajo|pedir trabajo|abrir (un )?pedido|empezar (un )?pedido|quiero pedir|armar (un )?pedido)\b/i;

const CONFIRM_RE =
  /^(s[ií]|confirmo|confirmar|env[ií]a|enviar pedido|adelante|mand[aá]lo)\b/i;

const CANCEL_RE = /\b(cancela|no env|olv[ií]dalo|mejor no|solo preguntaba|no gracias)\b/i;

/** Mensajes del botón o UI — no son contexto de pedido */
const GENERIC_USER_MSG_RE =
  /^(quiero pedir algo(\s+a sergio)?(\s*\(opcional\))?|pedir desde aqu[ií]|enviar pedido|confirmo|cancelar|no,?\s*gracias|no gracias|embudo de compra|dashboard de campa[nñ]a|los n[uú]meros no cuadran|medir un flujo nuevo|datos en bigquery|\u00bfprimera vez\?|\u00bfqu[eé] puedo pedir\?)$/i;

const TYPE_PATTERNS: { type: NonNullable<CreateRequestInput['type']>; re: RegExp }[] = [
  { type: 'dashboard', re: /\b(dashboard|tablero|reporte|looker|kpi|campa[ñn]a)\b/i },
  { type: 'funnel', re: /\b(embudo|funnel|conversi[oó]n|checkout|booking|abandon)\b/i },
  { type: 'tracking', re: /\b(evento|tag|gtm|medir|tracking|implementar|lanz)\b/i },
  { type: 'qa', re: /\b(revis(ar|i[oó]n)|qa|no cuadr|n[uú]meros|validar|discrepan)\b/i },
  { type: 'reporting', re: /\b(bigquery|query|sql|dataset|reporting)\b/i },
  { type: 'investigation', re: /\b(investig|atribuci[oó]n|cohorte|discrepancia)\b/i },
];

const PRIORITY_PATTERNS: { priority: NonNullable<CreateRequestInput['priority']>; re: RegExp }[] = [
  { priority: 'p0_critical', re: /\b(urgente|ya|hoy|cr[ií]tico|p0)\b/i },
  { priority: 'p1_high', re: /\b(importante|esta semana|p1)\b/i },
  { priority: 'p3_low', re: /\b(sin prisa|cuando puedas|p3|baja)\b/i },
];

const BUSINESS_SIGNAL_RE =
  /\b(checkout|vuelo|compra|reserva|booking|campa[ñn]a|revenue|ingreso|conversi[oó]n|ga4|evento|embudo|dashboard|web|app|marketing|producto|e-?commerce|pago|pasajero|finanzas|atribuci[oó]n|bigquery|tag|gtm|m[eé]trica|tr[aá]fico|usuario|cliente)\b/i;

function isGenericUserMessage(text: string): boolean {
  const t = text.trim();
  if (t.length < 4) return true;
  if (GENERIC_USER_MSG_RE.test(t)) return true;
  if (/^quiero pedir/i.test(t) && t.length < 40) return true;
  return false;
}

function collectUserText(
  message: string,
  history: { role?: string; content?: string }[] = [],
  scenarioId?: string
): string {
  const parts: string[] = [];
  for (const h of history) {
    if (h.role !== 'user' || typeof h.content !== 'string') continue;
    const resolved = resolveUserMessageForDraft(h.content, scenarioId);
    if (resolved && !isGenericUserMessage(resolved)) parts.push(resolved);
  }
  if (message.trim()) {
    const resolved = resolveUserMessageForDraft(message, scenarioId);
    if (resolved && !isGenericUserMessage(resolved)) parts.push(resolved);
  }
  return [...new Set(parts)].join('\n\n');
}

function inferType(text: string): NonNullable<CreateRequestInput['type']> {
  for (const { type, re } of TYPE_PATTERNS) {
    if (re.test(text)) return type;
  }
  return 'dashboard';
}

function inferPriority(text: string): NonNullable<CreateRequestInput['priority']> {
  for (const { priority, re } of PRIORITY_PATTERNS) {
    if (re.test(text)) return priority;
  }
  return 'p2_medium';
}

function buildTitle(text: string, type: string, scenarioTitle?: string): string | null {
  if (scenarioTitle && text.length < 25) {
    return scenarioTitle;
  }

  const cleaned = text
    .replace(/\b(por favor|necesito|quiero|pedir|pedido|sergio|analytics|aerom[eé]xico)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);

  if (cleaned.length >= 15 && BUSINESS_SIGNAL_RE.test(cleaned)) {
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  if (scenarioTitle) return scenarioTitle;

  return null;
}

/** ¿Hay suficiente contexto para armar un borrador con sentido? */
export function hasEnoughContextForDraft(
  message: string,
  history: { role?: string; content?: string }[] = [],
  scenarioId?: string
): boolean {
  const scenario = scenarioId ? getUseCaseById(scenarioId) : undefined;
  const userText = collectUserText(message, history, scenarioId);

  if (scenario && (userText.length >= 15 || scenario.starterMessage.length >= 30)) {
    return true;
  }

  if (userText.length < 25) return false;
  if (!BUSINESS_SIGNAL_RE.test(userText)) return false;

  const genericRatio =
    userText.split(/\s+/).filter((w) => /^(quiero|pedir|algo|necesito|sergio)$/i.test(w)).length /
    Math.max(userText.split(/\s+/).length, 1);
  if (genericRatio > 0.5) return false;

  return true;
}

export function isExplicitRequestStart(message: string): boolean {
  return EXPLICIT_START_RE.test(message);
}

export function isNewRequestIntent(message: string): boolean {
  const t = message.trim();
  if (!t) return false;
  if (isRequestCancellation(t)) return false;
  return NEW_REQUEST_INTENT_RE.test(t) || EXPLICIT_START_RE.test(t);
}

/** Marcador en la respuesta del asistente — el cliente/API detectan confirmación pendiente */
export const NEW_REQUEST_CONFIRM_MARKER = 'armar un pedido nuevo aquí';

export function formatNewRequestConfirmPrompt(): string {
  return `¿Quieres **armar un pedido nuevo** aquí conmigo, paso a paso? Son cinco pasos y al final lo envías a Sergio; el seguimiento queda en **Mis pedidos**.

Responde **sí** para abrir el formulario en esta pantalla, o **no** si solo querías consultar algo de analytics.`;
}

export function formatNewRequestAcceptedReply(): string {
  return `Perfecto — abro el formulario arriba. Completa cada paso; si tienes duda en alguno, escríbela abajo y te respondo.`;
}

export function formatNewRequestDeclinedReply(): string {
  return `Sin problema — seguimos en modo consulta. Cuéntame tu duda de analytics o dime *ver mis pedidos* si quieres revisar lo que ya tienes.`;
}

/** @deprecated Usar formatNewRequestConfirmPrompt */
export function formatNewRequestInChatReply(): string {
  return formatNewRequestConfirmPrompt();
}

export function isNewRequestFlowConfirm(message: string): boolean {
  const t = message.trim();
  if (!t) return false;
  if (isNewRequestFlowDecline(t)) return false;
  return (
    /^(s[ií]|si|dale|adelante|ok|okay|va|vamos|claro|por favor|empezar|confirmo|abre|mu[eé]strame)\b/i.test(
      t
    ) || /\b(quiero s[ií]|est[aá] bien|de acuerdo|as[ií] es)\b/i.test(t)
  );
}

export function isNewRequestFlowDecline(message: string): boolean {
  const t = message.trim();
  return (
    isRequestCancellation(t) ||
    /^(no|nop|mejor no|solo preguntaba|solo consulta)\b/i.test(t) ||
    /\b(no quiero pedir|no es un pedido)\b/i.test(t)
  );
}

export function lastAssistantOfferedNewRequestConfirm(
  history: { role?: string; content?: string }[] = []
): boolean {
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h.role === 'user') return false;
    if (
      h.role === 'assistant' &&
      typeof h.content === 'string' &&
      h.content.includes(NEW_REQUEST_CONFIRM_MARKER)
    ) {
      return true;
    }
  }
  return false;
}

export function hasPendingDraftInHistory(
  history: { role?: string; content?: string }[]
): boolean {
  for (let i = history.length - 1; i >= 0; i--) {
    const h = history[i];
    if (h.role === 'assistant' && typeof h.content === 'string') {
      return h.content.includes(DRAFT_MARKER);
    }
    if (h.role === 'user') break;
  }
  return false;
}

export function isRequestConfirmation(
  message: string,
  history: { role?: string; content?: string }[] = []
): boolean {
  if (!CONFIRM_RE.test(message.trim())) return false;
  return hasPendingDraftInHistory(history);
}

export function isRequestCancellation(message: string): boolean {
  return CANCEL_RE.test(message);
}

export function extractRequestDraft(
  message: string,
  history: { role?: string; content?: string }[] = [],
  scenarioId?: string
): AssistantRequestDraft | null {
  const scenario = scenarioId ? getUseCaseById(scenarioId) : undefined;
  const userText = collectUserText(message, history, scenarioId);
  const combined = scenario
    ? [scenario.userSituation, userText, scenario.starterMessage].filter(Boolean).join('\n\n')
    : userText;

  const type = scenario?.requestType ?? inferType(combined);
  const priority = inferPriority(combined);
  const title = buildTitle(userText, type, scenario?.title);

  if (!title) return null;

  const description = scenario
    ? `${scenario.userSituation}\n\nLo que comentó el solicitante:\n${userText || scenario.starterMessage}`
    : userText;

  return {
    title: title.slice(0, 120),
    type,
    priority,
    description: description.slice(0, 2000),
  };
}

export function isValidDraft(draft: AssistantRequestDraft | null): draft is AssistantRequestDraft {
  if (!draft?.title || !draft.description) return false;
  if (/solicitud desde preg[uú]ntale/i.test(draft.title)) return false;
  if (draft.description.length < 20) return false;
  if (isGenericUserMessage(draft.description)) return false;
  return BUSINESS_SIGNAL_RE.test(draft.title + ' ' + draft.description);
}

export function formatRequestStartPrompt(): string {
  return `## Antes de armar tu pedido

Para que Sergio reciba algo **útil** (y no un placeholder), cuéntame en 2–3 frases:

1. **Qué quieres lograr** — ej. "ver dónde se cae el checkout" o "dashboard de mi campaña de primavera"
2. **Dónde pasa** — web, app, GA4, campaña específica
3. **Urgencia** (opcional) — esta semana, sin prisa…

Escríbelo aquí abajo y te muestro un borrador para revisar. También puedes levantarlo en [pantalla completa](/pedir).

Si solo querías entender el tema, sigue preguntando — **no hace falta pedir nada**.`;
}

export function formatInsufficientContextReply(): string {
  return `## Todavía no tengo suficiente detalle

No armé un pedido porque falta contexto concreto — "quiero pedir algo" no le dice a Sergio **qué** necesitas.

Cuéntame, por ejemplo: *"Necesito un embudo del checkout web"* o *"Los números de GA4 no cuadran con finanzas del 1 al 15 de mayo"*.

Cuando lo tenga claro, te muestro un borrador para que **tú confirmes** antes de enviar.`;
}

export function formatDraftSummary(draft: AssistantRequestDraft): string {
  const typeLabel = requestTypes.find((t) => t.value === draft.type)?.label ?? draft.type;
  const priorityLabel =
    requestPriorities.find((p) => p.value === draft.priority)?.label ?? draft.priority;

  return `## ${DRAFT_MARKER}

Revisa si esto refleja lo que necesitas. **No se envía solo** — pulsa **Enviar pedido** solo si te cuadra.

**Título:** ${draft.title}

**Tipo:** ${typeLabel}

**Urgencia:** ${priorityLabel}

**Detalle:** ${draft.description.slice(0, 500)}${draft.description.length > 500 ? '…' : ''}

¿Algo que cambiar? Escríbelo antes de confirmar. O abre [Pedir con IA](/pedir).`;
}

export function formatOptionalRequestHint(): string {
  return `\n\n_Si quieres que Sergio lo implemente (opcional), usa **Pedido guiado** abajo del chat cuando ya tengas claro qué necesitas._`;
}

export function formatRequestCreatedReply(result: {
  reference_code: string | null;
  title: string;
  auto_accepted: boolean;
  id: string;
  suggested_due_date?: string;
}): string {
  const due = result.suggested_due_date
    ? ` Fecha orientativa: ${result.suggested_due_date}.`
    : '';

  if (result.auto_accepted) {
    return `## Pedido enviado${result.reference_code ? ` · ${result.reference_code}` : ''}

Listo — ya está en la cola y quedó **confirmado automáticamente**.${due}

Síguelo en [Mis pedidos](/mis-pedidos/${result.id}). Te avisamos en el portal cuando avance.`;
  }

  return `## Pedido enviado${result.reference_code ? ` · ${result.reference_code}` : ''}

Recibí **"${result.title}"**. Sergio lo revisará y te confirmará fecha.

Síguelo en [Mis pedidos](/mis-pedidos/${result.id}).`;
}

export function formatRequestCancelledReply(): string {
  return `## Sin pedido

Perfecto — **no envié nada**. Sigue preguntando lo que quieras.

Cuando tengas claro qué necesitas, **Pedido guiado** sigue disponible (opcional).`;
}

export function wantsToCreateRequest(
  message: string,
  history: { role?: string; content?: string }[] = []
): boolean {
  return isExplicitRequestStart(message) || isRequestConfirmation(message, history);
}
