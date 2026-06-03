/** Formato compacto para el contexto del modelo (sin SQL). */

export function formatRowsForModel(
  label: string,
  rows: Record<string, unknown>[],
  opts?: { maxRows?: number }
): string {
  const max = opts?.maxRows ?? 50;
  const slice = rows.slice(0, max);
  if (slice.length === 0) {
    return `[${label}] Sin filas en el periodo consultado.`;
  }
  const lines = slice.map((row) => {
    const parts = Object.entries(row).map(([k, v]) => {
      const val =
        v === null || v === undefined
          ? '—'
          : typeof v === 'object' && v !== null && 'value' in (v as object)
            ? String((v as { value: unknown }).value)
            : String(v);
      return `${k}=${val}`;
    });
    return parts.join(' | ');
  });
  const more = rows.length > max ? `\n… (${rows.length - max} filas omitidas)` : '';
  return `[${label}] ${slice.length} fila(s):\n${lines.join('\n')}${more}`;
}
