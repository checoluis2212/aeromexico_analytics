import Link from 'next/link';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExternalLink, FolderArchive, PieChart, Video } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import {
  groupArchiveByRequest,
  type ClientArchiveEntry,
} from '@/lib/delivery/client-archive';
import { DELIVERY_KIND_LABELS } from '@/lib/delivery/types';

type Props = {
  entries: ClientArchiveEntry[];
};

export function ClientDeliveriesArchive({ entries }: Props) {
  const groups = groupArchiveByRequest(entries);

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={FolderArchive}
        title="Aún no hay entregas archivadas"
        description="Cuando Sergio termine un pedido, aquí verás los dashboards Looker y los videos de prueba GTM vinculados a cada solicitud. Todo queda guardado por pedido."
        action={
          <Button asChild variant="outline">
            <Link href="/mis-pedidos">Ver mis pedidos</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Todo lo que Sergio publica en tus pedidos queda aquí: enlaces permanentes por solicitud. Abre el
        pedido para comentarios y estado.
      </p>

      {groups.map(({ request, items }) => (
        <Card key={request.id} className="bg-card/40 border-border/60">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <CardTitle className="text-base font-semibold truncate">{request.title}</CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {request.reference_code && (
                    <span className="font-mono text-foreground/80">{request.reference_code}</span>
                  )}
                  {request.reference_code && ' · '}
                  {format(new Date(request.created_at), "d MMM yyyy", { locale: es })}
                  {' · '}
                  {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/mis-pedidos/${request.id}`}>Ver pedido</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {items.map((d) => (
                <li
                  key={d.id}
                  className="flex items-start gap-3 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2.5"
                >
                  <span className="mt-0.5 shrink-0 text-primary">
                    {d.kind === 'gtm_debug_video' ? (
                      <Video className="h-4 w-4" />
                    ) : (
                      <PieChart className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {DELIVERY_KIND_LABELS[d.kind]}
                    </p>
                    <p className="text-sm font-medium">{d.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Publicado {format(new Date(d.created_at), "d MMM yyyy", { locale: es })}
                    </p>
                    <a
                      href={d.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary mt-1.5 hover:underline"
                    >
                      {d.kind === 'gtm_debug_video' ? 'Ver video' : 'Abrir dashboard'}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
