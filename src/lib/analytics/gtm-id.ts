import { siteConfig } from '@/lib/constants';

/** ID del contenedor GTM. Ignora env vacío (común en Vercel si la var existe sin valor). */
export function resolveGtmId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  return fromEnv || siteConfig.gtmContainerId;
}

/** ID de medición GA4 (para gtag config send_page_view:false antes de GTM). */
export function resolveGa4Id(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim();
  return fromEnv || siteConfig.ga4MeasurementId || null;
}
