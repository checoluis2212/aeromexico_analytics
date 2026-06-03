import type { CreateRequestInput } from '@/lib/requests/create-request';

/** Casos de uso reales — prioridad: facilitar la vida al stakeholder de Aeroméxico */

export type UseCaseScenario = {
  id: string;
  area: string;
  title: string;
  subtitle: string;
  /** Qué le pasa al usuario */
  userSituation: string;
  /** Cómo ayuda Sergio / el agente */
  sergioHelp: string;
  /** Mensaje que dispara el chat con contexto */
  starterMessage: string;
  requestType: NonNullable<CreateRequestInput['type']>;
  keywords: RegExp;
};

export const AEROMEXICO_USE_CASES: UseCaseScenario[] = [
  {
    id: 'checkout_funnel',
    area: 'E-commerce',
    title: 'Embudo de compra',
    subtitle: '¿Dónde se cae la gente antes de pagar?',
    userSituation:
      'Marketing o E-commerce ven caída en checkout pero no saben en qué paso (buscar vuelo, pasajeros, pago).',
    sergioHelp:
      'Revisamos qué eventos tenemos en GA4, armamos el embudo vuelo→compra y te digo dónde optimizar. Si falta medición, la implementamos.',
    starterMessage:
      'Necesito entender en qué paso del checkout se cae la gente antes de comprar un vuelo. ¿Qué medimos hoy y qué me recomiendas?',
    requestType: 'funnel',
    keywords: /checkout|embudo|conversi[oó]n|compra|vuelo|booking|abandon/i,
  },
  {
    id: 'campaign_dashboard',
    area: 'Marketing',
    title: 'Dashboard de campaña',
    subtitle: 'KPIs sin pelearse con GA4 cada lunes',
    userSituation:
      'Un equipo de campaña necesita ver tráfico, conversiones y revenue de forma clara para decisiones semanales.',
    sergioHelp:
      'Conectamos GA4 o BigQuery a Looker con los KPIs que importan a tu campaña — definición acordada, no números sueltos.',
    starterMessage:
      'Quiero un dashboard para mi campaña de marketing: tráfico, conversiones y revenue. ¿Qué necesitas de mí para arrancar?',
    requestType: 'dashboard',
    keywords: /dashboard|tablero|campa[ñn]a|kpi|reporte|looker|marketing/i,
  },
  {
    id: 'numbers_dont_match',
    area: 'Cualquier área',
    title: 'Los números no cuadran',
    subtitle: 'GA4 dice una cosa, finanzas otra',
    userSituation:
      'Revenue, reservas o conversiones en GA4 no coinciden con otro sistema y nadie sabe por qué.',
    sergioHelp:
      'Investigo si es implementación, definición (qué cuenta y qué no) o timing. Te digo la causa y el plan de fix.',
    starterMessage:
      'Los números de GA4 no cuadran con lo que ve finanzas / mi otro reporte. ¿Por dónde empezamos a revisarlo?',
    requestType: 'qa',
    keywords: /no cuadr|discrepan|no coincid|validar|reconcil|ga4.*finanz|finanz.*ga4/i,
  },
  {
    id: 'new_flow_tracking',
    area: 'Producto / App',
    title: 'Medir un flujo nuevo',
    subtitle: 'Lanzamos algo y necesitamos datos el día uno',
    userSituation:
      'Producto o App lanza checkout nuevo, feature o pantalla y necesitan eventos en GA4 antes o junto al deploy.',
    sergioHelp:
      'Definimos qué medir, lo alineamos al catálogo de eventos, implementamos vía GTM/data layer y validamos en DebugView.',
    starterMessage:
      'Vamos a lanzar un flujo nuevo en web/app y necesito medirlo bien desde el día uno. ¿Cómo trabajamos juntos?',
    requestType: 'tracking',
    keywords: /nuevo|lanz|medir|evento|tag|implement|flujo|feature|deploy/i,
  },
  {
    id: 'what_can_i_ask',
    area: 'Onboarding',
    title: '¿Qué puedo pedir?',
    subtitle: 'Primera vez aquí',
    userSituation:
      'Alguien nuevo en Aeroméxico no sabe qué puede pedirle a Sergio ni por dónde empezar.',
    sergioHelp:
      'Te oriento según tu área: dashboard, embudo, evento nuevo, revisión de datos, BigQuery. Pedir es opcional — primero entendemos tu necesidad.',
    starterMessage:
      'Soy de Aeroméxico y no sé bien qué puedo pedirte de analytics. ¿Qué tipo de cosas suele necesitar mi equipo?',
    requestType: 'dashboard',
    keywords: /qu[eé] puedo pedir|qu[eé] me puedes|primera vez|no s[eé] qu[eé]|onboarding/i,
  },
  {
    id: 'bigquery_report',
    area: 'Data / Liderazgo',
    title: 'Datos en BigQuery',
    subtitle: 'Preguntas que GA4 responde mal',
    userSituation:
      'Necesitan cruzar sesiones, cohortes o revenue con más detalle del que da la interfaz de GA4.',
    sergioHelp:
      'Exportamos o consultamos GA4 en BigQuery, armamos la query o dataset recurrente y te explico qué significa.',
    starterMessage:
      'Necesito una consulta o reporte en BigQuery que GA4 no me da fácil. ¿Qué información necesitas para ayudarme?',
    requestType: 'reporting',
    keywords: /bigquery|sql|query|dataset|cohorte|export/i,
  },
];

export function getUseCaseById(id: string): UseCaseScenario | undefined {
  return AEROMEXICO_USE_CASES.find((u) => u.id === id);
}

export function matchUseCaseScenario(message: string): UseCaseScenario | null {
  for (const scenario of AEROMEXICO_USE_CASES) {
    if (scenario.keywords.test(message)) return scenario;
  }
  return null;
}

export function buildUseCasesContextForAgent(): string {
  return AEROMEXICO_USE_CASES.map(
    (u) =>
      `[${u.area}] ${u.title}: Situación usuario: ${u.userSituation} → Sergio: ${u.sergioHelp} (tipo pedido: ${u.requestType})`
  ).join('\n');
}

export function getScenariosForUI() {
  return AEROMEXICO_USE_CASES.filter((u) => u.id !== 'what_can_i_ask').map((u) => ({
    id: u.id,
    area: u.area,
    title: u.title,
    subtitle: u.subtitle,
    message: u.starterMessage,
    requestType: u.requestType,
  }));
}

export const WELCOME_MESSAGE = `## Hola, soy Sergio

Usa **Pedido con IA** abajo para contarme qué necesitas — te guío paso a paso en cinco pasos.`;
