/**
 * Separación estricta entre el AI Agent del portal cliente y el Admin Agent del Command Center.
 * No comparten historial, borradores, ni endpoints.
 */

export const CLIENT_AGENT_CHAT_PATH = '/api/tracking-assistant/chat';
export const ADMIN_AGENT_CHAT_PATH = '/api/command-center/admin-agent/chat';

/** Campos solo del flujo cliente — rechazados en Admin Agent */
export const CLIENT_AGENT_BODY_KEYS = [
  'assistantMode',
  'guidedOrder',
  'draft',
  'scenarioId',
  'requestId',
  'action',
] as const;

/** Campos solo del Admin Agent — rechazados en AI Agent cliente */
export const ADMIN_AGENT_BODY_KEYS = [
  'pending_action',
  'tool_used',
] as const;

const CLIENT_CHAT_ACTIONS = new Set([
  'start_request',
  'confirm_request',
  'cancel_request',
]);

const ADMIN_CHAT_ACTIONS = new Set(['confirm_action', 'cancel_action']);

export type AgentScopeViolation = {
  field: string;
  message: string;
};

export function validateClientAgentChatBody(
  body: Record<string, unknown>
): AgentScopeViolation | null {
  for (const key of ADMIN_AGENT_BODY_KEYS) {
    if (body[key] !== undefined && body[key] !== null) {
      return {
        field: key,
        message: 'Este endpoint es solo para el AI Agent del portal cliente.',
      };
    }
  }

  const action = body.action;
  if (typeof action === 'string' && ADMIN_CHAT_ACTIONS.has(action)) {
    return {
      field: 'action',
      message: 'Acción de Admin Agent no válida en el chat del portal.',
    };
  }

  return null;
}

export function validateAdminAgentChatBody(
  body: Record<string, unknown>
): AgentScopeViolation | null {
  for (const key of CLIENT_AGENT_BODY_KEYS) {
    if (key === 'action') continue;
    if (body[key] !== undefined && body[key] !== null) {
      return {
        field: key,
        message: 'Este endpoint es solo para Admin Agent (Command Center).',
      };
    }
  }

  const action = body.action;
  if (typeof action === 'string' && CLIENT_CHAT_ACTIONS.has(action)) {
    return {
      field: 'action',
      message: 'Acción del AI Agent cliente no válida en Admin Agent.',
    };
  }

  if (
    body.module !== undefined ||
    body.assistantMode !== undefined ||
    body.guidedOrder !== undefined
  ) {
    return {
      field: 'module',
      message: 'No uses parámetros del chat cliente en Admin Agent.',
    };
  }

  return null;
}

/** Rutas del portal cliente que el Admin Agent no debe tratar como operables. */
export const CLIENT_PORTAL_PATH_PREFIXES = [
  '/ai-agent',
  '/preguntale',
  '/pedir',
  '/mis-pedidos',
  '/hub',
] as const;

export function isClientPortalPath(href: string): boolean {
  return CLIENT_PORTAL_PATH_PREFIXES.some(
    (p) => href === p || href.startsWith(`${p}/`)
  );
}

/** Query para que Sergio abra el AI Agent del portal a propósito (vista previa). */
export const CLIENT_PORTAL_PREVIEW_PARAM = 'vista';
export const CLIENT_PORTAL_PREVIEW_VALUE = 'cliente';

export function isClientPortalPreview(
  searchParams: Record<string, string | undefined> | URLSearchParams
): boolean {
  const value =
    searchParams instanceof URLSearchParams
      ? searchParams.get(CLIENT_PORTAL_PREVIEW_PARAM)
      : searchParams[CLIENT_PORTAL_PREVIEW_PARAM];
  return value === CLIENT_PORTAL_PREVIEW_VALUE;
}

export const ADMIN_AGENT_PATH = '/command-center/agent';

/** Sergio sin vista previa → Admin Agent (no mezclar chat cliente por defecto). */
export function shouldRedirectSergioFromClientAgent(
  isSergioAdmin: boolean,
  searchParams: Record<string, string | undefined>
): boolean {
  if (!isSergioAdmin) return false;
  return !isClientPortalPreview(searchParams);
}
