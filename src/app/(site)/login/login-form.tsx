'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { siteConfig } from '@/lib/constants';
import { getPostLoginPath } from '@/lib/auth/access';
import { toast } from 'sonner';
import { Loader2, Plane } from 'lucide-react';

export default function LoginForm() {
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
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error('No pudimos iniciar sesión', { description: error.message });
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, acc_role')
      .eq('id', user!.id)
      .single();

    if (!profile) {
      toast.error('Perfil no encontrado', {
        description: 'Escríbele a Sergio para activar tu cuenta.',
      });
      setLoading(false);
      return;
    }

    toast.success('Bienvenido');
    router.push(getPostLoginPath(profile, redirect));
    router.refresh();
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {authError === 'unauthorized' && (
          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            No tienes acceso a esa sección. Entra por Mis pedidos o escríbeme si necesitas el Centro Analytics.
          </div>
        )}

        <div className="rounded-xl border border-border/50 glass-card p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20 mb-3">
              <Plane className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-lg font-semibold">Entrar</h1>
            <p className="text-xs text-muted-foreground mt-1">
              {siteConfig.org} · Ver y gestionar tus pedidos
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-xs">Correo</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-9"
                placeholder="tu.correo@aeromexico.com"
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Contraseña</Label>
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

          <p className="mt-4 text-center text-[11px] text-muted-foreground leading-relaxed">
            Para ver el estado de tus pedidos conmigo.
            <br />
            ¿Primera vez? Escríbeme y te creo la cuenta.
          </p>

          <p className="mt-3 text-center">
            <Link
              href={redirect?.startsWith('/') ? redirect : '/pedir'}
              className="text-xs text-primary hover:underline"
            >
              Ir a pedir algo →
            </Link>
          </p>

          <p className="mt-3 text-center">
            <Link href="/recuperar" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ¿Olvidaste tu contraseña?
            </Link>
          </p>

          <p className="mt-4 text-center">
            <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              ← Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
