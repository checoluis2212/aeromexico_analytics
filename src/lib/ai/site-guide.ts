import { requestTypes, services } from '@/lib/constants';
import { pedirHubHref, preguntaleHref } from '@/lib/ai/assistant-modes';
import { withOptionalAnalogy, wrapExplainedReply } from '@/lib/ai/assistant-style';

/** Guía del portal — qué puedes hacer tú y qué hace Sergio desde aquí */

export type SiteGuideSection = {
  id: string;
  href: string;
  title: string;
  simple: string;
  who: 'todos' | 'logueado' | 'sergio';
};

export const SITE_GUIDE_SECTIONS: SiteGuideSection[] = [
  {
    id: 'home',
    href: '/',
    title: 'Inicio',
    simple: 'La puerta de entrada: quién es Sergio, qué stack usamos (GA4, GTM, BigQuery) y el semáforo de capacidad.',
    who: 'todos',
  },
  {
    id: 'preguntale',
    href: pedirHubHref(),
    title: 'Pedir con IA',
    simple: 'Elige si quieres pedido guiado o consultor — luego Sergio te acompaña con IA desde un solo menú.',
    who: 'logueado',
  },
  {
    id: 'mis-pedidos',
    href: '/mis-pedidos',
    title: 'Mis pedidos',
    simple: 'Estado de lo que pediste. Columna IA o botón Copiloto para preguntar al instante sin escribir a Sergio.',
    who: 'logueado',
  },
  {
    id: 'event-catalog',
    href: '/event-catalog',
    title: 'Eventos GA4',
    simple: 'Lista oficial de qué medimos en Aeroméxico: nombres, parámetros, ejemplos.',
    who: 'todos',
  },
  {
    id: 'working-with-me',
    href: '/working-with-me',
    title: 'Cómo trabajo',
    simple: 'Tiempos de respuesta, prioridades, semáforo y cómo colaborar.',
    who: 'todos',
  },
  {
    id: 'glosario',
    href: '/glosario',
    title: 'Glosario',
    simple: 'Términos de analytics traducidos — data layer, UTM, conversión.',
    who: 'todos',
  },
  {
    id: 'faq',
    href: '/faq',
    title: 'FAQ',
    simple: 'Preguntas frecuentes: herramientas, tiempos, qué mandarme para avanzar.',
    who: 'todos',
  },
  {
    id: 'about',
    href: '/about',
    title: 'Sobre mí',
    simple: 'Quién soy y cómo encajo en Aeroméxico.',
    who: 'todos',
  },
  {
    id: 'contact',
    href: '/contact',
    title: 'Contacto',
    simple: 'Canal directo fuera del flujo de pedidos.',
    who: 'todos',
  },
];

const SITE_GUIDE_MATCH =
  /\b(qu[eé]\s+puedo\s+hacer|qu[eé]\s+puede\s+hacer|gu[ií]a\s+(del\s+)?sitio|gu[ií]a\s+del\s+portal|c[oó]mo\s+(usar|funciona)\s+(el\s+)?(sitio|portal|p[aá]gina)|para\s+qu[eé]\s+sirve\s+(este\s+)?(sitio|portal)|desde\s+(aqu[ií]|este\s+sitio)|secciones\s+del\s+portal|qu[eé]\s+hay\s+aqu[ií]|mis\s+pedidos\s+para\s+qu[eé]|diferencia\s+entre\s+(preg[uú]ntale|pedir|bot|chat)|puedes\s+ayudarme\s+desde|qu[eé]\s+ofrece\s+(el\s+)?(sitio|portal)|mapa\s+del\s+sitio)\b/i;

const REQUEST_TYPES_MATCH =
  /\b(qu[eé]\s+(tipos?|clases?)\s+de\s+pedido|qu[eé]\s+puedo\s+pedir|qu[eé]\s+trabajos?\s+(haces|hace\s+sergio)|servicios?\s+de\s+sergio)\b/i;

export function isSiteGuideQuestion(message: string): boolean {
  return SITE_GUIDE_MATCH.test(message) || REQUEST_TYPES_MATCH.test(message);
}

export function buildSiteGuideContext(): string {
  const sections = SITE_GUIDE_SECTIONS.map(
    (s) => `${s.title} (${s.href}): ${s.simple}`
  ).join('\n');
  const requestBlock = requestTypes.map((t) => `${t.label}: ${t.description}`).join('\n');
  const servicesBlock = services.map((s) => `${s.title}: ${s.description}`).join('\n');

  return `Mapa del portal (referencia interna — explicar en prosa al usuario):
${sections}

Tipos de pedido: ${requestBlock}

Servicios Sergio: ${servicesBlock}

Regla: Pregúntale = explicar. Pedir a Sergio = trabajo en cola.`;
}

function explainRequestTypesInProse(): string {
  return requestTypes
    .map((t, i) => {
      const desc = `${t.description.charAt(0).toLowerCase()}${t.description.slice(1)}`;
      if (i === 0)
        return `Por ejemplo, si necesitas **${t.label.toLowerCase()}**, ${desc}`;
      if (i === requestTypes.length - 1)
        return `También puedes pedir **${t.label.toLowerCase()}** cuando ${desc}`;
      return `O **${t.label.toLowerCase()}** — ${desc}`;
    })
    .join(' ');
}

export function formatSiteGuideReply(
  message: string,
  history?: { role?: string; content?: string }[]
): string {
  const lower = message.toLowerCase();

  if (REQUEST_TYPES_MATCH.test(message) && !SITE_GUIDE_MATCH.test(message)) {
    const servicesIntro = services
      .slice(0, 3)
      .map((s) => s.title)
      .join(', ');

    const explain = `Cuando ya sabes qué necesitas y quieres que **yo lo haga contigo**, entra a [Pedir con IA](${pedirHubHref()}) — pedido guiado paso a paso o consultor si solo tienes dudas. No hace falta GTM ni SQL: cuéntame el problema en negocio y el pedido cae en mi cola.

${explainRequestTypesInProse()} En la práctica cubro ${servicesIntro} y más — siempre sobre el stack de Aeroméxico (GA4, GTM, BigQuery, Looker). Cuando envíes el pedido, puedes seguirlo en [Mis pedidos](/mis-pedidos) sin escribirme "¿ya quedó?".`;

    const analogy = `Piensa en la diferencia entre preguntar la receta y pedir el plato servido — aquí es lo segundo: tú pides, yo lo preparo.`;

    return wrapExplainedReply(
      'Qué puedes pedirme',
      withOptionalAnalogy(explain, analogy, message, history)
    );
  }

  const diffBot =
    /\bdiferencia\b|\bbot\b|\bpreg[uú]ntale\b.*\bpedir\b|\bpedir\b.*\bpreg[uú]ntale\b/i.test(
      message
    );

  if (diffBot) {
    const explain = `En [Pedir con IA](${pedirHubHref()}) eliges dos caminos: **Consultor** — este chat — para **entender** (embudos, GA4, BigQuery…). **Solicitud** — wizard paso a paso — cuando quieres **acción**: dashboard, evento, revisión de datos.

Si solo quieres ver qué medimos, [Eventos GA4](/event-catalog). Si ya mandaste un pedido, [Mis pedidos](/mis-pedidos).`;

    const analogy = `Consultor es entender la receta; Solicitud es pedir el plato y que yo lo prepare.`;

    return wrapExplainedReply(
      'Consultor vs Solicitud',
      withOptionalAnalogy(explain, analogy, message, history)
    );
  }

  if (/\bmis\s+pedidos\b/i.test(lower)) {
    const explain = `[Mis pedidos](/mis-pedidos) es tu **bandeja de seguimiento**. Cada pedido pasa por estados visibles: enviado, en revisión, en progreso, listo — sin depender de un mensaje suelto.

Desde cada pedido (o la columna **IA**) abres seguimiento con contexto: estado, plazos y qué sigue.

Si todavía no has pedido, [Pedir con IA](${pedirHubHref()}). Si solo tienes dudas, modo Consultor en la misma herramienta.`;

    const analogy = `Es como rastrear un paquete: ves el movimiento, no solo el "entregado" al final.`;

    return wrapExplainedReply(
      'Mis pedidos',
      withOptionalAnalogy(explain, analogy, message, history)
    );
  }

  const explain = `Este portal es la **oficina en línea de Sergio Burgos**, Analytics en Aeroméxico. Aquí aprendes qué significan los datos, ves qué ya medimos, pides trabajo concreto y sigues el avance de tus pedidos.

En [Inicio](/) ves el tablero general y el semáforo — si tengo capacidad para tomar cosas nuevas. [Eventos GA4](/event-catalog) tiene la lista oficial de qué medimos. [Cómo trabajo](/working-with-me) explica tiempos y cómo colaborar. [Glosario](/glosario) y [FAQ](/faq) resuelven dudas comunes.

Con tu cuenta: [Pedir con IA](${pedirHubHref()}) — consultor o pedido guiado. [Mis pedidos](/mis-pedidos) — seguimiento.

Si **solo quieres entender**, modo Consultor. Si **quieres que lo implemente**, modo Solicitud o pantalla completa.`;

  const analogy = `Imagina un aeropuerto pequeño pero ordenado: cada puerta lleva a un sitio distinto — información, pedidos, chat, catálogo — y tú eliges según lo que necesites ahora.`;

  return wrapExplainedReply(
    'Qué puedes hacer en este sitio',
    withOptionalAnalogy(explain, analogy, message, history)
  );
}
