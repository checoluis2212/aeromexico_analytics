'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { roleLabels } from '@/lib/constants';
import { toast } from 'sonner';
import { Loader2, Lock, Radar } from 'lucide-react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/hub';
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
      toast.error('Error de autenticación', { description: error.message });
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single();

    if (!profile || !['admin', 'consultant'].includes(profile.role)) {
      await supabase.auth.signOut();
      toast.error('Acceso no autorizado', {
        description: 'Solo usuarios internos (administrador o consultor) pueden acceder al Hub.',
      });
      setLoading(false);
      return;
    }

    toast.success('Bienvenido al Hub de analytics');
    router.push(redirect);
    router.refresh();
  }

  return (
    <>
      <PageHeader
        badge="Acceso interno"
        title="Inicio de sesión — Hub"
        description="Acceso restringido a usuarios internos con rol administrador o consultor."
      />

      <Section>
        <div className="mx-auto max-w-md">
          {authError === 'unauthorized' && (
            <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              No tienes permisos para acceder al Hub. Contacta al administrador.
            </div>
          )}

          <Card className="bg-card/50 border-border/60">
            <CardHeader className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-2">
                <Radar className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Iniciar sesión</CardTitle>
              <CardDescription>Working With Sergio — Portal interno</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1.5"
                    placeholder="sergio@aero-analytics.com"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mt-1.5"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Lock className="mr-2 h-4 w-4" />
                  )}
                  Acceder al Hub
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                Roles permitidos: {roleLabels.admin}, {roleLabels.consultant}
              </p>

              <p className="mt-4 text-center text-xs text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">
                  ← Volver al portal público
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </Section>
    </>
  );
}
