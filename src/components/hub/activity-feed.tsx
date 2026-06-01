import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Request } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityFeedProps {
  requests: Request[];
}

export function ActivityFeed({ requests }: ActivityFeedProps) {
  return (
    <Card className="bg-card/50 border-border/60 sticky top-24">
      <CardHeader>
        <CardTitle className="text-base">Actividad reciente</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin actividad reciente.</p>
        ) : (
          <div className="space-y-4">
            {requests.slice(0, 8).map((req) => (
              <div key={req.id} className="flex gap-3 text-sm">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium line-clamp-1">{req.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">{req.type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(req.created_at), { addSuffix: true, locale: es })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
