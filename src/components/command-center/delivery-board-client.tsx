'use client';

import { KanbanBoard, type BoardItem } from '@/components/command-center/kanban-board';
import type { DeliveryStatus } from '@/types/command-center';

interface DeliveryBoardClientProps {
  initialItems: BoardItem[];
}

export function DeliveryBoardClient({ initialItems }: DeliveryBoardClientProps) {
  async function handleStatusChange(id: string, status: DeliveryStatus) {
    try {
      await fetch(`/api/command-center/board/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ delivery_status: status }),
      });
    } catch {
      // Optimistic UI — board keeps local state on network failure
    }
  }

  return <KanbanBoard initialItems={initialItems} onStatusChange={handleStatusChange} />;
}
