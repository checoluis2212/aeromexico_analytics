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

## GTM / GA4 — SPA Next.js (page_view manual)

Variables de entorno: `NEXT_PUBLIC_GTM_ID`, `NEXT_PUBLIC_GA4_MEASUREMENT_ID`.

### Flujo en dataLayer (código)

```
push global: user_id, app_role, auth_state
       ↓
user_context (event)
       ↓
page_view manual (un push por ruta + usuario)
       ↓
GA4 Event tag (trigger: Custom Event page_view)
```

### Checklist GTM (obligatorio)

1. **GA4 Configuration**
   - Desactivar: *Send a page view event when this configuration loads*.
   - User-ID = `{{DLV - user_id}}`.
   - No usar trigger *History Change* para page_view.

2. **Variables DLV**
   - `user_id`, `app_role`, `auth_state`, `page_path`, `portal_section`, `page_title`, `page_location`.

3. **GA4 Event — page_view**
   - Trigger: Custom Event = `page_view`.
   - Parámetros: `user_id`, `page_title`, `page_location`, `page_path`, `portal_section`, `auth_state`, `app_role`.

4. Triggers **Custom Event** para el resto (`login`, `generate_lead`, `request_submit`, `assistant_*`, `nav_click`, etc.).

5. **Publicar** contenedor y validar en Preview + GA4 DebugView.

### Validación en GTM Preview

- [ ] `user_context` incluye `user_id` (UUID, nunca email).
- [ ] Tras `user_context`, variables DLV muestran `user_id`.
- [ ] Un solo `page_view` por navegación, con `user_id`.
- [ ] Tag GA4 Event se activa en `page_view`.
- [ ] No hay `cc_page_view`.
- [ ] No hay page_view automático antes de `user_context`.

### Código relevante

| Archivo | Rol |
|---------|-----|
| `src/lib/analytics/data-layer.ts` | `user_context`, `page_view`, dedupe |
| `src/components/analytics/analytics-provider.tsx` | Auth → `user_context` → `authReady` |
| `src/components/analytics/portal-page-tracker.tsx` | `page_view` tras `authReady` |
| `src/components/analytics/google-tag-manager.tsx` | Carga GTM |
| `src/app/layout.tsx` | GTM + gtag `send_page_view: false` |

Eventos documentados en `event_catalog` (categoría `portal`) — migración `024_portal_analytics_events.sql`.

