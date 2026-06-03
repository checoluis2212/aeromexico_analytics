'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Props = {
  content: string;
  className?: string;
};

export function AssistantMarkdown({ content, className }: Props) {
  return (
    <div
      className={cn(
        'prose prose-sm prose-invert max-w-none',
        'prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5',
        'prose-p:text-foreground/90 prose-p:my-1.5 prose-p:leading-relaxed',
        'prose-strong:text-foreground prose-li:text-foreground/90 prose-li:my-0.5',
        'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
        'prose-code:text-primary prose-code:bg-secondary/60 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.85em]',
        'prose-pre:bg-secondary/40 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-lg',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children }) => {
            if (href?.startsWith('/')) {
              return (
                <Link href={href} className="text-primary hover:underline">
                  {children}
                </Link>
              );
            }
            return (
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
