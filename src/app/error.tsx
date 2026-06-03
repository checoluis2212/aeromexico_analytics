'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="flex flex-1 items-center justify-center p-8 min-h-[50vh]">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-lg font-semibold">No se pudo cargar la página</h1>
        <p className="text-sm text-muted-foreground">
          Suele resolverse recargando. Si acabas de guardar cambios en dev, ejecuta{' '}
          <code className="text-xs bg-secondary px-1 py-0.5 rounded">npm run dev</code> de nuevo.
        </p>
        {error.digest && (
          <p className="text-[10px] text-muted-foreground font-mono">Ref: {error.digest}</p>
        )}
        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => reset()}>Reintentar</Button>
          <Button variant="outline" asChild>
            <Link href="/">Ir al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
