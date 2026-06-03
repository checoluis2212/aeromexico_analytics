'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/lib/constants';
import { getPostLoginPath } from '@/lib/auth/access';
import { evaluateLoginEligibility } from '@/lib/access-requests/login-eligibility';
import { LOGIN_PAGE_COPY, GUEST_ENTRY_PATH } from '@/lib/access-requests/login-copy';
import { ACCESS_PORTAL_COPY, AEROMEXICO_LOGO_SRC } from '@/lib/access-requests/constants';
import { AccessThemeToggle } from '@/components/access/access-theme-toggle';
import { toast } from 'sonner';
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useTrackEvent } from '@/components/analytics/analytics-context';
import { setAnalyticsUser } from '@/lib/analytics/data-layer';
import { getAppRole } from '@/lib/auth/access';

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const authError = searchParams.get('error');
  const track = useTrackEvent();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('access-portal-theme');
    if (stored === 'light' || stored === 'dark') setTheme(stored);
  }, []);

  const handleThemeChange = useCallback((next: 'light' | 'dark') => {
    setTheme(next);
    localStorage.setItem('access-portal-theme', next);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    track('login_start');

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
      track('login_error', { error_reason: 'invalid_credentials' });
      toast.error('No pudimos iniciar sesión', {
        description: LOGIN_PAGE_COPY.errors.invalidCredentials,
      });
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, acc_role, email, platform_access_approved')
      .eq('id', user!.id)
      .maybeSingle();

    let requestStatus: 'pending' | 'approved' | 'rejected' | null = null;
    try {
      const statusRes = await fetch(
        `/api/access-requests/status?email=${encodeURIComponent(normalizedEmail)}`
      );
      if (statusRes.ok) {
        const json = await statusRes.json();
        requestStatus = json.status ?? null;
        if (requestStatus) {
          track('access_status_check', { request_status: requestStatus });
        }
      }
    } catch {
      /* status opcional */
    }

    const eligibility = evaluateLoginEligibility(profile, requestStatus);

    if (!eligibility.allowed) {
      await supabase.auth.signOut();
      track('login_error', { error_reason: eligibility.code });
      toast.error('Acceso no disponible', { description: eligibility.message });
      router.push(eligibility.redirectPath);
      router.refresh();
      setLoading(false);
      return;
    }

    setAnalyticsUser({
      id: user!.id,
      app_role: getAppRole(profile),
      acc_role: profile?.acc_role ?? null,
    });
    track('login', { method: 'email' });

    toast.success('Bienvenido');
    router.push(getPostLoginPath(profile, redirect));
    router.refresh();
  }

  return (
    <div
      className="access-portal-shell min-h-screen flex flex-col"
      data-access-theme={theme}
    >
      <div className="access-portal-brand-bar" aria-hidden />
      <div className="access-portal-backdrop fixed inset-0 -z-10" aria-hidden />

      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-border/50 bg-card/50 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <div className="access-portal-logo-wrap shrink-0">
            <Image
              src={AEROMEXICO_LOGO_SRC}
              alt={ACCESS_PORTAL_COPY.brandName}
              width={140}
              height={36}
              className="h-8 w-auto sm:h-9 object-contain object-left"
              priority
            />
          </div>
          <div className="min-w-0 hidden sm:block border-l border-border/60 pl-3">
            <p className="text-xs font-semibold text-foreground truncate">
              {ACCESS_PORTAL_COPY.brandTagline}
            </p>
            <p className="text-[11px] text-muted-foreground truncate">
              {siteConfig.author} · Analytics Metrics
            </p>
          </div>
        </div>
        <AccessThemeToggle theme={theme} onChange={handleThemeChange} />
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-10">
        <div className="w-full max-w-md space-y-5">
          <div className="text-center space-y-2">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider border-[#0b2340]/30 text-[#0b2340] dark:text-primary"
            >
              {ACCESS_PORTAL_COPY.portalBadge}
            </Badge>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              {LOGIN_PAGE_COPY.gateTitle}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm mx-auto">
              {LOGIN_PAGE_COPY.gateLead}
            </p>
          </div>

          {authError === 'unauthorized' && (
            <div
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
              role="alert"
            >
              {LOGIN_PAGE_COPY.unauthorizedSection}
            </div>
          )}

          <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
                <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              </div>
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  {LOGIN_PAGE_COPY.noAccessTitle}
                </h2>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {LOGIN_PAGE_COPY.noAccessBody}
                </p>
              </div>
            </div>

            <ol className="grid grid-cols-2 gap-2 text-[11px]">
              {LOGIN_PAGE_COPY.steps.map((step) => (
                <li
                  key={step.n}
                  className="rounded-md border border-border/50 bg-card/60 px-2.5 py-2"
                >
                  <span className="font-semibold text-primary">{step.n}.</span> {step.title}
                  <span className="block text-muted-foreground mt-0.5">{step.detail}</span>
                </li>
              ))}
            </ol>

            <Button asChild className="w-full gap-2 bg-[#0b2340] hover:bg-[#0b2340]/90 text-white">
              <Link href={GUEST_ENTRY_PATH}>
                {LOGIN_PAGE_COPY.requestAccessCta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm shadow-sm p-6">
            <div className="text-center mb-5">
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
                <LockKeyhole className="h-3.5 w-3.5" />
                {LOGIN_PAGE_COPY.hasAccountTitle}
              </div>
              <h2 className="text-lg font-semibold text-foreground">{LOGIN_PAGE_COPY.loginTitle}</h2>
              <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
                {LOGIN_PAGE_COPY.hasAccountBody}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-xs text-foreground">
                  Correo corporativo
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1.5 h-9 text-foreground border-border placeholder:text-muted-foreground"
                  placeholder="nombre.apellido@aeromexico.com"
                  autoComplete="email"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-xs text-foreground">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1.5 h-9 text-foreground border-border placeholder:text-muted-foreground"
                  autoComplete="current-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-9 bg-[#e4002b] hover:bg-[#e4002b]/90 text-white"
                disabled={loading}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Entrar
              </Button>
            </form>

            <p className="mt-4 text-center">
              <Link
                href="/recuperar"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {LOGIN_PAGE_COPY.forgotPassword}
              </Link>
            </p>
          </div>

          <p className="text-center">
            <Link
              href={GUEST_ENTRY_PATH}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              ← {LOGIN_PAGE_COPY.backHome}
            </Link>
          </p>
        </div>
      </main>

      <footer className="px-4 py-4 text-center text-[10px] text-muted-foreground border-t border-border/40">
        {ACCESS_PORTAL_COPY.footer}
      </footer>
    </div>
  );
}
