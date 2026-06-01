import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requestStatusLabels, requestTypeLabels, priorityLabels } from '@/lib/constants';
import type { Request } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface RequestTableProps {
  requests: Request[];
  compact?: boolean;
}

export function RequestTable({ requests, compact }: RequestTableProps) {
  if (requests.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No hay requerimientos.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Título</TableHead>
            <TableHead className="text-xs">Tipo</TableHead>
            <TableHead className="text-xs">Prioridad</TableHead>
            {!compact && <TableHead className="text-xs">Estado</TableHead>}
            <TableHead className="text-xs">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((req) => (
            <TableRow key={req.id}>
              <TableCell className="text-sm font-medium max-w-[200px] truncate">{req.title}</TableCell>
              <TableCell className="text-xs">{requestTypeLabels[req.type] ?? req.type}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-[10px]">{priorityLabels[req.priority]}</Badge>
              </TableCell>
              {!compact && (
                <TableCell className="text-xs">{requestStatusLabels[req.status]}</TableCell>
              )}
              <TableCell className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: es })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
