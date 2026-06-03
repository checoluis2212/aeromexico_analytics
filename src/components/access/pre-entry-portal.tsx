'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LockKeyhole } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ACCESS_PORTAL_COPY } from '@/lib/access-requests/constants';
import { AccessThemeToggle } from '@/components/access/access-theme-toggle';
import { SecurityNotice } from '@/components/access/security-notice';
import { AccessRequestForm } from '@/components/access/access-request-form';
import { AccessSuccessPanel } from '@/components/access/access-success-panel';
import { AccessPendingPanel } from '@/components/access/access-pending-panel';
import { siteConfig } from '@/lib/constants';

type View = 'form' | 'success' | 'pending';

type Props = {
  initialView?: View;
  initialEmail?: string;
};

export function PreEntryPortal({ initialView = 'form', initialEmail = '' }: Props) {
  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState(initialEmail);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('access-portal-theme');
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  const handleThemeChange = useCallback((next: 'light' | 'dark') => {
    setTheme(next);
    localStorage.setItem('access-portal-theme', next);
  }, []);

  const handleSuccess = useCallback((submittedEmail: string) => {
    setEmail(submittedEmail);
    setView('success');
    sessionStorage.setItem('access-request-email', submittedEmail);
  }, []);

  return (
    <div
      className="access-portal-shell min-h-screen flex flex-col"
      data-access-theme={theme}
    >
      <div className="access-portal-backdrop fixed inset-0 -z-10" aria-hidden />
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border/50 bg-card/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 shrink-0">
            <LockKeyhole className="h-4 w-4 text-primary" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{siteConfig.org}</p>
            <p className="text-[11px] text-muted-foreground truncate">Secure Enterprise Portal</p>
          </div>
        </div>
        <AccessThemeToggle theme={theme} onChange={handleThemeChange} />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-14">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <p className="text-xs font-medium uppercase tracking-widest text-primary">
              {ACCESS_PORTAL_COPY.subtitle}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {ACCESS_PORTAL_COPY.title}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
              {ACCESS_PORTAL_COPY.description}
            </p>
          </div>

          {view === 'success' && <AccessSuccessPanel />}

          {view === 'pending' && <AccessPendingPanel email={email} />}

          {view === 'form' && (
            <Card className="shadow-lg border-border/80 bg-card/95 backdrop-blur-sm">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base">{ACCESS_PORTAL_COPY.formTitle}</CardTitle>
                <CardDescription className="text-xs">
                  All fields are required. Use your corporate email address.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5">
                <AccessRequestForm onSuccess={handleSuccess} initialEmail={initialEmail} />
              </CardContent>
            </Card>
          )}

          {(view === 'success' || view === 'pending') && (
            <div className="flex flex-col sm:flex-row gap-2 justify-center text-center">
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setView('pending')}
              >
                {ACCESS_PORTAL_COPY.pendingTitle}
              </button>
              <span className="hidden sm:inline text-muted-foreground">·</span>
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
                {ACCESS_PORTAL_COPY.loginCta}
              </Link>
            </div>
          )}

          <SecurityNotice />
        </div>
      </main>

      <footer className="py-4 text-center text-[11px] text-muted-foreground border-t border-border/40">
        © {new Date().getFullYear()} {siteConfig.author} · Confidential
      </footer>
    </div>
  );
}
