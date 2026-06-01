'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { siteConfig } from '@/lib/constants';
import { Mail, MapPin, Send, Loader2 } from 'lucide-react';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          subject: form.get('subject'),
          message: form.get('message'),
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Mensaje enviado');
      (e.target as HTMLFormElement).reset();
    } catch {
      toast.error('Error al enviar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        badge="Contacto"
        title="Contacto"
        description="Para consultas generales, assessments o colaboraciones."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="space-y-6">
            <Card className="bg-card/50 border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a href={`mailto:${siteConfig.email}`} className="text-sm text-primary hover:underline">
                  {siteConfig.email}
                </a>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/60">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Europa · Remoto en todo el mundo</p>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/60">
              <CardHeader>
                <CardTitle className="text-base">Para solicitudes de trabajo</CardTitle>
                <CardDescription>Usa el centro de solicitudes para tracking formal con SLAs.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" required className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" required className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="subject">Asunto</Label>
                <Input id="subject" name="subject" required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="message">Mensaje</Label>
                <Textarea id="message" name="message" rows={6} required className="mt-1.5" />
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar mensaje
              </Button>
            </form>
          </div>
        </div>
      </Section>
    </>
  );
}
