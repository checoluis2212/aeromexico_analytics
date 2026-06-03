export type AssistantMode = 'consultor' | 'solicitud';

export const DEFAULT_ASSISTANT_MODE: AssistantMode = 'solicitud';

export const ASSISTANT_MODE_LABELS: Record<AssistantMode, { label: string; hint: string }> = {
  consultor: {
    label: 'Consultor',
    hint: 'Insights de negocio con datos del almacén',
  },
  solicitud: {
    label: 'Solicitud',
    hint: 'Formulario para pedir trabajo a Sergio',
  },
};

export function parseAssistantMode(value: string | null | undefined): AssistantMode {
  if (value === 'consultor') return 'consultor';
  if (value === 'solicitud') return 'solicitud';
  return DEFAULT_ASSISTANT_MODE;
}

type PreguntaleLinkOpts = {
  pedido?: string;
  escenario?: string;
  mode?: AssistantMode;
  empezar?: boolean;
};

/** Hub de intención — entrada principal del menú */
export function pedirHubHref(): string {
  return '/pedir';
}

/** Formulario de solicitud (sin chat IA) */
export function solicitudFormHref(opts?: { escenario?: string; empezar?: boolean }): string {
  const params = new URLSearchParams();
  if (opts?.escenario) params.set('escenario', opts.escenario);
  if (opts?.empezar) params.set('empezar', '1');
  const qs = params.toString();
  return qs ? `/preguntale?${qs}` : '/preguntale';
}

/** AI Agent — insights y consultor de datos */
export function aiAgentHref(opts?: { pedido?: string; escenario?: string }): string {
  const params = new URLSearchParams();
  if (opts?.pedido) params.set('pedido', opts.pedido);
  if (opts?.escenario) params.set('escenario', opts.escenario);
  const qs = params.toString();
  return qs ? `/ai-agent?${qs}` : '/ai-agent';
}

/**
 * AI Agent del portal con vista previa explícita (Sergio desde Command Center).
 * Sin este parámetro, Sergio es redirigido al Admin Agent.
 */
export function aiAgentClientPreviewHref(opts?: {
  pedido?: string;
  escenario?: string;
}): string {
  const params = new URLSearchParams();
  params.set('vista', 'cliente');
  if (opts?.pedido) params.set('pedido', opts.pedido);
  if (opts?.escenario) params.set('escenario', opts.escenario);
  return `/ai-agent?${params.toString()}`;
}

export function pedirLoginRedirect(): string {
  return `/login?redirect=${encodeURIComponent(pedirHubHref())}`;
}

/** @deprecated Usar solicitudFormHref o aiAgentHref */
export function preguntaleHref(opts: PreguntaleLinkOpts = {}): string {
  if (opts.pedido || opts.mode === 'consultor' || opts.escenario) {
    return aiAgentHref({ pedido: opts.pedido, escenario: opts.escenario });
  }
  return solicitudFormHref({ escenario: opts.escenario, empezar: opts.empezar });
}

export function preguntaleLoginRedirect(opts: PreguntaleLinkOpts = {}): string {
  return `/login?redirect=${encodeURIComponent(preguntaleHref(opts))}`;
}

export function aiAgentLoginRedirect(opts?: { pedido?: string }): string {
  return `/login?redirect=${encodeURIComponent(aiAgentHref(opts))}`;
}

export function assistantModeToApiModule(mode: AssistantMode, guidedOrder: boolean): string {
  if (guidedOrder) return 'guided_request';
  return mode === 'consultor' ? 'consultor_analytics' : 'tracking_assistant';
}
