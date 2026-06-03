/**
 * Contexto interno del almacén de datos (BigQuery).
 * Solo para el modelo — el usuario final no ve nombres de proyecto ni SQL.
 */

export function isBigQueryConfigured(): boolean {
  const project =
    process.env.BIGQUERY_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT_ID?.trim();
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS?.trim();
  return Boolean(project && credentials);
}

export function getBigQueryProjectId(): string | null {
  return (
    process.env.BIGQUERY_PROJECT_ID?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT_ID?.trim() ||
    null
  );
}

function parseDatasetList(): string[] {
  const raw =
    process.env.BIGQUERY_DATASETS?.trim() ||
    process.env.BIGQUERY_DATASET_IDS?.trim();
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Bloque que orienta al modelo: todas las cifras vienen del almacén corporativo. */
export function buildBigQueryWarehouseContextBlock(): string {
  const project = getBigQueryProjectId();
  const datasets = parseDatasetList();
  const location = process.env.BIGQUERY_LOCATION?.trim();

  if (!isBigQueryConfigured()) {
    return `ALMACÉN DE DATOS CORPORATIVO: no configurado en el servidor.
Sin almacén conectado no debes inventar cifras, porcentajes ni tendencias numéricas.
Puedes explicar conceptos de medición, el catálogo de eventos del portal y el flujo de pedidos.`;
  }

  const datasetLine =
    datasets.length > 0
      ? `Ámbitos de datos disponibles (interno): ${datasets.join(', ')}.`
      : 'Los datasets de negocio están en el proyecto GCP configurado (detalle en servidor).';

  const locationLine = location ? `Región de consulta (interno): ${location}.` : '';

  return `ALMACÉN DE DATOS CORPORATIVO (única fuente para KPIs, ingresos, conversiones, ROAS, cohortes y reportes):
- Proyecto GCP (interno): ${project}.
- ${datasetLine}
${locationLine}
- GA4, GTM, ads y CRM alimentan tablas en este almacén; no consultes APIs externas para números.
- Si el usuario pide una cifra y no tienes resultado de consulta en el contexto, indica que no está disponible en este momento y ofrece levantar un pedido o acotar la pregunta — nunca inventes datos.`;
}
