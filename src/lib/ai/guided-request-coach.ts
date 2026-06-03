import { getUseCaseById } from '@/lib/ai/aeromexico-use-cases';
import { buildRequestPrefill } from '@/lib/ai/request-prefill';
import { requestAreas, requestTypes } from '@/lib/constants';
import type { CreateRequestInput } from '@/lib/requests/create-request';

export type GuidedWizardStepId = 'area' | 'type' | 'detail' | 'priority' | 'review';

export type GuidedRequestForm = {
  company: string;
  type: NonNullable<CreateRequestInput['type']>;
  title: string;
  description: string;
  priority: NonNullable<CreateRequestInput['priority']>;
};

export const GUIDED_WIZARD_STEPS: GuidedWizardStepId[] = [
  'area',
  'type',
  'detail',
  'priority',
  'review',
];

export const DEFAULT_GUIDED_FORM: GuidedRequestForm = {
  company: 'Marketing',
  type: 'dashboard',
  title: '',
  description: '',
  priority: 'p2_medium',
};

export const PEDIDO_IA_WELCOME = `## Formulario de pedido

Completa los cinco pasos y pulsa **Enviar a Sergio** en la revisión final. El seguimiento queda en **Mis pedidos**.`;

export type StepMeta = {
  question: string;
  subtitle?: string;
  example?: string;
  exampleLabel?: string;
};

const TYPE_INFER_RE: { type: GuidedRequestForm['type']; re: RegExp }[] = [
  { type: 'funnel', re: /\b(embudo|checkout|conversi[oó]n|booking|compra)\b/i },
  { type: 'tracking', re: /\b(evento|tag|gtm|medir|implementar)\b/i },
  { type: 'qa', re: /\b(no cuadr|revis|validar|n[uú]meros)\b/i },
  { type: 'reporting', re: /\b(bigquery|query|sql|dataset)\b/i },
  { type: 'investigation', re: /\b(investig|atribuci[oó]n|discrepan)\b/i },
];

export function inferTypeFromText(text: string): GuidedRequestForm['type'] {
  for (const { type, re } of TYPE_INFER_RE) {
    if (re.test(text)) return type;
  }
  return 'dashboard';
}

export function suggestTitle(description: string, type: GuidedRequestForm['type']): string {
  const cleaned = description.trim();
  const firstLine = cleaned.split(/\n/)[0]?.trim() ?? '';
  const firstSentence = firstLine.split(/[.!?]/)[0]?.trim() ?? firstLine;
  if (firstSentence.length >= 12 && firstSentence.length <= 120) {
    return firstSentence.charAt(0).toUpperCase() + firstSentence.slice(1);
  }
  const label = requestTypes.find((t) => t.value === type)?.label ?? 'Analytics';
  return `Pedido: ${label}`;
}

export function buildDraftFromGuidedForm(form: GuidedRequestForm) {
  const description = form.description.trim();
  const title = form.title.trim() || suggestTitle(description, form.type);
  return {
    title: title.slice(0, 120),
    type: form.type,
    priority: form.priority,
    description: description.slice(0, 2000),
    company: form.company,
  };
}

export function prefillGuidedForm(params: {
  messages: { role: string; content: string; apiContent?: string }[];
  scenarioId?: string | null;
  inputDraft?: string;
}): GuidedRequestForm & { scenarioId?: string } {
  const prefill = buildRequestPrefill(params);
  const scenario = prefill.scenarioId ? getUseCaseById(prefill.scenarioId) : null;
  const text = prefill.text.trim();

  const type = scenario?.requestType ?? inferTypeFromText(text);
  const description = text;
  const title = text.length >= 20 ? suggestTitle(text, type) : '';

  const scenarioArea = scenario?.area;
  const company =
    scenarioArea && (requestAreas as readonly string[]).includes(scenarioArea)
      ? scenarioArea
      : DEFAULT_GUIDED_FORM.company;

  return {
    company,
    type,
    title,
    description,
    priority: /\b(urgente|ya|hoy|esta semana)\b/i.test(text) ? 'p1_high' : 'p2_medium',
    scenarioId: prefill.scenarioId ?? undefined,
  };
}

/** Pregunta del paso — misma redacción que Pedir a Sergio. */
export function getStepMeta(step: GuidedWizardStepId, form: GuidedRequestForm): StepMeta {
  switch (step) {
    case 'area':
      return {
        question: 'Tu área',
        subtitle: 'Elige el área más parecida a tu equipo.',
      };
    case 'type':
      return {
        question: '¿Qué necesitas?',
        subtitle: 'Lo más parecido — luego lo afinamos en el detalle.',
      };
    case 'detail':
      return {
        question: 'Cuéntame el detalle',
        subtitle: '¿Qué quieres decidir? ¿Web, app, checkout? ¿Qué cambió, si algo cambió?',
        example:
          form.type === 'funnel'
            ? 'Quiero ver dónde se cae la gente en checkout mobile antes de pagar, campaña primavera.'
            : form.type === 'dashboard'
              ? 'Dashboard semanal: tráfico, conversiones y revenue por canal de mi campaña.'
              : 'Los números de GA4 no cuadran con finanzas del 1 al 15 de mayo.',
        exampleLabel: 'Ejemplo',
      };
    case 'priority':
      return {
        question: '¿Qué tan urgente es?',
        subtitle: 'Elige la que encaje — suelo ir antes del máximo. Al aceptar te confirmo fecha.',
      };
    case 'review':
      return {
        question: 'Revisa tu pedido',
        subtitle: 'Así llegará a mi cola. Nada se envía hasta que pulses Enviar.',
      };
  }
}

/** Sergio en primera persona — guía del paso (IA en el pedido). */
export function getSergioCoachMessage(step: GuidedWizardStepId, form: GuidedRequestForm): string {
  switch (step) {
    case 'area':
      return 'Para ubicar tu pedido, dime de qué área vienes. No hay respuesta incorrecta — elige la que más se parezca.';
    case 'type':
      return '¿Qué necesitas que haga? Elige la tarjeta más cercana; en el siguiente paso me cuentas el detalle con calma.';
    case 'detail':
      return form.type === 'funnel'
        ? 'Cuéntame qué pasa en el embudo: dónde, qué campaña o flujo, y qué quieres decidir.'
        : form.type === 'dashboard'
          ? 'Dime qué KPIs necesitas ver y para qué decisiones — así armo el pedido claro desde el día uno.'
          : 'Con dos o tres frases me basta: qué pasa, qué quieres lograr y dónde (web, app, GA4…).';
    case 'priority':
      return 'Sin presión — la mayoría va en Normal. Solo sube urgencia si de verdad bloquea algo esta semana.';
    case 'review':
      return 'Revisa que todo cuadre. Si algo no está bien, vuelve atrás. Cuando estés listo, envíamelo.';
  }
}

export function stepLabel(step: GuidedWizardStepId): string {
  const labels: Record<GuidedWizardStepId, string> = {
    area: 'Área',
    type: 'Tipo',
    detail: 'Detalle',
    priority: 'Urgencia',
    review: 'Confirmar',
  };
  return labels[step];
}

export function getGuidedStepAiContext(
  step: GuidedWizardStepId,
  form: GuidedRequestForm
): string {
  const meta = getStepMeta(step, form);
  const coach = getSergioCoachMessage(step, form);
  return `[Pedido guiado · paso ${stepLabel(step)}] Eres Sergio Burgos (Analytics Aeroméxico). El usuario está completando un pedido formal paso a paso — NO actúes como asesor genérico de analytics ni des tutoriales largos. Responde SOLO dudas sobre este paso del pedido, en primera persona, breve y práctico.

Paso actual: "${meta.question}". ${coach}

Opciones del paso: áreas=${form.company}, tipo=${form.type}, urgencia=${form.priority}.`;
}

/** Respuesta local cuando la IA no está disponible. */
export function getSergioGuidedFallbackReply(message: string): string {
  const lower = message.toLowerCase();
  if (/tipo|categor[ií]a|cu[aá]l elijo|dashboard|embudo/.test(lower)) {
    return 'Elige la tarjeta que suene más parecida a lo que necesitas. Si es ver KPIs recurrentes → Dashboard. Si es dónde se cae la gente antes de comprar → Embudo. Si dudas, cuéntame en una frase qué quieres lograr y te digo cuál poner.';
  }
  if (/urgente|prioridad|normal|cu[aá]ndo/.test(lower)) {
    return 'La urgencia es orientativa — cuando acepte tu pedido te confirmo fecha real. Si no bloquea una decisión esta semana, Normal suele ser la opción correcta.';
  }
  if (/detalle|escrib|ejemplo|qu[eé] pongo/.test(lower)) {
    return 'Imagina un Slack de dos frases: qué pasa, qué quieres decidir y dónde (web, app, campaña). Con eso me basta para arrancar.';
  }
  if (/[áa]rea|equipo|marketing|e-?commerce/.test(lower)) {
    return 'Elige el área más parecida a tu equipo. Marketing suele pedir dashboards de campaña; E-commerce, embudos de checkout. No pasa nada si no es exacto.';
  }
  return 'Estoy contigo en este paso — elige la opción que encaje o cuéntame tu duda en una frase y te oriento sin salir del pedido.';
}
