import { Clock } from 'lucide-react';
import { ACCESS_PORTAL_COPY } from '@/lib/access-requests/constants';

type Props = {
  email?: string;
};

export function AccessPendingPanel({ email }: Props) {
  return (
    <div className="rounded-xl border border-border bg-muted/30 p-6 text-center">
      <Clock className="mx-auto h-10 w-10 text-primary" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-foreground">
        {ACCESS_PORTAL_COPY.pendingTitle}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
        {ACCESS_PORTAL_COPY.pendingBody}
      </p>
      {email && (
        <p className="mt-4 text-xs text-muted-foreground font-mono bg-muted/50 inline-block px-3 py-1 rounded-md">
          {email}
        </p>
      )}
    </div>
  );
}
