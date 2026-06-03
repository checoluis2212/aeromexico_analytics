'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pedirHubHref } from '@/lib/ai/assistant-modes';

export function WorkingWithMeCta() {
  return (
    <Button size="lg" asChild className="glow-aero">
      <Link href={pedirHubHref()}>
        <Sparkles className="mr-2 h-4 w-4" />
        Pedir trabajo
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}
