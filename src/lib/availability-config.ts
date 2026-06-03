export type SergioCapacity = 'available' | 'limited' | 'full' | 'oof';

/** Orden visual del semáforo (arriba → abajo en UI pública) */
export const CAPACITY_ORDER: readonly SergioCapacity[] = [
  'available',
  'limited',
  'full',
  'oof',
];

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
    label: 'Acepto pedidos nuevos',
    headline: 'Mi cola tiene espacio',
    hint: 'Cuando envíes tu solicitud, la reviso y te confirmo tiempos según la urgencia que elijas.',
    dotClass: 'bg-radar shadow-[0_0_10px_oklch(0.65_0.18_145/0.6)]',
    ringClass: 'border-radar/30 bg-radar/5',
  },
  limited: {
    label: 'Cola con movimiento',
    headline: 'Puedes pedir; iré un poco más lento',
    hint: 'Hay varios pedidos abiertos. Priorizo lo urgente y, al aceptar, te digo cuándo lo atiendo.',
    dotClass: 'bg-signal shadow-[0_0_10px_oklch(0.78_0.16_85/0.6)]',
    ringClass: 'border-signal/30 bg-signal/5',
  },
  full: {
    label: 'Cola al límite',
    headline: 'Envía igual si es urgente',
    hint: 'Reviso cada solicitud y te respondo cuándo puedo empezar. Producción rota → márcalo como urgente.',
    dotClass: 'bg-destructive shadow-[0_0_10px_oklch(0.577_0.245_27.325/0.55)]',
    ringClass: 'border-destructive/30 bg-destructive/5',
  },
  oof: {
    label: 'Fuera de oficina (OOF)',
    headline: 'No estoy disponible para pedidos nuevos',
    hint: 'Usa la nota para decir cuándo vuelvo (ej. "De vuelta el jueves"). Solo emergencias de producción.',
    dotClass: 'bg-muted-foreground shadow-[0_0_8px_oklch(0.55_0_0/0.45)]',
    ringClass: 'border-muted-foreground/35 bg-muted/10',
  },
};

export const DEFAULT_AVAILABILITY: SergioAvailability = {
  capacity: 'available',
  note: null,
  updated_at: new Date().toISOString(),
};
