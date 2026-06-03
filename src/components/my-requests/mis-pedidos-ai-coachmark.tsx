'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'aero-mis-pedidos-ia-coach-v1';

export function MisPedidosAiCoachmark() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(STORAGE_KEY) !== '1');
  }, []);

  if (!visible) return null;

  return (
    <div
      className="flex items-start gap-3 rounded-lg border border-primary/25 bg-primary/[0.06] px-3 py-2.5 text-xs"
      role="note"
    >
      <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground/90">Nuevo: columna IA</p>
        <p className="text-muted-foreground mt-0.5 leading-relaxed">
          En pedidos activos, pulsa <strong className="font-medium text-foreground/80">IA</strong> para
          preguntar al copiloto con contexto de ese pedido — estado, plazos y qué sigue.
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 shrink-0 text-muted-foreground"
        aria-label="Entendido"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, '1');
          setVisible(false);
        }}
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
