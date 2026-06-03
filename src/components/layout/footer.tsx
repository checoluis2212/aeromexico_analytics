'use client';

import Link from 'next/link';
import { siteConfig, navPrimary, hubNavItems, analyticsStack } from '@/lib/constants';
import { Radar } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-card/20 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Radar className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">{siteConfig.name}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {siteConfig.description}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              {siteConfig.role} · {siteConfig.org}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Portal</h4>
            <ul className="space-y-2.5">
              {navPrimary.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Pedidos</h4>
            <ul className="space-y-2.5">
              {hubNavItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Stack Aeroméxico</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              {analyticsStack.map((t) => (
                <li key={t.short}>{t.name}</li>
              ))}
              <li className="text-primary/80">Data layers corporativos</li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {siteConfig.author}. Todos los derechos reservados.</p>
          <p>Hecho con Next.js · Supabase · Vercel</p>
        </div>
      </div>
    </footer>
  );
}
