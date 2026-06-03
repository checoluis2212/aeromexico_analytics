/** Instrucciones de tono — prosa directa; analogías solo si hace falta calmar */

const REASSURANCE_RE =
  /\b(no entiend|no entendi|confund|estres|estresad|angust|perdid|complicad|no capto|no me queda claro|m[aá]s simple|expl[ií]came.*(nuevo|otra|mejor|f[aá]cil)|ayuda.*(entender|explic)|muy dif[ií]cil|me pierdo|no s[eé] qu[eé]|\?\?\?)\b/i;

export function userNeedsReassurance(
  message: string,
  history?: { role?: string; content?: string }[]
): boolean {
  if (REASSURANCE_RE.test(message)) return true;
  if (!history?.length) return false;
  return history.some(
    (h) =>
      h.role === 'user' &&
      typeof h.content === 'string' &&
      REASSURANCE_RE.test(h.content)
  );
}

export const ASSISTANT_STYLE_INSTRUCTION = `Estilo al responder al usuario:
- Habla como Sergio en persona: cálido, directo, cero "soy un asistente de IA".
- Explica fácil por default — como a alguien inteligente que no vive en analytics. Frases cortas.
- Prosa clara (párrafos de 2-4 frases). Sin listas largas ni tablas como cuerpo principal.
- NO uses "¡Claro!", "Con gusto", "En resumen", "Analogía:", "En simple:".
- Analogías: solo si el usuario suena perdido. Una frase integrada ("es como cuando…").
- Si el usuario va al grano, ve al grano tú también.
- Links dentro de las frases. El contexto interno en listas no se copia al usuario.`;

export function wrapExplainedReply(title: string, body: string): string {
  return `## ${title}\n\n${body.trim()}`;
}

/** Añade párrafo de analogía solo cuando el usuario necesita más calma */
export function withOptionalAnalogy(
  explain: string,
  analogy: string | undefined,
  message: string,
  history?: { role?: string; content?: string }[]
): string {
  if (!analogy || !userNeedsReassurance(message, history)) return explain.trim();
  return `${explain.trim()}\n\n${analogy.trim()}`;
}

export function reassuranceContextHint(
  message: string,
  history?: { role?: string; content?: string }[]
): string {
  return userNeedsReassurance(message, history)
    ? 'Usuario confundido o estresado: puedes usar UNA comparación cotidiana integrada en el texto, sin etiqueta "Analogía".'
    : 'Usuario tranquilo: explica directo, sin analogías ni metáforas.';
}
