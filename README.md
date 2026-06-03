# Working With Sergio

Portal profesional de Analytics Consulting construido con Next.js 15, Supabase y microservicios Python para AI Insights.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Analytics | GA4, GTM, BigQuery |
| AI | Python FastAPI + OpenAI |
| Deploy | Vercel (frontend) + Railway/Fly.io (AI service) |

## Páginas

| Ruta | Descripción |
|------|------------|
| `/` | Home — Hero, servicios, enfoque, CTA |
| `/about` | Filosofía, colaboración, principios |
| `/working-with-me` | SLAs, prioridades, FAQs |
| `/playbooks` | Analytics Playbooks (GA4, GTM, BQ...) |
| `/pedir` | Hub de pedidos con IA |
| `/preguntale` | Consultor y pedido guiado → Supabase |
| `/knowledge-base` | Wiki de artículos y guías |
| `/event-catalog` | Documentación de eventos GA4 |
| `/command-center` | **Analytics Command Center** — 12 módulos enterprise (requiere auth) |
| `/ai-insights` | AI Insights Center (CSV/XLSX upload) |
| `/analytics-os` | Analytics Operating System (premium) |
| `/contact` | Formulario de contacto |

## Quick Start

### 1. Clonar e instalar

```bash
npm install
cp .env.example .env.local
```

### 2. Configurar Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Ejecutar migraciones en SQL Editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_seed_data.sql`
3. Crear bucket `analytics-uploads` en Storage
4. Copiar URL y keys a `.env.local`

### 3. AI Microservice (opcional)

```bash
cd services/ai-analyzer
pip install -r requirements.txt
OPENAI_API_KEY=sk-... uvicorn main:app --reload --port 8000
```

### 4. Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Estructura del proyecto

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API Routes
│   ├── about/
│   ├── analytics-os/
│   ├── ai-insights/
│   ├── contact/
│   ├── event-catalog/
│   ├── pedir/
│   ├── preguntale/
│   └── working-with-me/
├── components/
│   ├── events/
│   ├── hub/
│   ├── layout/
│   └── ui/                 # shadcn/ui
├── lib/
│   ├── constants.ts
│   └── supabase/
└── types/
    └── database.ts

supabase/
└── migrations/             # SQL schema + RLS + seed

services/
└── ai-analyzer/            # Python FastAPI microservice

docs/
└── ARCHITECTURE.md         # Arquitectura completa
```

## Deploy en Vercel

1. Push a GitHub
2. Importar en [vercel.com](https://vercel.com)
3. Configurar variables de entorno desde `.env.example`
4. Deploy automático en cada push a `main`

### AI Service

Desplegar `services/ai-analyzer` en Railway, Fly.io o Cloud Run:

```bash
cd services/ai-analyzer
docker build -t wws-ai .
docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... wws-ai
```

Configurar `AI_SERVICE_URL` en Vercel apuntando al servicio desplegado.

## Modelo de datos

- `profiles` — Perfiles de usuario (extiende auth.users)
- `requests` — Solicitudes de trabajo
- `request_comments` — Comentarios en solicitudes
- `playbooks` — Playbooks de implementación
- `articles` — Knowledge base
- `event_catalog` — Catálogo de eventos GA4
- `analytics_notes` — Notas internas
- `uploaded_files` — Archivos subidos
- `insights` — Resultados de AI analysis
- `meetings` — Reuniones agendadas

Ver `docs/ARCHITECTURE.md` para diagramas y detalles.

## Licencia

Privado — © Sergio Burgos
