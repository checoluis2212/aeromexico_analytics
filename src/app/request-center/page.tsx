'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { PageHeader } from '@/components/layout/page-header';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { requestAreas, requestPriorities, requestTypes, siteConfig } from '@/lib/constants';
import { Send, Loader2, CheckCircle2 } from 'lucide-react';

const requestSchema = z.object({
  requester_name: z.string().min(2, 'Tu nombre'),
  requester_email: z.string().email('Correo válido'),
  company: z.string().min(1, 'Elige tu área'),
  type: z.enum(['tracking', 'dashboard', 'funnel', 'qa', 'reporting', 'investigation']),
  title: z.string().min(10, 'Cuéntanos un poco más (mínimo 10 caracteres)'),
  priority: z.enum(['p0_critical', 'p1_high', 'p2_medium', 'p3_low']),
});

type RequestForm = z.infer<typeof requestSchema>;

export default function RequestCenterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      priority: 'p2_medium',
      type: 'dashboard',
      company: 'Marketing',
    },
  });

  async function onSubmit(data: RequestForm) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      let json: { error?: string; id?: string } = {};
      try {
        json = await res.json();
      } catch {
        throw new Error('Error del servidor. Recarga la página e intenta de nuevo.');
      }

      if (!res.ok) {
        throw new Error(json.error ?? 'No se pudo enviar el pedido');
      }

      setSent(true);
      toast.success('¡Listo! Sergio recibió tu pedido', {
        description: 'Te contacto pronto. No necesitas hacer nada más.',
      });
      reset({
        requester_name: '',
        requester_email: '',
        title: '',
        priority: 'p2_medium',
        type: 'dashboard',
        company: 'Marketing',
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <>
        <PageHeader
          badge="Pedido recibido"
          title="¡Gracias!"
          description={`Tu pedido ya está con ${siteConfig.author}.`}
        />
        <Section>
          <div className="max-w-md mx-auto text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-radar mx-auto mb-4" />
            <p className="text-muted-foreground text-sm leading-relaxed">
              Te escribo a tu correo cuando tenga novedades.
              Si es urgente, también me llegó la alerta al instante.
            </p>
            <Button className="mt-6" asChild>
              <Link href="/mis-pedidos">Ver mis pedidos</Link>
            </Button>
            <Button className="mt-3" variant="outline" onClick={() => setSent(false)}>
              Pedir otra cosa
            </Button>
          </div>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        badge={siteConfig.role}
        title="Pide lo que quieras a Sergio"
        description="Dashboard, métrica de growth, evento, embudo o lo que necesites — te respondo yo, sin tickets."
      />

      <Section>
        <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg mx-auto space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="requester_name">Tu nombre</Label>
              <Input id="requester_name" placeholder="María García" {...register('requester_name')} className="mt-1.5" />
              {errors.requester_name && <p className="text-xs text-destructive mt-1">{errors.requester_name.message}</p>}
            </div>
            <div>
              <Label htmlFor="requester_email">Tu correo</Label>
              <Input id="requester_email" type="email" placeholder="nombre@aeromexico.com" {...register('requester_email')} className="mt-1.5" />
              {errors.requester_email && <p className="text-xs text-destructive mt-1">{errors.requester_email.message}</p>}
            </div>
          </div>

          <div>
            <Label>Tu área</Label>
            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {requestAreas.map((area) => (
                      <SelectItem key={area} value={area}>{area}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.company && <p className="text-xs text-destructive mt-1">{errors.company.message}</p>}
          </div>

          <div>
            <Label>¿Qué necesitas?</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {requestTypes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div>
            <Label htmlFor="title">¿Qué quieres que haga Sergio?</Label>
            <Textarea
              id="title"
              rows={3}
              placeholder="Ej: Necesito ver conversión por canal, ROAS, abandono en checkout mobile…"
              {...register('title')}
              className="mt-1.5"
            />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label>¿Qué tan urgente es?</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {requestPriorities.map((p) => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full h-11">
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar a Sergio
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            Sin login · {siteConfig.author} · {siteConfig.role}
            {' · '}
            <Link href="/login" className="text-primary hover:underline">
              Entrar para ver tus pedidos
            </Link>
          </p>
        </form>
      </Section>
    </>
  );
}
