/**
 * Señales del cliente inferidas del mensaje e historial (sin DB).
 * Usado solo en servidor vía client-learning-context.
 */

import { requestAreas } from '@/lib/constants';
import { detectConsultantSkills } from '@/lib/ai/analytics-learning-skills';
import { userNeedsReassurance } from '@/lib/ai/assistant-style';
import type { ChatTurn } from '@/lib/ai/assistant-agent-skills';

export type ClientExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'unknown';

export type ClientSignals = {
  experienceLevel: ClientExperienceLevel;
  preferredArea: string | null;
  recurringTopics: string[];
  needsSimpleLanguage: boolean;
  openRequestCount: number;
};

const JARGON_RE =
  /\b(data\s*layer|gtm|bigquery|sql|attribution|measurement protocol|server.?side|custom dimension|user property|exploration|looker)\b/i;

const BEGINNER_RE =
  /\b(no entiend|qu[eé] es|para qu[eé] sirve|expl[ií]came|m[aá]s simple|soy nuevo|no s[eé]|no capto|b[aá]sico|desde cero|como si fuera|para tont|para beb[eé]|f[aá]cil)\b/i;

const AREA_PATTERNS: { area: string; re: RegExp }[] = requestAreas.map((area) => ({
  area,
  re: new RegExp(area.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
}));

function inferExperienceLevel(message: string, history: ChatTurn[]): ClientExperienceLevel {
  const blob = [message, ...history.map((h) => h.content ?? '')].join(' ');

  if (BEGINNER_RE.test(blob)) return 'beginner';
  if (JARGON_RE.test(blob) && !BEGINNER_RE.test(blob)) return 'advanced';

  const userTurns = history.filter((h) => h.role === 'user').length;
  if (userTurns >= 4 && JARGON_RE.test(blob)) return 'intermediate';

  return 'unknown';
}

function inferPreferredArea(message: string, history: ChatTurn[]): string | null {
  const blob = [message, ...history.map((h) => h.content ?? '')].join(' ');
  for (const { area, re } of AREA_PATTERNS) {
    if (re.test(blob)) return area;
  }
  return null;
}

function inferRecurringTopics(message: string, history: ChatTurn[]): string[] {
  const blob = [message, ...history.slice(-8).map((h) => h.content ?? '')].join(' ');
  return detectConsultantSkills(blob).slice(0, 4);
}

export function inferClientSignals(message: string, history: ChatTurn[] = []): ClientSignals {
  const level = inferExperienceLevel(message, history);
  return {
    experienceLevel: level,
    preferredArea: inferPreferredArea(message, history),
    recurringTopics: inferRecurringTopics(message, history),
    needsSimpleLanguage: userNeedsReassurance(message, history) || level === 'beginner',
    openRequestCount: 0,
  };
}

export function experienceHint(level: ClientExperienceLevel, needsSimple: boolean): string {
  if (needsSimple || level === 'beginner') {
    return `NIVEL: principiante o pide explicación simple → palabras cotidianas, frases cortas, cero jerga. Explica "qué es", "para qué sirve" y "qué haces tú mañana". Como si le contaras a un compañero que no es técnico.`;
  }
  if (level === 'advanced') {
    return `NIVEL: usuario con vocabulario técnico → puedes ser más directo, pero sigue sonando humano (no manual PDF).`;
  }
  return `NIVEL: desconocido → empieza simple; si usa jerga en su mensaje, sube un poco el detalle.`;
}
