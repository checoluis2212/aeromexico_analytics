import { createClient } from '@/lib/supabase/server';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { DeliveryBoardClient } from '@/components/command-center/delivery-board-client';
import type { BoardItem } from '@/components/command-center/kanban-board';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { DeliveryStatus } from '@/types/command-center';

export const metadata = { title: 'Delivery Board' };

const FALLBACK_ITEMS: BoardItem[] = [
  { id: '1', title: 'Dashboard ROAS por campaña', type: 'dashboard', priority: 'p1_high', storyPoints: 8, status: 'development' },
  { id: '2', title: 'Evento add_to_cart — app móvil', type: 'event', priority: 'p1_high', storyPoints: 5, status: 'analytics_qa' },
  { id: '3', title: 'Funnel checkout — abandono paso 3', type: 'funnel', priority: 'p2_medium', storyPoints: 13, status: 'requirements' },
  { id: '4', title: 'BigQuery mart — customer LTV', type: 'bigquery', priority: 'p2_medium', storyPoints: 21, status: 'discovery' },
  { id: '5', title: 'QA post-deploy GTM v2.4', type: 'qa_analytics', priority: 'p0_critical', storyPoints: 3, status: 'ready_for_release' },
  { id: '6', title: 'Tracking UTM — landing pages', type: 'tracking', priority: 'p2_medium', storyPoints: 5, status: 'backlog' },
  { id: '7', title: 'GTM — Consent Mode v2', type: 'gtm_implementation', priority: 'p1_high', storyPoints: 8, status: 'blocked' },
  { id: '8', title: 'Reporte DAU mobile', type: 'dashboard', priority: 'p3_low', storyPoints: 3, status: 'done' },
];

export default async function DeliveryBoardPage() {
  const supabase = await createClient();

  const [{ data: requests }, { data: sprint }] = await Promise.all([
    supabase.from('requests').select('id, title, type, priority, story_points, delivery_status').order('created_at', { ascending: false }),
    supabase.from('sprints').select('*').eq('is_active', true).single(),
  ]);

  const boardItems: BoardItem[] = requests?.length
    ? requests.map((r) => ({
        id: r.id,
        title: r.title,
        type: r.type,
        priority: r.priority,
        storyPoints: r.story_points ?? undefined,
        status: (r.delivery_status ?? 'backlog') as DeliveryStatus,
      }))
    : FALLBACK_ITEMS;

  const usedPoints = boardItems
    .filter((i) => !['done', 'backlog'].includes(i.status))
    .reduce((sum, i) => sum + (i.storyPoints ?? 0), 0);

  return (
    <>
      <CommandCenterTopBar
        title="Analytics Delivery Board"
        subtitle="Flujo tipo Linear · Drag & Drop · Sprints"
        badge={sprint?.name ?? 'Sprint 12'}
      />

      <div className="p-6">
        <div className="flex flex-wrap gap-4 mb-6">
          <Card className="bg-card/50 border-border/60">
            <CardContent className="py-3 px-4 flex items-center gap-6">
              <div>
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-lg font-bold">{usedPoints}/{sprint?.capacity_points ?? 42} pts</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Items activos</p>
                <p className="text-lg font-bold">{boardItems.filter((i) => i.status !== 'done').length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Blocked</p>
                <Badge variant="outline" className="border-destructive/40 text-destructive">
                  {boardItems.filter((i) => i.status === 'blocked').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <DeliveryBoardClient initialItems={boardItems} />
      </div>
    </>
  );
}
