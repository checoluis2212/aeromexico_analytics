export type GlossaryEntry = {
  term: string;
  def: string;
  category?: 'basics' | 'tools' | 'tracking';
};

export const analyticsGlossary: GlossaryEntry[] = [
  {
    term: 'Evento',
    def: 'Registro de algo que pasó (ej. “purchase”, “add_to_cart”, “search”).',
    category: 'basics',
  },
  {
    term: 'Conversión',
    def: 'Un evento que marca un resultado que te importa (ej. compra, registro).',
    category: 'basics',
  },
  {
    term: 'Data layer',
    def: 'Objeto/estructura con datos que la web/app expone para medición (lo lee GTM).',
    category: 'tracking',
  },
  {
    term: 'GTM (Google Tag Manager)',
    def: 'Herramienta para disparar y administrar tags sin tocar tanto código.',
    category: 'tools',
  },
  {
    term: 'GA4',
    def: 'Google Analytics 4. Recibe eventos y permite analizarlos (reportes, exploraciones).',
    category: 'tools',
  },
  {
    term: 'Measurement Protocol',
    def: 'Forma de enviar eventos a GA4 por HTTP (servidor, app o backend), sin gtag en el navegador.',
    category: 'tracking',
  },
  { term: 'Tag', def: 'La pieza que envía datos a una herramienta (GA4, Ads, etc.).', category: 'tracking' },
  {
    term: 'Trigger',
    def: 'La regla que decide cuándo se dispara un tag (clic, página, evento, etc.).',
    category: 'tracking',
  },
  {
    term: 'DebugView / Preview',
    def: 'Modo de prueba para validar que todo está llegando bien.',
    category: 'tools',
  },
  {
    term: 'Looker Studio',
    def: 'Herramienta para armar dashboards conectados a GA4/BigQuery.',
    category: 'tools',
  },
  {
    term: 'BigQuery',
    def: 'Base de datos donde cae el export de GA4 para análisis con SQL.',
    category: 'tools',
  },
  {
    term: 'UTM',
    def: 'Parámetros en URLs para identificar campañas (source/medium/campaign).',
    category: 'tracking',
  },
];

export const glossaryCategoryLabels: Record<NonNullable<GlossaryEntry['category']>, string> = {
  basics: 'Lo básico',
  tools: 'Herramientas',
  tracking: 'Medición',
};
