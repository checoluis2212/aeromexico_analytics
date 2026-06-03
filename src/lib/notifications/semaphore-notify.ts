import {
  getNotificationWebhookUrls,
  isTeamsWebhook,
} from '@/lib/notifications/channels';
import {
  CAPACITY_CONFIG,
  type SergioAvailability,
  type SergioCapacity,
} from '@/lib/availability-config';

export type SemaphoreChangeInput = {
  previous: SergioAvailability;
  next: SergioAvailability;
  changedByEmail?: string | null;
  changedByName?: string | null;
};

function labelFor(capacity: SergioCapacity): string {
  return CAPACITY_CONFIG[capacity].label;
}

function headlineFor(capacity: SergioCapacity, note: string | null): string {
  return note?.trim() || CAPACITY_CONFIG[capacity].headline;
}

export function describeSemaphoreChange(input: SemaphoreChangeInput): {
  title: string;
  message: string;
  facts: Record<string, string>;
} {
  const { previous, next } = input;
  const capacityChanged = previous.capacity !== next.capacity;
  const noteChanged = (previous.note ?? '').trim() !== (next.note ?? '').trim();

  const fromLabel = labelFor(previous.capacity);
  const toLabel = labelFor(next.capacity);

  let title = 'Semáforo de Sergio actualizado';
  if (capacityChanged && !noteChanged) {
    title = `Semáforo: ${fromLabel} → ${toLabel}`;
  } else if (!capacityChanged && noteChanged) {
    title = `Semáforo (${toLabel}): nota actualizada`;
  } else if (capacityChanged && noteChanged) {
    title = `Semáforo: ${fromLabel} → ${toLabel} + nota`;
  }

  const lines: string[] = [];

  if (capacityChanged) {
    lines.push(
      `Estado: *${fromLabel}* → *${toLabel}* (${CAPACITY_CONFIG[next.capacity].headline})`
    );
  } else {
    lines.push(`Estado actual: *${toLabel}* (sin cambio de color).`);
  }

  if (noteChanged) {
    const prevNote = previous.note?.trim();
    const nextNote = next.note?.trim();
    if (prevNote && nextNote) {
      lines.push(`Nota anterior: «${prevNote}»`);
      lines.push(`Nota nueva: «${nextNote}»`);
    } else if (nextNote) {
      lines.push(`Nota nueva: «${nextNote}»`);
    } else if (prevNote) {
      lines.push(`Se quitó la nota (antes: «${prevNote}»).`);
    }
  } else if (next.note?.trim()) {
    lines.push(`Nota visible: «${next.note.trim()}»`);
  }

  const who =
    input.changedByName?.trim() ||
    input.changedByEmail?.trim() ||
    'Panel Sergio';
  lines.push(`Actualizado por: ${who}`);

  const facts: Record<string, string> = {
    Estado: toLabel,
    'Mensaje público': headlineFor(next.capacity, next.note),
  };
  if (capacityChanged) {
    facts['Antes'] = fromLabel;
  }
  if (noteChanged && next.note?.trim()) {
    facts['Nota'] = next.note.trim();
  }

  return {
    title,
    message: lines.join('\n'),
    facts,
  };
}

export function semaphoreChanged(input: SemaphoreChangeInput): boolean {
  const { previous, next } = input;
  return (
    previous.capacity !== next.capacity ||
    (previous.note ?? '').trim() !== (next.note ?? '').trim()
  );
}

/** Avisa en Slack/Teams (webhooks globales .env) cuando cambia el semáforo */
export async function notifySemaphoreChange(input: SemaphoreChangeInput): Promise<void> {
  if (!semaphoreChanged(input)) return;

  const urls = getNotificationWebhookUrls();
  if (urls.length === 0) return;

  const { title, message, facts } = describeSemaphoreChange(input);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const adminLink = `${base}/command-center/admin`;
  const publicLink = `${base}/working-with-me`;

  await Promise.all(
    urls.map(async (url) => {
      const body = isTeamsWebhook(url)
        ? {
            '@type': 'MessageCard',
            '@context': 'https://schema.org/extensions',
            summary: title,
            themeColor:
              input.next.capacity === 'available'
                ? '107C10'
                : input.next.capacity === 'limited'
                  ? 'FF8C00'
                  : input.next.capacity === 'oof'
                    ? '6B7280'
                    : 'C50F1F',
            title,
            sections: [
              {
                text: message.replace(/\*/g, ''),
                facts: Object.entries(facts).map(([name, value]) => ({ name, value })),
              },
            ],
            potentialAction: [
              {
                '@type': 'OpenUri',
                name: 'Panel Sergio',
                targets: [{ os: 'default', uri: adminLink }],
              },
              {
                '@type': 'OpenUri',
                name: 'Ver en sitio',
                targets: [{ os: 'default', uri: publicLink }],
              },
            ],
          }
        : {
            text: `*${title}*\n${message}\n<${adminLink}|Panel Sergio> · <${publicLink}|Cómo trabajo>`,
          };

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) {
          console.error(`Semaphore webhook responded ${res.status}`);
        }
      } catch (err) {
        console.error('Semaphore notification failed:', err);
      }
    })
  );
}
