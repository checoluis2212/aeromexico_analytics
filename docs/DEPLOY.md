# Deploy — Working With Sergio

## Supabase (completado vía MCP)

- **Project URL:** `https://sajuzjelsxtbiuprcale.supabase.co`
- **Migraciones aplicadas:** `initial_schema`, `seed_data`, `storage_bucket`
- **Tablas:** profiles, requests, playbooks, articles, event_catalog, insights, etc.
- **Seed data:** 6 playbooks, 5 eventos GA4, 3 artículos

### Crear usuario admin

1. Supabase Dashboard → **Authentication** → **Users** → **Add user**
2. Email + password para Sergio
3. SQL Editor:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'tu-email@dominio.com';
```

4. **Authentication** → **URL Configuration**:
   - Site URL: `https://tu-dominio.vercel.app` (o `http://localhost:3000` en dev)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://tu-dominio.vercel.app/auth/callback`

### Service Role Key

Dashboard → Settings → API → `service_role` → copiar a:
- `.env.local` (local)
- Vercel Environment Variables (producción)

---

## Vercel

### Opción A — CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local   # opcional
vercel --prod
```

### Opción B — GitHub + Dashboard

1. Push repo a GitHub
2. [vercel.com/new](https://vercel.com/new) → Import repository
3. Framework: **Next.js** (auto-detectado)
4. Variables de entorno:

| Variable | Valor |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://sajuzjelsxtbiuprcale.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key del dashboard |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |
| `NEXT_PUBLIC_SITE_URL` | URL de Vercel |

5. Deploy

---

## AI Microservice (opcional)

```bash
cd services/ai-analyzer
# Railway
railway init && railway up

# O Docker en Fly.io / Cloud Run
docker build -t wws-ai . && docker run -p 8000:8000 -e OPENAI_API_KEY=sk-... wws-ai
```

Añadir `AI_SERVICE_URL` en Vercel apuntando al servicio desplegado.

---

## GTM / GA4 — dataLayer del portal

Variables de entorno: `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`.

### Checklist en GTM

1. Tag **GA4 Configuration**:
   - **Desactivar** “Send a page view event when this configuration loads” (page_view solo vía dataLayer del portal).
   - User-ID = variable `{{DLV - user_id}}`.
2. Variable **DLV - user_id** ← Data Layer Variable, clave `user_id`.
3. Tag **GA4 Event — page_view**:
   - Trigger: Custom Event `page_view`.
   - Event parameter `user_id` = `{{DLV - user_id}}`.
   - Mapear `page_title`, `page_location`, `page_path` y dimensiones del portal.
4. Secuencia en dataLayer (portal): `user_context` (con `user_id`) → `page_view` (con `user_id`, `page_title`, `page_location`).
5. Triggers **Custom Event** para el resto (`login`, `generate_lead`, `request_submit`, `assistant_*`, `cc_*`, `nav_click`, etc.).
6. Validar en **GTM Preview** + **GA4 DebugView** (usuario demo con sesión).

Eventos documentados en `event_catalog` (categoría `portal`) — migración `024_portal_analytics_events.sql`.

