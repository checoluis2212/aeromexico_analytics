'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es" className="dark" data-theme="jarvis">
      <body className="theme-root font-sans min-h-screen flex flex-col text-foreground">
        <div aria-hidden className="theme-background" />
        <div className="relative z-10 flex flex-1 items-center justify-center p-6">
          <div className="max-w-md text-center space-y-4 glass-card rounded-xl p-8">
            <h1 className="text-lg font-semibold">Algo salió mal</h1>
            <p className="text-sm text-muted-foreground">
              Error temporal del servidor. Recarga la página; si persiste, reinicia el servidor de
              desarrollo.
            </p>
            {error.digest && (
              <p className="text-[10px] text-muted-foreground font-mono">Ref: {error.digest}</p>
            )}
            <button
              type="button"
              onClick={() => reset()}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors glow-aero"
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
