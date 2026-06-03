/** Conceptos Analytics — respuestas locales en prosa */

import {
  userNeedsReassurance,
  withOptionalAnalogy,
  wrapExplainedReply,
} from '@/lib/ai/assistant-style';

export type AnalyticsConcept = {
  id: string;
  match: RegExp;
  title: string;
  explain: string;
  /** Solo se muestra si el usuario suena confundido o estresado */
  analogy?: string;
};

export const ANALYTICS_CONCEPTS: AnalyticsConcept[] = [
  {
    id: 'dashboard_funnel_request',
    match:
      /dashboard.*(embudo|funnel)|(embudo|funnel).*dashboard|vuelo.*compra|funnel.*vuelo|embudo.*vuelo|compra.*vuelo/i,
    title: 'Dashboard + embudo (ej. vuelo → compra)',
    explain: `Quieres ver en una pantalla dónde se cae la gente desde que busca vuelo hasta que paga. Eso combina un **dashboard** (todos los números juntos) con un **embudo** (cada paso en orden: buscar → elegir → pagar).

Para que funcione, cada paso tiene que estar medido en GA4 con eventos claros — buscar, elegir vuelo, pasajeros, pago y \`purchase\`. Puedes ver cuáles tenemos en [Eventos GA4](/event-catalog). Aquí te lo explico; si quieres que lo armemos contigo en Looker o GA4, cuéntamelo en [Pedir con IA](/pedir).`,
    analogy: `Piensa en un mapa con semáforos en cada paso: verde es donde la gente pasa bien, rojo es donde se pierde — y ahí es donde conviene investigar.`,
  },
  {
    id: 'measurement_protocol',
    match: /measurement\s*protocol|protocolo\s*(de\s*)?medici[oó]n|mp\s*ga4/i,
    title: 'Measurement Protocol',
    explain: `Es la forma de **mandar eventos a GA4 por internet** sin que el usuario tenga la web abierta en el navegador. Tu servidor (o la app) le avisa a Google: "pasó esto" — por ejemplo, una compra confirmada en backend.

Lo usamos cuando el dato nace fuera del browser: confirmación de pago en servidor, app nativa, integraciones. Para implementarlo en producción, pídemelo en [Pedir con IA](/pedir).`,
    analogy: `La web mide como si alguien gritara "¡compró!" en la sala. El Measurement Protocol es llamar por teléfono desde la cocina para decir lo mismo — el mensaje llega igual, pero por otro canal.`,
  },
  {
    id: 'dashboard',
    match: /\bdashboard|\btablero|\breporte visual|\blooker\b/i,
    title: 'Dashboard / reporte',
    explain: `Es una pantalla con los números que tu equipo necesita ver seguido — conversión, revenue, tráfico — sin entrar a GA4 cada mañana a reconstruir el mismo reporte.

Los datos suelen venir de GA4, BigQuery o Looker Studio conectados a lo que ya medimos en Aeroméxico. Si quieres uno hecho a tu medida, cuéntame la pregunta de negocio en [Pedir con IA](/pedir).`,
    analogy: `Funciona como el tablero del carro: velocímetro, gasolina, temperatura — en un vistazo sabes si vas bien sin abrir el capó.`,
  },
  {
    id: 'funnel',
    match: /\bembudo|\bfunnel|\bconversi[oó]n.*paso|\bvuelo.*compra|\bcheckout/i,
    title: 'Embudo (funnel)',
    explain: `Te muestra **en qué paso se cae la gente** antes de completar una acción — por ejemplo, de buscar vuelo a pagar. Cada paso es un evento en GA4 (\`search\`, \`add_to_cart\`, \`purchase\`, etc.).

Los eventos que usamos en Aeroméxico están en [Eventos GA4](/event-catalog). Para armarlo contigo con datos reales, [Pedir con IA](/pedir).`,
    analogy: `Se llama embudo porque arriba entra mucha gente y abajo sale menos — como cuando viertes agua: quieres saber exactamente dónde se escapa.`,
  },
  {
    id: 'gtag',
    match: /\bgtag\b|google tag\b/i,
    title: 'gtag.js',
    explain: `Es el **código de Google** que conecta tu página con GA4. Cuando pasa algo — una compra, un clic — gtag le manda el aviso a Google.

\`\`\`javascript
gtag('event', 'purchase', { value: 1500, currency: 'MXN' });
\`\`\`

En Aeroméxico muchas veces no lo tocas directo: **GTM** se encarga de dispararlo según las reglas que definimos.`,
    analogy: `Es el mensajero que lleva la nota "alguien compró" hasta GA4.`,
  },
  {
    id: 'data_layer',
    match: /data\s*layer|datalayer|capa de datos/i,
    title: 'Data layer',
    explain: `Es una **estructura de datos en JavaScript** que la web o app llena con información del negocio — producto, precio, paso del checkout — y que GTM lee para mandar eventos a GA4 sin hardcodear todo en cada tag.

\`\`\`javascript
dataLayer.push({ event: 'add_to_cart', ecommerce: { value: 1299 } });
\`\`\`

En Aeroméxico el data layer lo mantenemos centralizado para que todos los equipos midan igual.`,
    analogy: `Es como una pizarra en la cocina: el sitio escribe "pedido #123, $1,500" y GTM copia eso al tag de GA4.`,
  },
  {
    id: 'gtm',
    match: /\bgtm\b|tag manager|google tag manager/i,
    title: 'Google Tag Manager (GTM)',
    explain: `Es la **caja de control** donde encendemos tags — GA4, Ads, otros — sin cambiar el código del sitio cada vez. Defines reglas (triggers) y qué datos mandar (variables).

En Aeroméxico usamos GTM encima del data layer para que Marketing, Producto y E-commerce no dependan de un deploy de código por cada medición nueva.`,
    analogy: `Es el tablero de luces de un escenario: tú decides cuándo se prende cada foco y con qué condición.`,
  },
  {
    id: 'ga4',
    match: /^(qu[eé]|que)\s+(es\s+)?ga4|\bgoogle analytics 4\b|\bga4\b/i,
    title: 'GA4',
    explain: `Es la herramienta de Google donde **se guarda qué hace la gente** en web y app: visitas, clics, compras, búsquedas. Todo llega como eventos con nombre y parámetros.

No funciona solo: hay que configurar bien qué medir. En Aeroméxico eso está documentado en [Eventos GA4](/event-catalog).`,
    analogy: `Es como un diario de visitas — "entró", "buscó vuelo", "compró" — con fecha y detalles.`,
  },
  {
    id: 'bigquery',
    match: /\bbigquery\b|\bbq\b|\bsql\b.*ga4/i,
    title: 'BigQuery',
    explain: `Es el **almacén de datos** donde cae la exportación de GA4 cuando necesitas preguntas más finas — cruzar sesiones, cohortes, revenue detallado — con SQL.

GA4 te da resúmenes rápidos; BigQuery te deja investigar fila por fila. Para queries o datasets en Aeroméxico, [Pedir con IA](/pedir).`,
    analogy: `GA4 es el resumen del mes en una hoja; BigQuery es el cajón con cada ticket si necesitas sumar a mano.`,
  },
  {
    id: 'attribution',
    match:
      /^(qu[eé]|que)\s+(es\s+)?(la\s+)?atribuci|atribuci[oó]n\s+(es|significa)|\butm\b.*(qu[eé]|es\s|significa)|^(qu[eé]|que)\s+(es\s+)?(un\s+)?utm\b/i,
    title: 'Atribución / UTM',
    explain: `La **atribución** responde: ¿de dónde vino quien compró o se registró? Campaña de email, Google Ads, orgánico…

Los **UTM** son parámetros en la URL (\`utm_source\`, \`utm_campaign\`, etc.) que etiquetan el origen del tráfico para que GA4 sepa de dónde llegó cada visita.`,
    analogy: `Es como preguntar "¿cómo te enteraste del restaurante?" — cada respuesta te dice qué canal funcionó.`,
  },
  {
    id: 'kpi',
    match: /\bkpi\b|\bm[eé]trica clave|\bindicador/i,
    title: 'KPI',
    explain: `Es **el número que más importa** para decidir en tu área — puede ser conversión, revenue, costo por reserva, tasa de abandono en checkout. Uno o pocos, no veinte a la vez.

El KPI correcto depende de la pregunta de negocio, no de lo que GA4 muestre por default.`,
    analogy: `En un viaje, el KPI puede ser "¿llegamos a tiempo?" — una señal clara, no veinte indicadores distintos.`,
  },
  {
    id: 'enhanced_measurement',
    match: /enhanced\s*measurement|medici[oó]n\s*mejorada|medici[oó]n\s*autom[aá]tica/i,
    title: 'Enhanced measurement',
    explain: `GA4 puede medir **automáticamente** cosas básicas — clics en links externos, scroll, descargas — sin que programes eventos custom.

Útil como base, pero **no reemplaza** medir bien compra, checkout o pasos de negocio con eventos definidos y documentados.`,
    analogy: `Son como sensores automáticos en la puerta — ayudan, pero no saben si alguien terminó de pagar un vuelo.`,
  },
  {
    id: 'debugview',
    match: /debugview|debug\s*view|vista\s*de\s*depuraci/i,
    title: 'DebugView',
    explain: `Es el **modo de prueba en vivo** de GA4: ves los eventos segundos después de que ocurren, mientras navegas con el debug activo.

Lo usamos para validar que un tag nuevo dispara bien antes de confiar en los reportes de producción.`,
    analogy: `Es el monitor de cocina donde ves si el plato salió bien antes de servirlo al cliente.`,
  },
  {
    id: 'consent_mode',
    match: /consent\s*mode|modo\s*consentimiento|cookies.*ga4/i,
    title: 'Consent Mode',
    explain: `Le dice a Google **si el usuario aceptó cookies** antes de medir con datos completos. Sin consentimiento, GA4 puede medir de forma limitada o con modelado.

En Aeroméxico lo integramos con el banner de cookies para cumplir privacidad sin quedarnos ciegos del todo.`,
    analogy: `Es tocar el timbre y esperar permiso para entrar — sin consentimiento, la medición es más tenue.`,
  },
  {
    id: 'event',
    match: /^(qu[eé]|que)\s+(es\s+)?(un\s+)?evento\b|\bevento\s+en\s+ga4/i,
    title: 'Evento en GA4',
    explain: `Un evento es un **"algo pasó"** registrado en GA4: compró, buscó vuelo, hizo clic en pagar. Cada evento tiene nombre (\`purchase\`) y parámetros (precio, moneda, producto).

Los eventos oficiales de Aeroméxico están en [Eventos GA4](/event-catalog).`,
    analogy: `Cada evento es como una campanita con etiqueta — suena cuando pasa algo y GA4 anota qué fue.`,
  },
  {
    id: 'tracking_plan',
    match: /plan de medici[oó]n|tracking plan|qu[eé] medir|medir algo/i,
    title: 'Plan de medición',
    explain: `Es el acuerdo previo de **qué vamos a contar, cómo y con qué nombres**, antes de tocar GTM o GA4. Sin eso, cada equipo mide distinto y los números no cuadran nunca.

Si necesitas uno para un flujo nuevo en Aeroméxico, cuéntame la pregunta de negocio en [Pedir con IA](/pedir).`,
    analogy: `Es el menú del restaurante antes de abrir — qué platos sirves, qué llevan y quién los prepara.`,
  },
];

export function matchAnalyticsConcept(message: string): AnalyticsConcept | null {
  for (const concept of ANALYTICS_CONCEPTS) {
    if (concept.match.test(message)) return concept;
  }
  return null;
}

export function formatAnalyticsConceptReply(
  concept: AnalyticsConcept,
  message = '',
  history?: { role?: string; content?: string }[]
): string {
  const body = withOptionalAnalogy(concept.explain, concept.analogy, message, history);
  return wrapExplainedReply(concept.title, body);
}

export function buildAnalyticsConceptsContext(message: string): string {
  const concept = matchAnalyticsConcept(message);
  if (!concept) return '';
  const extra =
    concept.analogy && userNeedsReassurance(message)
      ? `\nSi hace falta calmar: ${concept.analogy}`
      : '';
  return `Concepto — ${concept.title}:\n${concept.explain}${extra}`;
}

/** @deprecated usar matchAnalyticsConcept */
export const matchGa4Concept = matchAnalyticsConcept;
/** @deprecated */
export const formatGa4ConceptReply = formatAnalyticsConceptReply;
/** @deprecated */
export const buildGa4ConceptsContext = buildAnalyticsConceptsContext;
export type Ga4Concept = AnalyticsConcept;
export const GA4_CONCEPTS = ANALYTICS_CONCEPTS;
