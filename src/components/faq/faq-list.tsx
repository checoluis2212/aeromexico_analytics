import { faqCategoryLabels, faqCategoryOrder, analyticsFaqs } from '@/lib/faqs';
import { cn } from '@/lib/utils';

export function FaqList({ className }: { className?: string }) {
  const grouped = faqCategoryOrder.map((cat) => ({
    category: cat,
    label: faqCategoryLabels[cat],
    items: analyticsFaqs.filter((f) => f.category === cat),
  }));

  return (
    <div className={cn('max-w-2xl mx-auto space-y-8', className)}>
      {grouped.map(({ category, label, items }) => (
        <div key={category}>
          <h2 className="text-sm font-semibold text-primary mb-3">{label}</h2>
          <div className="space-y-3">
            {items.map((faq) => (
              <details
                key={faq.q}
                className="group rounded-xl border border-border/50 bg-card/40 overflow-hidden"
              >
                <summary className="px-5 py-4 text-sm font-medium cursor-pointer list-none flex items-center justify-between gap-3 hover:bg-secondary/20 transition-colors">
                  {faq.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none shrink-0">
                    +
                  </span>
                </summary>
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
