import type { MyRequestRow } from '@/components/my-requests/request-card';
import { mapDeliveryStatusForUser } from '@/lib/integrations/external-sync';
import { priorityLabels, requestTypeLabels } from '@/lib/constants';
import { format } from 'date-fns';

function escapeCsv(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportRequestsCsv(requests: MyRequestRow[], filename = 'pedidos.csv') {
  const headers = [
    'ID',
    'Título',
    'Solicitante',
    'Email',
    'Área',
    'Tipo',
    'Prioridad',
    'Estado',
    'Creado',
  ];

  const rows = requests.map((r) => [
    r.id,
    r.title,
    r.requester_name ?? '',
    r.requester_email ?? '',
    r.company ?? '',
    requestTypeLabels[r.type] ?? r.type,
    priorityLabels[r.priority] ?? r.priority,
    mapDeliveryStatusForUser(r.delivery_status ?? r.status),
    format(new Date(r.created_at), 'yyyy-MM-dd HH:mm'),
  ]);

  const csv = [headers, ...rows].map((row) => row.map((c) => escapeCsv(String(c))).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
