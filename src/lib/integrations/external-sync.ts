import { createAdminClient } from '@/lib/supabase/admin';
import type { DeliveryStatus } from '@/types/command-center';

export type ExternalProvider = 'trello' | 'jira';

export interface RequestForSync {
  id: string;
  title: string;
  description: string;
  requester_name: string;
  requester_email: string;
  company?: string | null;
  priority: string;
  type: string;
}

export interface ExternalRef {
  provider: ExternalProvider;
  id: string;
  url: string;
  status?: string;
}

const TRELLO_LIST_TO_STATUS: Record<string, DeliveryStatus> = {};

function loadTrelloListMap() {
  const raw = process.env.TRELLO_LIST_STATUS_MAP;
  if (!raw) return;
  try {
    Object.assign(TRELLO_LIST_TO_STATUS, JSON.parse(raw));
  } catch {
    console.warn('Invalid TRELLO_LIST_STATUS_MAP JSON');
  }
}

loadTrelloListMap();

async function createTrelloCard(req: RequestForSync): Promise<ExternalRef | null> {
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  const listId = process.env.TRELLO_LIST_ID;
  if (!key || !token || !listId) return null;

  const desc = [
    `**Solicitante:** ${req.requester_name} (${req.requester_email})`,
    `**Área:** ${req.company ?? '—'}`,
    `**Tipo:** ${req.type}`,
    `**Prioridad:** ${req.priority}`,
    '',
    req.description,
    '',
    `ID interno: ${req.id}`,
  ].join('\n');

  const url = new URL('https://api.trello.com/1/cards');
  url.searchParams.set('key', key);
  url.searchParams.set('token', token);
  url.searchParams.set('idList', listId);
  url.searchParams.set('name', req.title);
  url.searchParams.set('desc', desc);

  const res = await fetch(url.toString(), { method: 'POST' });
  if (!res.ok) {
    console.error('Trello create failed:', await res.text());
    return null;
  }

  const card = await res.json();
  return {
    provider: 'trello',
    id: card.id,
    url: card.shortUrl ?? card.url,
    status: 'backlog',
  };
}

async function createJiraIssue(req: RequestForSync): Promise<ExternalRef | null> {
  const base = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const token = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;
  if (!base || !email || !token || !projectKey) return null;

  const auth = Buffer.from(`${email}:${token}`).toString('base64');
  const res = await fetch(`${base.replace(/\/$/, '')}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      fields: {
        project: { key: projectKey },
        summary: req.title,
        description: {
          type: 'doc',
          version: 1,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: req.description }],
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: `Solicitante: ${req.requester_name} · ${req.requester_email} · ${req.company ?? ''}`,
                },
              ],
            },
          ],
        },
        issuetype: { name: process.env.JIRA_ISSUE_TYPE ?? 'Task' },
      },
    }),
  });

  if (!res.ok) {
    console.error('Jira create failed:', await res.text());
    return null;
  }

  const issue = await res.json();
  return {
    provider: 'jira',
    id: issue.key,
    url: `${base.replace(/\/$/, '')}/browse/${issue.key}`,
    status: 'backlog',
  };
}

export async function pushRequestToExternal(req: RequestForSync): Promise<ExternalRef | null> {
  const provider = (process.env.INTEGRATION_PROVIDER ?? 'none').toLowerCase();

  if (provider === 'trello') return createTrelloCard(req);
  if (provider === 'jira') return createJiraIssue(req);
  if (provider === 'both') {
    return (await createTrelloCard(req)) ?? (await createJiraIssue(req));
  }
  return null;
}

export async function saveExternalRef(requestId: string, ref: ExternalRef) {
  const supabase = createAdminClient();
  await supabase
    .from('requests')
    .update({
      external_provider: ref.provider,
      external_id: ref.id,
      external_url: ref.url,
      external_status: ref.status ?? null,
    })
    .eq('id', requestId);
}

export async function syncFromTrelloCard(cardId: string): Promise<boolean> {
  const key = process.env.TRELLO_API_KEY;
  const token = process.env.TRELLO_TOKEN;
  if (!key || !token) return false;

  const url = new URL(`https://api.trello.com/1/cards/${cardId}`);
  url.searchParams.set('key', key);
  url.searchParams.set('token', token);
  url.searchParams.set('fields', 'idList,name,url,shortUrl');

  const res = await fetch(url.toString());
  if (!res.ok) return false;

  const card = await res.json();
  const listId = card.idList as string;
  const deliveryStatus = TRELLO_LIST_TO_STATUS[listId];

  const supabase = createAdminClient();
  const update: Record<string, string> = {
    external_status: listId,
    updated_at: new Date().toISOString(),
  };
  if (deliveryStatus) {
    update.delivery_status = deliveryStatus;
  }

  const { error } = await supabase
    .from('requests')
    .update(update)
    .eq('external_provider', 'trello')
    .eq('external_id', cardId);

  return !error;
}

export function mapDeliveryStatusForUser(status: string | null): string {
  const labels: Record<string, string> = {
    backlog: 'Recibido',
    discovery: 'Entendiendo tu pedido',
    requirements: 'Definiendo alcance',
    ready_for_development: 'Listo para empezar',
    development: 'En progreso',
    analytics_qa: 'Revisando',
    ready_for_release: 'Casi listo',
    done: 'Completado',
    blocked: 'En pausa',
    submitted: 'Recibido',
    in_review: 'En revisión',
    in_progress: 'En progreso',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };
  return labels[status ?? ''] ?? status ?? 'Recibido';
}
