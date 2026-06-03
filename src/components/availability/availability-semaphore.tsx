import { CAPACITY_CONFIG, CAPACITY_ORDER } from '@/lib/availability-config';
import type { SergioAvailability } from '@/lib/availability-config';
import { cn } from '@/lib/utils';

const ORDER = CAPACITY_ORDER;

type Props = {
  availability: SergioAvailability;
  className?: string;
  compact?: boolean;
  bare?: boolean;
};

export function AvailabilitySemaphore({ availability, className, compact, bare }: Props) {
  const config = CAPACITY_CONFIG[availability.capacity];

  return (
    <div
      className={cn(
        !bare && 'inline-flex items-start gap-3 rounded-xl border px-4 py-3 text-left',
        !bare && config.ringClass,
        bare && 'flex items-start gap-3 text-left w-full',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label={`Capacidad de Sergio para pedidos: ${config.label}`}
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
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
          Capacidad · nuevos pedidos
        </p>
        <p className="mt-1 text-xs font-semibold text-foreground">{config.label}</p>
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
