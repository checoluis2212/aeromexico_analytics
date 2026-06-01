import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { EventParameter } from '@/types/database';

interface EventCardProps {
  eventName: string;
  description: string;
  parameters: EventParameter[];
  exampleCode: string | null;
  useCases: string[];
  category: string | null;
}

export function EventCard({ eventName, description, parameters, exampleCode, useCases, category }: EventCardProps) {
  return (
    <Card className="bg-card/50 border-border/60">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base font-mono">{eventName}</CardTitle>
          {category && <Badge variant="outline">{category}</Badge>}
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {parameters.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Parámetros</h4>
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nombre</TableHead>
                    <TableHead className="text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Requerido</TableHead>
                    <TableHead className="text-xs hidden sm:table-cell">Descripción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {parameters.map((param) => (
                    <TableRow key={param.name}>
                      <TableCell className="font-mono text-xs">{param.name}</TableCell>
                      <TableCell className="text-xs">{param.type}</TableCell>
                      <TableCell className="text-xs">{param.required ? 'Sí' : 'No'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground hidden sm:table-cell">{param.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {exampleCode && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Ejemplo</h4>
            <pre className="rounded-lg bg-secondary/50 border border-border/60 p-4 text-xs font-mono overflow-x-auto">
              {exampleCode}
            </pre>
          </div>
        )}

        {useCases.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Casos de uso</h4>
            <div className="flex flex-wrap gap-2">
              {useCases.map((uc) => (
                <Badge key={uc} variant="secondary" className="text-xs">{uc}</Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
