'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteConfig } from '@/lib/constants';
import { getPostLoginPath } from '@/lib/auth/access';
import { evaluateLoginEligibility } from '@/lib/access-requests/login-eligibility';
import { LOGIN_PAGE_COPY, GUEST_ENTRY_PATH } from '@/lib/access-requests/login-copy';
import { AEROMEXICO_LOGO_SRC } from '@/lib/access-requests/constants';
import { toast } from 'sonner';
import { ArrowRight, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';

export function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const authError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const normalizedEmail = email.trim().toLowerCase();

    const { error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });

    if (error) {
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
      }
    } catch {
      /* status opcional */
    }

    const eligibility = evaluateLoginEligibility(profile, requestStatus);

    if (!eligibility.allowed) {
      await supabase.auth.signOut();
      toast.error('Acceso no disponible', { description: eligibility.message });
      router.push(eligibility.redirectPath);
      router.refresh();
      setLoading(false);
      return;
    }

    toast.success('Bienvenido');
    router.push(getPostLoginPath(profile, redirect));
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md space-y-5">
        {authError === 'unauthorized' && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {LOGIN_PAGE_COPY.unauthorizedSection}
          </div>
        )}

        {/* Paso 1: sin acceso → pre-entry */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
            </div>
            <div>
              <h2 className="text-base font-semibold">{LOGIN_PAGE_COPY.noAccessTitle}</h2>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                {LOGIN_PAGE_COPY.noAccessBody}
              </p>
            </div>
          </div>

          <ol className="grid grid-cols-2 gap-2 text-[11px]">
            {LOGIN_PAGE_COPY.steps.map((step) => (
              <li
                key={step.n}
                className="rounded-md border border-border/50 bg-card/40 px-2.5 py-2"
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

        {/* Paso 2: solo si ya tienen alta */}
        <div className="rounded-xl border border-border/50 glass-card p-6">
          <div className="text-center mb-5">
            <div className="mx-auto mb-3 inline-flex rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-border/40">
              <Image
                src={AEROMEXICO_LOGO_SRC}
                alt={siteConfig.org}
                width={120}
                height={32}
                className="h-7 w-auto object-contain"
              />
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
              <LockKeyhole className="h-3.5 w-3.5" />
              {LOGIN_PAGE_COPY.hasAccountTitle}
            </div>
            <h1 className="text-lg font-semibold">{LOGIN_PAGE_COPY.loginTitle}</h1>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed max-w-xs mx-auto">
              {LOGIN_PAGE_COPY.hasAccountBody}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs">
                Correo corporativo
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-9"
                placeholder="nombre.apellido@aeromexico.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 h-9"
                autoComplete="current-password"
              />
            </div>
            <Button type="submit" className="w-full h-9" disabled={loading}>
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
    </div>
  );
}
