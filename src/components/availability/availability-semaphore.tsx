import { CAPACITY_CONFIG } from '@/lib/availability-config';
import type { SergioAvailability } from '@/lib/availability-config';
import { cn } from '@/lib/utils';

const ORDER = ['available', 'limited', 'full'] as const;

type Props = {
  availability: SergioAvailability;
  className?: string;
  compact?: boolean;
};

export function AvailabilitySemaphore({ availability, className, compact }: Props) {
  const config = CAPACITY_CONFIG[availability.capacity];

  return (
    <div
      className={cn(
        'inline-flex items-start gap-3 rounded-xl border px-4 py-3 text-left',
        config.ringClass,
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Estado de Sergio: ${config.label}`}
    >
      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0" aria-hidden>
        {ORDER.map((key) => (
          <span
            key={key}
            className={cn(
              'h-2.5 w-2.5 rounded-full transition-all',
              key === availability.capacity
                ? CAPACITY_CONFIG[key].dotClass
                : 'bg-muted-foreground/15'
            )}
          />
        ))}
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-wide text-foreground/90">
          {config.label}
        </p>
        {!compact && (
          <>
            <p className="mt-0.5 text-sm font-medium text-foreground">{config.headline}</p>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {availability.note?.trim() || config.hint}
            </p>
          </>
        )}
        {compact && (
          <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">
            {availability.note?.trim() || config.headline}
          </p>
        )}
      </div>
    </div>
  );
}
