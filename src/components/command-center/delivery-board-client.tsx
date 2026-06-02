'use client';

import { KanbanBoard, type BoardItem } from '@/components/command-center/kanban-board';
import type { DeliveryStatus } from '@/types/command-center';
import { toast } from 'sonner';

interface DeliveryBoardClientProps {
  initialItems: BoardItem[];
}

export function DeliveryBoardClient({ initialItems }: DeliveryBoardClientProps) {
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

  return <KanbanBoard initialItems={initialItems} onStatusChange={handleStatusChange} />;
}
