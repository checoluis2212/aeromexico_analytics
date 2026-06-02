'use client';

import { useState } from 'react';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

const METRICS = [
  { slug: 'conversion-rate', name: 'Tasa de conversión', type: 'kpi', definition: 'Porcentaje de sesiones que completan el objetivo principal.', formula: '(conversiones / sesiones) × 100', owner: 'Analytics Lead' },
  { slug: 'revenue', name: 'Revenue', type: 'kpi', definition: 'Ingresos totales atribuidos a transacciones completadas.', formula: 'SUM(purchase_revenue)', owner: 'Finance Analytics' },
  { slug: 'sessions', name: 'Sesiones', type: 'metric', definition: 'Número de sesiones iniciadas en la propiedad.', formula: 'COUNT(DISTINCT session_id)', owner: 'Analytics Team' },
  { slug: 'cac', name: 'CAC', type: 'kpi', definition: 'Costo promedio para adquirir un cliente.', formula: 'gasto_marketing / nuevos_clientes', owner: 'Marketing Analytics' },
];

const DIMENSIONS = [
  { slug: 'channel', name: 'Canal', definition: 'Canal de adquisición del usuario.', source: 'GA4 default channel grouping' },
  { slug: 'device-category', name: 'Categoría de dispositivo', definition: 'Desktop, mobile o tablet.', source: 'GA4 device_category' },
  { slug: 'market', name: 'Mercado', definition: 'País o región geográfica.', source: 'GA4 country' },
];

export default function DataDictionaryPage() {
  const [search, setSearch] = useState('');

  const filter = (items: Array<{ name: string; definition: string; slug: string; formula?: string; owner?: string; source?: string }>) =>
    items.filter((i) =>
      !search || i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.definition.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <>
      <CommandCenterTopBar
        title="Glosario"
        subtitle="¿Qué significa cada métrica? Busca aquí, sin llamar a nadie"
      />

      <div className="p-6 space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar KPIs, métricas, dimensiones..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Tabs defaultValue="kpis">
          <TabsList>
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="metrics">Métricas</TabsTrigger>
            <TabsTrigger value="dimensions">Dimensiones</TabsTrigger>
          </TabsList>

          <TabsContent value="kpis" className="mt-4 space-y-3">
            {filter(METRICS.filter((m) => m.type === 'kpi')).map((m) => (
              <Card key={m.slug} className="bg-card/50 border-border/60">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{m.name}</CardTitle>
                    <Badge variant="outline" className="text-[10px]">KPI</Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="text-muted-foreground">{m.definition}</p>
                  {m.formula && <code className="text-xs bg-secondary/40 px-2 py-1 rounded">{m.formula}</code>}
                  <p className="text-xs text-muted-foreground">Owner: {m.owner}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="metrics" className="mt-4 space-y-3">
            {filter(METRICS.filter((m) => m.type === 'metric')).map((m) => (
              <Card key={m.slug} className="bg-card/50 border-border/60">
                <CardHeader className="pb-2"><CardTitle className="text-base">{m.name}</CardTitle></CardHeader>
                <CardContent className="text-sm"><p className="text-muted-foreground">{m.definition}</p></CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="dimensions" className="mt-4 space-y-3">
            {filter(DIMENSIONS).map((d) => (
              <Card key={d.slug} className="bg-card/50 border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{d.name}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                  <p className="text-muted-foreground">{d.definition}</p>
                  <p className="text-xs text-muted-foreground">Source: {d.source}</p>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
