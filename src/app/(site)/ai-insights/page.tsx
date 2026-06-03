'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Sparkles, Loader2, FileSpreadsheet, AlertTriangle, TrendingUp, Lightbulb } from 'lucide-react';

interface AnalysisResult {
  executive_summary: string;
  insights: string[];
  anomalies: { metric: string; description: string; severity: string }[];
  trends: { metric: string; direction: string; change: string }[];
  recommendations: string[];
}

export default function AIInsightsPage() {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['.csv', '.xlsx', '.xls'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(ext)) {
      toast.error('Formato no soportado. Usa CSV o XLSX.');
      return;
    }

    setUploading(true);
    setFileName(file.name);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      setAnalyzing(true);
      const res = await fetch('/api/insights/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Analysis failed');
      const data = await res.json();
      setResult(data);
      toast.success('Análisis completado');
    } catch {
      toast.error('Error en el análisis', { description: 'Verifica que el servicio AI esté activo.' });
    } finally {
      setUploading(false);
      setAnalyzing(false);
    }
  }, []);

  return (
    <>
      <PageHeader
        badge="Insights con IA"
        title="Centro de insights con IA"
        description="Sube exportaciones de GA4, CSV o XLSX para generar insights automáticos, detectar anomalías y obtener recomendaciones."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="bg-card/50 border-border/60 border-dashed">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Subir datos
                </CardTitle>
                <CardDescription>CSV, XLSX o exportaciones GA4</CardDescription>
              </CardHeader>
              <CardContent>
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-border/60 rounded-lg cursor-pointer hover:border-primary/40 transition-colors bg-secondary/20">
                  <div className="flex flex-col items-center">
                    {uploading || analyzing ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                    )}
                    <p className="mt-3 text-sm text-muted-foreground">
                      {analyzing ? 'Analizando...' : 'Arrastra o selecciona archivo'}
                    </p>
                    {fileName && <Badge variant="secondary" className="mt-2">{fileName}</Badge>}
                  </div>
                  <input type="file" className="hidden" accept=".csv,.xlsx,.xls" onChange={handleUpload} disabled={uploading || analyzing} />
                </label>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {!result ? (
              <Card className="bg-card/50 border-border/60 h-full flex items-center justify-center min-h-[300px]">
                <CardContent className="text-center">
                  <Sparkles className="h-10 w-10 text-primary/40 mx-auto" />
                  <p className="mt-4 text-muted-foreground text-sm">
                    Sube un archivo para generar insights automáticos con IA.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Tabs defaultValue="summary">
                <TabsList className="mb-6">
                  <TabsTrigger value="summary">Resumen</TabsTrigger>
                  <TabsTrigger value="insights">Hallazgos</TabsTrigger>
                  <TabsTrigger value="anomalies">Anomalías</TabsTrigger>
                  <TabsTrigger value="trends">Tendencias</TabsTrigger>
                  <TabsTrigger value="recommendations">Recomendaciones</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                  <Card className="bg-card/50 border-border/60">
                    <CardHeader>
                      <CardTitle className="text-base">Resumen ejecutivo</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">{result.executive_summary}</p>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="insights">
                  <div className="space-y-3">
                    {result.insights.map((insight, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-lg border border-border/60 bg-card/30">
                        <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <p className="text-sm">{insight}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="anomalies">
                  <div className="space-y-3">
                    {result.anomalies.map((a, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                        <AlertTriangle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{a.metric}</p>
                          <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
                          <Badge variant="outline" className="mt-2 text-[10px]">{a.severity}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="trends">
                  <div className="space-y-3">
                    {result.trends.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-lg border border-border/60 bg-card/30">
                        <TrendingUp className="h-4 w-4 text-radar shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t.metric}</p>
                          <p className="text-xs text-muted-foreground">{t.change}</p>
                        </div>
                        <Badge variant="secondary">{t.direction}</Badge>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recommendations">
                  <div className="space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-3 p-4 rounded-lg border border-primary/20 bg-primary/5">
                        <span className="text-xs font-bold text-primary">{String(i + 1).padStart(2, '0')}</span>
                        <p className="text-sm">{rec}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </Section>
    </>
  );
}
