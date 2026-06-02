'use client';

import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Badge } from '@/components/ui/badge';
import { DELIVERY_STATUSES, type DeliveryStatus } from '@/types/command-center';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

export interface BoardItem {
  id: string;
  title: string;
  type: string;
  priority: string;
  storyPoints?: number;
  assignee?: string;
  status: DeliveryStatus;
}

function SortableCard({ item }: { item: BoardItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'rounded-lg border border-border/60 bg-card/80 p-3 cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-50 ring-2 ring-primary/30'
      )}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium line-clamp-2">{item.title}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
            {item.storyPoints && (
              <Badge variant="outline" className="text-[10px]">{item.storyPoints} pts</Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DroppableColumn({
  status,
  label,
  color,
  count,
  children,
}: {
  status: DeliveryStatus;
  label: string;
  color: string;
  count: number;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex-shrink-0 w-72 rounded-xl border border-border/60 bg-card/20 transition-colors',
        isOver && 'border-primary/50 bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-border/40">
        <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-md', color)}>
          {label}
        </span>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      {children}
    </div>
  );
}

interface KanbanBoardProps {
  initialItems: BoardItem[];
  onStatusChange?: (id: string, status: DeliveryStatus) => void | Promise<void>;
}

export function KanbanBoard({ initialItems, onStatusChange }: KanbanBoardProps) {
  const [items, setItems] = useState(initialItems);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function resolveStatus(overId: string): DeliveryStatus | null {
    if (DELIVERY_STATUSES.some((s) => s.value === overId)) {
      return overId as DeliveryStatus;
    }
    const overItem = items.find((i) => i.id === overId);
    return overItem?.status ?? null;
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const newStatus = resolveStatus(over.id as string);
    const itemId = active.id as string;
    const current = items.find((i) => i.id === itemId);

    if (!newStatus || !current || current.status === newStatus) return;

    const previousStatus = current.status;

    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
    );

    try {
      await onStatusChange?.(itemId, newStatus);
    } catch {
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, status: previousStatus } : item))
      );
    }
  }

  const activeItem = items.find((i) => i.id === activeId);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[500px]">
        {DELIVERY_STATUSES.map((col) => {
          const colItems = items.filter((i) => i.status === col.value);
          return (
            <DroppableColumn
              key={col.value}
              status={col.value}
              label={col.label}
              color={col.color}
              count={colItems.length}
            >
              <SortableContext items={colItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="p-2 space-y-2 min-h-[160px]">
                  {colItems.map((item) => (
                    <SortableCard key={item.id} item={item} />
                  ))}
                </div>
              </SortableContext>
            </DroppableColumn>
          );
        })}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rounded-lg border border-primary/40 bg-card p-3 shadow-xl w-72 opacity-90">
            <p className="text-sm font-medium">{activeItem.title}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
