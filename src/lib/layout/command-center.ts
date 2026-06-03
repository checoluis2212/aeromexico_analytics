import { portalChatPanelClass, portalContentClass } from '@/lib/layout/portal';

/** Mismo ancho y padding que el portal cliente (max-w-6xl). */
export const commandCenterContentClass = portalContentClass;

/** Panel Agente IA — altura en viewport del Command Center (sidebar + top bars). */
export const commandCenterChatPanelClass =
  'flex-1 min-h-[480px] h-[min(780px,calc(100vh-10.5rem))]';
