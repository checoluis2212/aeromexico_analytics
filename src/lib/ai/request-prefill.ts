import {
  AEROMEXICO_USE_CASES,
  getUseCaseById,
  matchUseCaseScenario,
  type UseCaseScenario,
} from '@/lib/ai/aeromexico-use-cases';

const FLOW_ACTION_MSG =
  /^(Quiero pedir a Sergio|Armar borrador de pedido|Armar borrador desde la conversación|Enviar pedido a Sergio|Cancelar)/i;

const BUSINESS_SIGNAL_RE =
  /\b(checkout|vuelo|compra|reserva|booking|campa[ñn]a|revenue|ingreso|conversi[oó]n|ga4|evento|embudo|dashboard|web|app|marketing|producto|e-?commerce|pago|pasajero|finanzas|atribuci[oó]n|bigquery|tag|gtm|m[eé]trica|tr[aá]fico|usuario|cliente)\b/i;

export type RequestPrefillResult = {
  text: string;
  scenarioId: string | null;
  scenarioTitle: string | null;
  contextHint: string | null;
  readyToBuild: boolean;
};

function findScenarioByTitle(title: string): UseCaseScenario | undefined {
  const t = title.trim().toLowerCase();
  return AEROMEXICO_USE_CASES.find((s) => s.title.toLowerCase() === t);
}

function inferScenarioFromMessages(
  messages: { role: string; content: string; apiContent?: string }[]
): UseCaseScenario | undefined {
  for (const m of messages) {
    if (m.role !== 'user') continue;
    const c = (m.apiContent ?? m.content).trim();
    if (!c || FLOW_ACTION_MSG.test(c)) continue;

    const byTitle = findScenarioByTitle(c);
    if (byTitle && byTitle.id !== 'what_can_i_ask') return byTitle;

    const byKeyword = matchUseCaseScenario(c);
    if (byKeyword && byKeyword.id !== 'what_can_i_ask') return byKeyword;
  }
  return undefined;
}

/** Convierte chip de escenario ("Embudo de compra") al mensaje completo para el borrador */
export function resolveUserMessageForDraft(
  content: string,
  scenarioId?: string
): string | null {
  const c = content.trim();
  if (!c || FLOW_ACTION_MSG.test(c)) return null;

  const scenario =
    (scenarioId ? getUseCaseById(scenarioId) : undefined) ?? findScenarioByTitle(c);

  if (scenario && (c.toLowerCase() === scenario.title.toLowerCase() || c.length < 35)) {
    return scenario.starterMessage;
  }

  if (/^¿?qu[eé] puedo pedir\??$/i.test(c)) return null;

  return c;
}

function collectMeaningfulUserParts(
  messages: { role: string; content: string; apiContent?: string }[],
  scenarioId?: string | null
): string[] {
  const parts: string[] = [];
  for (const m of messages) {
    if (m.role !== 'user') continue;
    const raw = (m.apiContent ?? m.content).trim();
    const resolved = resolveUserMessageForDraft(raw, scenarioId ?? undefined);
    if (resolved && resolved.length > 8) parts.push(resolved);
  }
  return [...new Set(parts)];
}

function isReadyToBuild(text: string, scenario: UseCaseScenario | undefined): boolean {
  if (scenario?.id === 'what_can_i_ask') return false;
  if (scenario && text.length >= 30) return true;
  if (text.length < 25) return false;
  return BUSINESS_SIGNAL_RE.test(text);
}

export function buildRequestPrefill(params: {
  messages: { role: string; content: string; apiContent?: string }[];
  scenarioId?: string | null;
  inputDraft?: string;
}): RequestPrefillResult {
  const input = params.inputDraft?.trim() ?? '';

  if (input.length >= 12) {
    const scenario =
      (params.scenarioId ? getUseCaseById(params.scenarioId) : undefined) ??
      inferScenarioFromMessages(params.messages);
    return {
      text: input,
      scenarioId: scenario?.id ?? params.scenarioId ?? null,
      scenarioTitle: scenario?.title ?? null,
      contextHint: scenario ? `Complementando «${scenario.title}»` : 'Desde lo que escribiste',
      readyToBuild: isReadyToBuild(input, scenario),
    };
  }

  const scenario =
    (params.scenarioId ? getUseCaseById(params.scenarioId) : undefined) ??
    inferScenarioFromMessages(params.messages);

  const userParts = collectMeaningfulUserParts(params.messages, params.scenarioId);

  if (scenario) {
    const extras = userParts.filter((p) => p !== scenario.starterMessage && p.length > 20);
    const text =
      extras.length > 0
        ? [scenario.starterMessage, ...extras].join('\n\n')
        : scenario.starterMessage;

    return {
      text,
      scenarioId: scenario.id,
      scenarioTitle: scenario.title,
      contextHint:
        extras.length > 0
          ? `Escenario «${scenario.title}» + lo que comentaste en el chat`
          : `Escenario «${scenario.title}»`,
      readyToBuild: isReadyToBuild(text, scenario),
    };
  }

  const chatText = userParts.join('\n\n');
  return {
    text: chatText,
    scenarioId: null,
    scenarioTitle: null,
    contextHint: chatText ? 'Desde tu conversación en el chat' : null,
    readyToBuild: isReadyToBuild(chatText, undefined),
  };
}
