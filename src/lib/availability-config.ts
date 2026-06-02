export type SergioCapacity = 'available' | 'limited' | 'full';

export type SergioAvailability = {
  capacity: SergioCapacity;
  note: string | null;
  updated_at: string;
};

export const CAPACITY_CONFIG: Record<
  SergioCapacity,
  { label: string; headline: string; hint: string; dotClass: string; ringClass: string }
> = {
  available: {
    label: 'Disponible',
    headline: 'Puedes pedir con normalidad',
    hint: 'Respondo según los tiempos habituales del SLA.',
    dotClass: 'bg-radar shadow-[0_0_10px_oklch(0.65_0.18_145/0.6)]',
    ringClass: 'border-radar/30 bg-radar/5',
  },
  limited: {
    label: 'Capacidad limitada',
    headline: 'Puedes pedir, pero iré más lento',
    hint: 'Tengo varios pedidos abiertos — priorizo urgencias y te aviso la fecha real.',
    dotClass: 'bg-signal shadow-[0_0_10px_oklch(0.78_0.16_85/0.6)]',
    ringClass: 'border-signal/30 bg-signal/5',
  },
  full: {
    label: 'Capacidad llena',
    headline: 'Ahora mismo estoy full',
    hint: 'Puedes enviar el pedido igual — lo encolo y te digo cuándo lo tomo. Solo P0 si es producción rota.',
    dotClass: 'bg-destructive shadow-[0_0_10px_oklch(0.577_0.245_27.325/0.55)]',
    ringClass: 'border-destructive/30 bg-destructive/5',
  },
};

export const DEFAULT_AVAILABILITY: SergioAvailability = {
  capacity: 'available',
  note: null,
  updated_at: new Date().toISOString(),
};
