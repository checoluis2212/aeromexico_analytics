import type { ScenarioChip } from '@/components/assistant/preguntale-scenarios';
import { pedirHubHref } from '@/lib/ai/assistant-modes';

/** Atajos del AI Agent — acciones reales del portal (no escenarios genéricos). */
export const CLIENT_AGENT_SHORTCUTS: ScenarioChip[] = [
  {
    id: 'my_orders',
    area: 'Mis pedidos',
    title: 'Ver mis pedidos',
    subtitle: 'Lista y estado de lo que ya pediste',
    message: '¿Puedes mostrarme mis pedidos y en qué estado están?',
  },
  {
    id: 'order_status',
    area: 'Seguimiento',
    title: '¿En qué va mi pedido?',
    subtitle: 'Avance, plazo y si te falta hacer algo',
    message: '¿En qué va mi pedido más reciente y necesito hacer algo?',
  },
  {
    id: 'analytics_doubt',
    area: 'Consultor',
    title: 'Duda de analytics',
    subtitle: 'GA4, GTM, embudos, campañas, ROAS…',
    message:
      'Tengo una duda de analytics — te cuento el contexto y me orientas con pasos concretos.',
  },
  {
    id: 'numbers_dont_match',
    area: 'Calidad de datos',
    title: 'Números que no cuadran',
    subtitle: 'GA4 vs finanzas u otro reporte',
    message:
      'Los números de GA4 no cuadran con lo que ve finanzas. ¿Por dónde empezamos a revisarlo?',
  },
  {
    id: 'pedir_trabajo',
    area: 'Nuevo pedido',
    title: 'Hacer un pedido',
    subtitle: 'Te pregunto primero y luego el formulario',
    message: 'Quiero hacer un nuevo pedido',
  },
  {
    id: 'pedir_hub',
    area: 'Portal',
    title: 'Elegir cómo pedir',
    subtitle: 'Formulario guiado o comparar opciones',
    href: pedirHubHref(),
  },
];

export const CONSULTOR_WELCOME = `Hola, soy **Sergio**.

Desde aquí puedes **ver tus pedidos**, **hacer un pedido nuevo** (formulario guiado en este chat) o **resolver dudas de analytics**. Elige un atajo o escribe directo — por ejemplo *quiero hacer un nuevo pedido*.`;

export const CONSULTOR_SUGGESTIONS = [
  'Ver mis pedidos',
  'Quiero hacer un nuevo pedido',
  '¿En qué va mi pedido más reciente?',
  'Los números de GA4 no cuadran con finanzas',
  '¿Qué datos necesitas para un reporte de ROAS?',
];
