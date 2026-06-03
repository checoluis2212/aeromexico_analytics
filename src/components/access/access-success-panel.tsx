import { CheckCircle2 } from 'lucide-react';
import { ACCESS_PORTAL_COPY } from '@/lib/access-requests/constants';

export function AccessSuccessPanel() {
  const paragraphs = ACCESS_PORTAL_COPY.successBody.split('\n\n');

  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" aria-hidden />
      <h2 className="mt-4 text-lg font-semibold text-foreground">{ACCESS_PORTAL_COPY.successTitle}</h2>
      <div className="mt-3 space-y-3 text-sm text-muted-foreground leading-relaxed">
        {paragraphs.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
    </div>
  );
}
