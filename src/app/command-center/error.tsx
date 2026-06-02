'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CommandCenterError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Command Center error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-lg font-semibold">Algo falló al cargar el panel</h1>
        <p className="text-sm text-muted-foreground">
          Suele deberse a configuración de Supabase en Vercel o migraciones pendientes.
          Prueba recargar; si persiste, avisa a Sergio.
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground font-mono">Ref: {error.digest}</p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()}>Reintentar</Button>
          <Button variant="outline" asChild>
            <Link href="/mis-pedidos">Mis pedidos</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
