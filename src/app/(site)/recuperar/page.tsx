'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Mail, Loader2 } from 'lucide-react';
import { useTrackEvent } from '@/components/analytics/analytics-context';

export default function RecuperarPage() {
  const track = useTrackEvent();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  async function sendRecovery(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const redirectTo = `${origin}/auth/callback?redirect=${encodeURIComponent('/perfil?mode=recovery')}`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (error) throw error;
      track('password_reset_request');
      toast.success('Te mandé un correo', { description: 'Abre el link para definir una contraseña nueva.' });
      setEmail('');
    } catch (err) {
      toast.error('No se pudo enviar', { description: err instanceof Error ? err.message : 'Intenta de nuevo' });
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader
        badge="Recuperación"
        title="Recuperar contraseña"
        description="Te mando un correo para que definas una contraseña nueva."
      />
      <Section>
        <Card className="glass-card premium-border max-w-md mx-auto">
          <CardContent className="pt-6 pb-7 px-5 sm:px-6">
            <form onSubmit={sendRecovery} className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-primary" />
                <span>Usa el correo con el que entraste.</span>
              </div>
              <div>
                <Label htmlFor="email">Correo</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1.5"
                  placeholder="tu.correo@empresa.com"
                  autoComplete="email"
                />
              </div>
              <Button type="submit" className="w-full" disabled={sending}>
                {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Enviar correo
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                <Link href="/login" className="hover:underline text-primary">
                  Volver a entrar
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </Section>
    </>
  );
}

