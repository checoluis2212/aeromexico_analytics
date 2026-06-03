'use client';

import { useMemo, useState } from 'react';
import { KanbanBoard, type BoardItem } from '@/components/command-center/kanban-board';
import type { DeliveryStatus } from '@/types/command-center';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface DeliveryBoardClientProps {
  initialItems: BoardItem[];
  readOnly?: boolean;
  areas?: string[];
}

export function DeliveryBoardClient({
  initialItems,
  readOnly = false,
  areas = [],
}: DeliveryBoardClientProps) {
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const filteredItems = useMemo(() => {
    if (areaFilter === 'all') return initialItems;
    return initialItems.filter((i) => i.company === areaFilter);
  }, [initialItems, areaFilter]);

  async function handleStatusChange(id: string, status: DeliveryStatus) {
    const res = await fetch(`/api/command-center/board/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delivery_status: status }),
    });

    if (!res.ok) {
      toast.error('No se pudo guardar el movimiento.');
      throw new Error('Failed to update status');
    }
  }

  return (
    <div className="space-y-4">
      {readOnly && areas.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-xs text-muted-foreground">Filtrar por área</p>
          <Select value={areaFilter} onValueChange={(v) => setAreaFilter(v ?? 'all')}>
            <SelectTrigger className="h-8 w-48 text-xs">
              <SelectValue placeholder="Todas las áreas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {areas.map((area) => (
                <SelectItem key={area} value={area}>
                  {area}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {readOnly && (
            <span className="text-[11px] text-muted-foreground">Solo lectura</span>
          )}
        </div>
      )}
      <KanbanBoard
        initialItems={filteredItems}
        readOnly={readOnly}
        onStatusChange={readOnly ? undefined : handleStatusChange}
      />
    </div>
  );
}
