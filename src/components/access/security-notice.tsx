import { AlertTriangle } from 'lucide-react';
import { ACCESS_PORTAL_COPY } from '@/lib/access-requests/constants';

export function SecurityNotice() {
  return (
    <aside
      className="rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm"
      role="note"
      aria-labelledby="access-security-title"
    >
      <div className="flex gap-2.5">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden />
        <div>
          <p id="access-security-title" className="font-medium text-foreground">
            {ACCESS_PORTAL_COPY.securityTitle}
          </p>
          <ul className="mt-2 space-y-1.5 text-muted-foreground list-disc pl-4">
            {ACCESS_PORTAL_COPY.securityBullets.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
