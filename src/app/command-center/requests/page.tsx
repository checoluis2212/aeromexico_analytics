'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { requestAreas, requestPriorities, requestTypes, siteConfig } from '@/lib/constants';
import { Send, Loader2 } from 'lucide-react';

const schema = z.object({
  title: z.string().min(10),
  type: z.enum(['tracking', 'dashboard', 'funnel', 'qa', 'reporting', 'investigation']),
  priority: z.enum(['p0_critical', 'p1_high', 'p2_medium', 'p3_low']),
  requester_name: z.string().min(2),
  requester_email: z.string().email(),
  company: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function RequestCenterPage() {
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'p2_medium', type: 'dashboard', company: 'Marketing' },
  });

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? 'No se pudo enviar');
      toast.success('Pedido enviado', { description: 'Ya aparece en Avance.' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo enviar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <CommandCenterTopBar
        title="Pedir a Sergio"
        subtitle={`${siteConfig.role} — mismo formulario que el equipo usa`}
      />

      <div className="p-5 max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tu nombre</Label>
              <Input {...register('requester_name')} className="mt-1.5" />
            </div>
            <div>
              <Label>Tu correo</Label>
              <Input type="email" {...register('requester_email')} className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label>Área</Label>
            <Controller
              name="company"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {requestAreas.map((a) => (
                      <SelectItem key={a} value={a}>{a}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
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
            <Label>Cuéntanos en una frase</Label>
            <Textarea {...register('title')} className="mt-1.5" rows={3} placeholder="Ej: Dashboard de ROAS por campaña" />
            {errors.title && <p className="text-xs text-destructive mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label>¿Qué tan urgente?</Label>
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

          <Button type="submit" disabled={submitting}>
            {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Enviar a Sergio
          </Button>
        </form>
      </div>
    </>
  );
}
