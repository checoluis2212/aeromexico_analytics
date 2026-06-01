'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requestTypes } from '@/lib/constants';
import { Send, Loader2 } from 'lucide-react';

const requestSchema = z.object({
  requester_name: z.string().min(2, 'Nombre requerido'),
  requester_email: z.string().email('Email inválido'),
  company: z.string().optional(),
  type: z.enum(['tracking', 'dashboard', 'funnel', 'qa', 'reporting', 'investigation']),
  title: z.string().min(5, 'Título muy corto'),
  description: z.string().min(20, 'Describe con más detalle'),
  business_context: z.string().optional(),
  priority: z.enum(['p0_critical', 'p1_high', 'p2_medium', 'p3_low']),
});

type RequestForm = z.infer<typeof requestSchema>;

export default function RequestCenterPage() {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { priority: 'p2_medium', type: 'tracking' },
  });

  const selectedType = watch('type');

  async function onSubmit(data: RequestForm) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Error al enviar');
      toast.success('Solicitud enviada correctamente', {
        description: 'Recibirás confirmación por email.',
      });
    } catch {
      toast.error('Error al enviar la solicitud', {
        description: 'Intenta de nuevo o contacta directamente.',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        badge="Centro de solicitudes"
        title="Solicitar trabajo"
        description="Completa el formulario con el máximo contexto posible para una respuesta más rápida."
      />

      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requester_name">Nombre *</Label>
                  <Input id="requester_name" {...register('requester_name')} className="mt-1.5" />
                  {errors.requester_name && <p className="text-xs text-destructive mt-1">{errors.requester_name.message}</p>}
                </div>
                <div>
                  <Label htmlFor="requester_email">Email *</Label>
                  <Input id="requester_email" type="email" {...register('requester_email')} className="mt-1.5" />
                  {errors.requester_email && <p className="text-xs text-destructive mt-1">{errors.requester_email.message}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input id="company" {...register('company')} className="mt-1.5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de solicitud *</Label>
                  <Select defaultValue="tracking" onValueChange={(v) => setValue('type', v as RequestForm['type'])}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Prioridad</Label>
                  <Select defaultValue="p2_medium" onValueChange={(v) => setValue('priority', v as RequestForm['priority'])}>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="p0_critical">P0 — Crítico</SelectItem>
                      <SelectItem value="p1_high">P1 — Alto</SelectItem>
                      <SelectItem value="p2_medium">P2 — Medio</SelectItem>
                      <SelectItem value="p3_low">P3 — Bajo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="title">Título *</Label>
                <Input id="title" placeholder="Ej: Implementar eventos e-commerce en checkout" {...register('title')} className="mt-1.5" />
                {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <Label htmlFor="description">Descripción *</Label>
                <Textarea id="description" rows={5} placeholder="Describe el alcance, URLs afectadas, cronograma..." {...register('description')} className="mt-1.5" />
                {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <Label htmlFor="business_context">Contexto de negocio</Label>
                <Textarea id="business_context" rows={3} placeholder="¿Qué decisión de negocio necesitas tomar?" {...register('business_context')} className="mt-1.5" />
              </div>

              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Enviar solicitud
              </Button>
            </form>
          </div>

          <div>
            <Card className="bg-card/50 border-border/60 sticky top-24">
              <CardHeader>
                <CardTitle className="text-base">
                  {requestTypes.find((t) => t.value === selectedType)?.label ?? 'Solicitud'}
                </CardTitle>
                <CardDescription>
                  {requestTypes.find((t) => t.value === selectedType)?.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-3">
                <p>Incluye siempre:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>URLs o propiedades afectadas</li>
                  <li>Cronograma deseado</li>
                  <li>Stakeholders clave</li>
                  <li>Accesos disponibles</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </Section>
    </>
  );
}
