'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
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
import { Card, CardContent } from '@/components/ui/card';
import { PriorityChips } from '@/components/my-requests/priority-chips';
import { TypeCards } from '@/components/my-requests/type-cards';
import { FadeIn } from '@/components/ui/fade-in';
import { AvailabilitySemaphoreLive } from '@/components/availability/availability-semaphore-live';
import { requestAreas, siteConfig } from '@/lib/constants';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

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
        description: 'Revisará si puede tomarlo y te confirmará fecha.',
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
          <FadeIn className="max-w-md mx-auto text-center py-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              className="relative mx-auto mb-6 w-fit"
            >
              <div className="absolute inset-0 rounded-full bg-radar/20 blur-2xl scale-150" />
              <CheckCircle2 className="relative h-14 w-14 text-radar" />
            </motion.div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Sergio revisará tu pedido y te confirmará si puede tomarlo y para cuándo.
              Si es urgente, también le llegó la alerta al instante.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link href="/mis-pedidos">Ver mis pedidos</Link>
              </Button>
              <Button variant="outline" onClick={() => setSent(false)}>
                Pedir otra cosa
              </Button>
            </div>
          </FadeIn>
        </Section>
      </>
    );
  }

  return (
    <>
      <PageHeader
        badge={siteConfig.role}
        title="Pide lo que quieras a Sergio"
        description="Dashboard, métricas, evento, embudo o lo que necesites — te respondo yo, sin tickets."
      />

      <Section>
        <div className="max-w-2xl mx-auto mb-6">
          <AvailabilitySemaphoreLive />
        </div>
        <FadeIn>
          <Card className="glass-card premium-border max-w-2xl mx-auto overflow-hidden">
            <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary to-radar/50" />
            <CardContent className="pt-6 pb-8 px-5 sm:px-8">
              <div className="flex items-center gap-2 mb-6 text-xs text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>2 minutos · sin login · respuesta directa de Sergio</span>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                      <TypeCards value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>

                <div>
                  <Label htmlFor="title">Cuéntame el detalle</Label>
                  <Textarea
                    id="title"
                    rows={3}
                    placeholder="Ej: Necesito ver conversión por canal, ROAS, abandono en checkout mobile…"
                    {...register('title')}
                    className="mt-1.5 resize-none"
                  />
                  {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <Label>¿Qué tan urgente es?</Label>
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <PriorityChips value={field.value} onChange={field.onChange} />
                    )}
                  />
                </div>

                <Button type="submit" disabled={submitting} className="w-full h-11 glow-aero">
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                  Enviar a Sergio
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  {siteConfig.author} · {siteConfig.role}
                  {' · '}
                  <Link href="/login" className="text-primary hover:underline">
                    Entrar para ver tus pedidos
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </FadeIn>
      </Section>
    </>
  );
}
