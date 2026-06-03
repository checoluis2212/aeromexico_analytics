import { NextRequest, NextResponse } from 'next/server';
import { requireCommandCenterAccess } from '@/lib/auth/require-api-session';

const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const REPORTS_CONTEXT = `
Reportes disponibles:
- Rendimiento por canal de adquisición (acquisition)
- Embudo de checkout e-commerce (ecommerce)
- ROAS por campaña (revenue)
- Customer Journey LTV (customer_journey)
- Engagement App Móvil (mobile)
- Adopción de features (product_analytics)
`;

export async function POST(request: NextRequest) {
  try {
    const session = await requireCommandCenterAccess();
    if (session instanceof NextResponse) return session;

    const { message, module, history } = await request.json();

    const supabase = session.supabase;
    const { data: reports } = await supabase
      .from('reports')
      .select('title, description, category, dashboard_url, business_questions')
      .eq('is_published', true)
      .limit(20);

    const reportsCtx = reports?.length
      ? reports.map((r) => `- ${r.title}: ${r.description} (${r.category})`).join('\n')
      : REPORTS_CONTEXT;

    try {
      const res = await fetch(`${AI_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          module,
          context: reportsCtx,
          history: history?.slice(-6),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return NextResponse.json({ reply: data.reply });
      }
    } catch {
      // fallback below
    }

    const reply = generateFallbackReply(message, module, reports ?? []);
    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: 'Error processing chat' }, { status: 500 });
  }
}

function generateFallbackReply(
  message: string,
  module: string,
  reports: { title: string; description: string; category: string; dashboard_url?: string | null }[]
) {
  const lower = message.toLowerCase();

  if (module === 'discovery' || lower.includes('reporte') || lower.includes('dashboard')) {
    const matches = reports.filter(
      (r) =>
        lower.includes(r.category) ||
        r.title.toLowerCase().split(' ').some((w) => lower.includes(w) && w.length > 4)
    );

    if (matches.length > 0) {
      return `Encontré ${matches.length} reporte(s) relevante(s):\n\n${matches
        .map((r) => `**${r.title}**\n${r.description}\nCategoría: ${r.category}`)
        .join('\n\n')}\n\n¿Quieres que abra alguno o prefieres crear una nueva solicitud?`;
    }

    if (lower.includes('checkout') || lower.includes('abandono')) {
      return 'Para abandono de checkout, te recomiendo el reporte **Embudo de checkout e-commerce**. Responde: "¿Dónde abandonan los usuarios?" y "¿Cuál es la tasa de conversión por paso?".\n\nSi necesitas un análisis más granular (ej. por dispositivo), puedo ayudarte a crear una solicitud en el Request Center.';
    }

    if (lower.includes('revenue') || lower.includes('campaña') || lower.includes('roas')) {
      return 'El reporte **ROAS por campaña** es el indicado. Muestra retorno de inversión por campaña y audiencia, con datos de BigQuery actualizados diariamente.\n\nLink disponible en Report Marketplace.';
    }

    return 'No encontré un reporte exacto. Te sugiero:\n1. Explorar el **Report Marketplace** por categoría\n2. Crear una solicitud en **Request Center** describiendo la business question\n\n¿Qué métrica o decisión específica necesitas resolver?';
  }

  // Copilot fallback
  if (lower.includes('sql') || lower.includes('bigquery')) {
    return `\`\`\`sql\nSELECT\n  traffic_source.source AS channel,\n  SUM(ecommerce.purchase_revenue) AS revenue,\n  COUNT(DISTINCT user_pseudo_id) AS purchasers\nFROM \`project.analytics_XXXXX.events_*\`\nWHERE event_name = 'purchase'\n  AND _TABLE_SUFFIX BETWEEN FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))\n  AND FORMAT_DATE('%Y%m%d', CURRENT_DATE())\nGROUP BY 1\nORDER BY revenue DESC\n\`\`\``;
  }

  if (lower.includes('evento') || lower.includes('ga4')) {
    return `\`\`\`javascript\ndataLayer.push({\n  event: 'add_to_cart',\n  ecommerce: {\n    currency: 'MXN',\n    value: 1299.00,\n    items: [{ item_id: 'SKU_001', item_name: 'Product Name', quantity: 1 }]\n  }\n});\n\`\`\`\n\nParámetros recomendados: currency, value, items[] con item_id, item_name, quantity.`;
  }

  return 'Como Analytics Copilot puedo ayudarte con:\n- SQL para BigQuery\n- Eventos GA4 y dataLayer\n- Measurement Plans\n- User Stories y Acceptance Criteria\n- QA Checklists\n\n¿Qué necesitas generar?';
}
