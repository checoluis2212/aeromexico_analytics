import { Suspense } from 'react';
import { LoginPageContent } from '@/components/auth/login-page-content';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="access-portal-shell min-h-screen flex items-center justify-center text-muted-foreground text-sm">
          Cargando…
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
