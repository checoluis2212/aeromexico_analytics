# Working With Sergio

Portal de consultoría en analytics (AeroMéxico): portal cliente, Command Center de Sergio, agentes IA y orquestador BigQuery.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, TailwindCSS, shadcn/ui |
| Backend | Supabase (PostgreSQL, Auth, Storage, RLS) |
| Analytics | GA4, GTM, BigQuery, Looker Studio |
| AI | OpenAI (chat en app) + Python FastAPI (`services/ai-analyzer`) |
| Deploy | Vercel (frontend) + Railway/Fly.io (AI service, opcional) |

## Portal cliente (`src/app/(site)`)

| Ruta | Descripción |
|------|------------|
| `/` | Inicio |
| `/ai-agent` | AI Agent — consultor con contexto de pedidos del usuario |
| `/pedir` | Nuevo pedido con asistente IA |
| `/preguntale` | Consultor de medición (tracking assistant) |
| `/mis-pedidos` | Bandeja de pedidos |
| `/mis-pedidos/archivo` | Entregas Looker / videos GTM |
| `/perfil` | Perfil y notificaciones |
| `/faq`, `/glosario` | Ayuda |
| `/about`, `/working-with-me`, `/event-catalog`, `/analytics-os`, `/ai-insights` | Contenido y herramientas |
| `/login`, `/recuperar` | Auth |

## Command Center (Sergio, requiere `sergio_admin`)

| Ruta | Descripción |
|------|------------|
| `/command-center` | Mi panel |
| `/command-center/agent` | Admin Agent — bandeja global, semáforo, BigQuery |
| `/command-center/pedidos` | Pedidos |
| `/command-center/board` | Tablero Kanban |
| `/command-center/looker-dashboards`, `/gtm-videos` | Biblioteca de entregas |
| `/command-center/events`, `/usuarios`, `/integraciones` | Eventos, usuarios, integraciones |
| `/command-center/admin` | Datos IA / skills orquestador |

## Quick Start

```bash
git clone https://github.com/checoluis2212/aeromexico_analytics.git
cd aeromexico_analytics
npm install
cp .env.example .env.local
```

### Supabase

1. Crear proyecto en [supabase.com](https://supabase.com)
2. Aplicar migraciones en orden (`supabase/migrations/001` … `022`) con CLI o SQL Editor
3. Variables en `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Desarrollo

```bash
npm run dev
# o reinicio limpio:
npm run dev:reset
```

Abre [http://localhost:3000](http://localhost:3000)

### AI Microservice (opcional)

```bash
cd services/ai-analyzer
pip install -r requirements.txt
OPENAI_API_KEY=sk-... uvicorn main:app --reload --port 8000
```

Configura `AI_SERVICE_URL` en Vercel si despliegas el servicio aparte.

## Estructura

```
src/app/(site)/          # Portal cliente
src/app/command-center/  # Panel Sergio
src/app/api/             # APIs (pedidos, admin-agent, tracking-assistant, …)
src/lib/ai/              # Prompts, agentes, orquestador BQ
supabase/migrations/     # Schema 001–022
services/ai-analyzer/    # FastAPI
```

## Deploy en Vercel

1. Importar [checoluis2212/aeromexico_analytics](https://github.com/checoluis2212/aeromexico_analytics)
2. Rama `main`, variables desde `.env.example`
3. Cada push a `main` dispara deploy

**No subir:** `.env.local` (credenciales). Configurarlas solo en Vercel / Supabase.

## Licencia

Privado — © Sergio Burgos
