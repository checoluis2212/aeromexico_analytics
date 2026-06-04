import { siteConfig } from '@/lib/constants';

/** ID del contenedor GTM. Ignora env vacío (común en Vercel si la var existe sin valor). */
export function resolveGtmId(): string {
  const fromEnv = process.env.NEXT_PUBLIC_GTM_ID?.trim();
  return fromEnv || siteConfig.gtmContainerId;
}
