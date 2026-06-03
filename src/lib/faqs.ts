export type FaqEntry = {
  q: string;
  a: string;
  category: 'pedir' | 'casos' | 'tiempos' | 'tecnico';
};

export const faqCategoryLabels: Record<FaqEntry['category'], string> = {
  pedir: 'Pedir y trabajar conmigo',
  casos: 'Casos de uso en Aeroméxico',
  tiempos: 'Tiempos y entregas',
  tecnico: 'Referencia técnica (si la necesitas)',
};

export const analyticsFaqs: FaqEntry[] = [
  {
    category: 'casos',
    q: 'Los números del checkout no cuadran con finanzas — ¿qué hago?',
    a: 'Cuéntame qué comparas (GA4 vs qué sistema), el rango de fechas y un ejemplo de discrepancia. Sergio revisa implementación, definición y timing, y te dice la causa y el fix.',
  },
  {
    category: 'casos',
    q: 'Necesito ver dónde se pierde la gente antes de comprar un vuelo',
    a: 'Eso es un embudo de conversión. Revisamos qué pasos medimos (buscar, elegir, pagar) en el catálogo GA4 y armamos la vista. Si falta un evento, se pide como tracking nuevo.',
  },
  {
    category: 'casos',
    q: 'Quiero un dashboard para mi campaña de marketing',
    a: 'Define la pregunta de negocio: ¿tráfico, conversiones, revenue, ROAS? Sergio conecta GA4 o BigQuery a Looker con KPIs acordados — no reportes genéricos.',
  },
  {
    category: 'casos',
    q: 'Vamos a lanzar un flujo nuevo — ¿cómo medimos desde el día uno?',
    a: 'Antes o junto al deploy: qué acciones importan, nombres de eventos al catálogo, GTM/data layer y QA en DebugView. Pídelo como "medir algo nuevo" o desde Pregúntale.',
  },
  {
    category: 'casos',
    q: '¿Qué puedo pedirle a Sergio desde este portal?',
    a: 'Dashboard o reporte, medir algo nuevo (evento/tag), embudo o conversión, revisar métricas que no cuadran, datos en BigQuery, investigar un dato raro. En Pregúntale puedes orientarte y, si quieres, levantar el pedido ahí mismo (opcional).',
  },
  {
    category: 'pedir',
    q: '¿Tengo que saber programar?',
    a: 'No. Cuéntame qué quieres lograr en lenguaje de negocio — Sergio traduce a GA4, GTM o BigQuery.',
  },
  {
    category: 'pedir',
    q: '¿Qué necesito mandarte para que avances rápido?',
    a: 'Tres cosas: qué quieres lograr, dónde pasa (web, app, campaña) y un ejemplo (link, captura o el número que no cuadra).',
  },
  {
    category: 'pedir',
    q: '¿Qué pasa cuando termina un pedido?',
    a: 'Queda documentado en el catálogo de eventos cuando aplica. Puedes seguir el estado en Mis pedidos.',
  },
  {
    category: 'pedir',
    q: '¿Qué herramientas usamos?',
    a: 'GA4, Google Tag Manager, BigQuery y Looker Studio — sobre los data layers de Aeroméxico.',
  },
  {
    category: 'tiempos',
    q: '¿Cuánto tarda en estar listo?',
    a: 'Depende del pedido y la cola. Un tag puede ser el mismo día; un dashboard, unos días. Sergio confirma fecha al aceptar — mira el semáforo en Inicio o Cómo trabajo.',
  },
  {
    category: 'tecnico',
    q: '¿Qué diferencia hay entre GA4 y GTM?',
    a: 'GTM dispara tags (cómo se manda). GA4 recibe eventos (dónde se guarda). Normalmente usamos los dos.',
  },
  {
    category: 'tecnico',
    q: '¿Qué es un evento y qué es una conversión?',
    a: 'Evento = algo que pasó (clic, compra). Conversión = un evento marcado como resultado importante para el negocio.',
  },
  {
    category: 'tecnico',
    q: '¿Para qué sirve DebugView?',
    a: 'Modo prueba en vivo: ves si los eventos llegan bien a GA4 antes de confiar en reportes de producción.',
  },
];

export const faqCategoryOrder: FaqEntry['category'][] = [
  'casos',
  'pedir',
  'tiempos',
  'tecnico',
];
