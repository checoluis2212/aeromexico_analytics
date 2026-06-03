'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Play } from 'lucide-react';
import { toast } from 'sonner';

export function BigQueryProbeButton() {
  const [loading, setLoading] = useState(false);

  async function runProbe() {
    setLoading(true);
    try {
      const res = await fetch('/api/command-center/bigquery-probe');
      const data = await res.json();
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? 'La prueba falló');
        return;
      }
      toast.success(
        data.martsConfigured
          ? 'Consulta OK — revisa logs del servidor para el preview completo'
          : `Conexión OK. ${data.configHint}`
      );
      if (typeof data.preview === 'string' && data.preview.length > 0) {
        console.info('[BigQuery probe preview]\n', data.preview);
      }
    } catch {
      toast.error('No se pudo contactar al servidor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={loading}
      onClick={() => void runProbe()}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
      Probar consulta al almacén
    </Button>
  );
}
