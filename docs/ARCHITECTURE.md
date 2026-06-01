# Working With Sergio — Arquitectura

## Visión general

Portal SaaS enterprise para consultoría de Analytics que conecta clientes con servicios, documentación técnica, gestión de requerimientos e insights automatizados con IA.

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL (CDN)                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Next.js 15 App Router                   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────────────────┐ │   │
│  │  │  Pages   │ │   API    │ │  Server Components   │ │   │
│  │  │ (Public) │ │  Routes  │ │  (Supabase SSR)      │ │   │
│  │  └──────────┘ └────┬─────┘ └──────────┬───────────┘ │   │
│  └────────────────────┼───────────────────┼─────────────┘   │
└───────────────────────┼───────────────────┼─────────────────┘
                        │                   │
            ┌───────────▼───────┐   ┌───────▼──────────┐
            │  AI Microservice  │   │     SUPABASE      │
            │  (FastAPI/Python) │   │  ┌──────────────┐ │
            │  ┌─────────────┐  │   │  │ PostgreSQL  │ │
            │  │ OpenAI API  │  │   │  │ Auth + RLS  │ │
            │  │ Pandas      │  │   │  │ Storage     │ │
            │  │ Anomaly Det │  │   │  └──────────────┘ │
            │  └─────────────┘  │   └──────────────────┘
            └───────────────────┘
                        │
            ┌───────────▼───────┐
            │  Google Cloud     │
            │  GA4 · GTM · BQ  │
            └───────────────────┘
```

## Capas de la aplicación

### 1. Presentation Layer (Next.js)

- **Server Components**: Páginas que leen de Supabase (playbooks, KB, events, hub)
- **Client Components**: Formularios interactivos (request center, AI upload, contact)
- **API Routes**: Proxy a Supabase (service role) y AI microservice

### 2. Data Layer (Supabase)

- PostgreSQL con RLS habilitado en todas las tablas
- Auth para usuarios internos (admin/consultant) y clientes
- Storage bucket `analytics-uploads` para archivos del AI Center
- Triggers para auto-crear profiles y updated_at

### 3. AI Layer (Python FastAPI)

- Recibe CSV/XLSX via multipart upload
- Pandas para estadísticas descriptivas y detección de outliers (IQR)
- OpenAI para resumen ejecutivo e insights en lenguaje natural
- Fallback rule-based cuando OpenAI no está disponible

### 4. Analytics Layer (Google)

- GA4 + GTM integrados via script tags en layout
- BigQuery para análisis avanzado (configuración server-side)
- Event Catalog como single source of truth para implementación

## Seguridad (RLS)

| Tabla | Lectura pública | Escritura |
|-------|----------------|-----------|
| playbooks | Solo published | Internal only |
| articles | Solo published | Internal only |
| event_catalog | Solo active | Internal only |
| requests | Own + internal | Anyone insert |
| analytics_notes | Internal only | Internal only |
| insights | Own + internal | Authenticated insert |
| profiles | Own + internal | Own update |

Función helper `is_internal_user()` verifica role admin/consultant.

## Wireframes (ASCII)

### Home
```
┌────────────────────────────────────────────┐
│ [Logo]  Nav Links...        [Request CTA]  │
├────────────────────────────────────────────┤
│                                            │
│   Analytics Operating System               │
│   Decisiones de negocio                    │
│   respaldadas por datos                    │
│                                            │
│   [Solicitar consultoría] [Analytics OS]   │
│                                            │
│   ┌────┐ ┌────┐ ┌────┐ ┌────┐            │
│   │GA4 │ │ BQ │ │Gov │ │ AI │            │
│   └────┘ └────┘ └────┘ └────┘            │
├────────────────────────────────────────────┤
│   Qué hago — 6 service cards               │
│   Mi enfoque — principles + maturity path  │
│   CTA section                              │
├────────────────────────────────────────────┤
│   Footer                                   │
└────────────────────────────────────────────┘
```

### Analytics Hub
```
┌────────────────────────────────────────────┐
│ Analytics Hub                              │
├──────┬──────┬──────┬──────────────────────┤
│ Open │ Prog │  P0  │ Closed               │
├──────┴──────┴──────┴──────────────────────┤
│ Open Requests Table    │ Activity Feed     │
│ ─────────────────────  │ ────────────────  │
│ Title | Type | P | St  │ • New request     │
│ ...                    │ • Status change   │
├────────────────────────┤ • ...             │
│ Closed Requests        │                   │
└────────────────────────┴───────────────────┘
```

### AI Insights Center
```
┌────────────────────────────────────────────┐
│ AI Insights Center                         │
├──────────────┬─────────────────────────────┤
│  Upload Zone │  [Summary|Insights|Anomaly]  │
│  ┌────────┐  │                             │
│  │ Drop   │  │  Executive Summary          │
│  │ CSV    │  │  ─────────────────          │
│  │ XLSX   │  │  Insights list...           │
│  └────────┘  │  Anomalies...               │
└──────────────┴─────────────────────────────┘
```

## Flujo de solicitudes

```
Client → Request Center Form → POST /api/requests
  → Supabase (requests table, RLS insert allowed)
  → Analytics Hub (internal view)
  → SLA-based response
  → Status updates + comments
```

## Flujo AI Insights

```
User → Upload file → POST /api/insights/analyze
  → Forward to Python /analyze
  → Pandas stats + anomaly detection
  → OpenAI executive summary
  → Return JSON → UI tabs display
  → (Optional) Save to insights table + uploaded_files
```

## Deployment Strategy

### Vercel (Frontend)
- Auto-deploy from GitHub main branch
- Environment variables from dashboard
- Edge middleware for auth (future)
- Preview deployments for PRs

### Supabase (Backend)
- Managed PostgreSQL
- Migrations via SQL Editor or CLI
- Storage buckets configured in dashboard
- Auth providers as needed

### AI Service (Railway/Fly.io/Cloud Run)
- Docker container from `services/ai-analyzer/Dockerfile`
- Environment: OPENAI_API_KEY, PORT, ALLOWED_ORIGINS
- Health check: GET /health
- Scale: 1 instance minimum, auto-scale on demand

## Próximos pasos recomendados

1. Auth flow completo (login/logout para hub interno)
2. Email notifications en nuevas solicitudes (Resend/SendGrid)
3. BigQuery integration para AI Insights directo
4. Real-time updates en Hub via Supabase Realtime
5. CMS admin panel para playbooks y articles
6. Automated GA4 event validation against catalog
