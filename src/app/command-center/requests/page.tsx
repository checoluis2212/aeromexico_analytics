'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { CommandCenterTopBar } from '@/components/command-center/top-bar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ACC_REQUEST_TYPES } from '@/types/command-center';
import { Sparkles, Send, Loader2, FileText, CheckSquare, Target, ClipboardList } from 'lucide-react';

const schema = z.object({
  title: z.string().min(5),
  type: z.string(),
  business_goal: z.string().min(10),
  problem_statement: z.string().min(10),
  decision_to_be_made: z.string().min(5),
  priority: z.enum(['p0_critical', 'p1_high', 'p2_medium', 'p3_low']),
  deadline: z.string().optional(),
  requester_name: z.string().min(2),
  requester_email: z.string().email(),
});

type FormData = z.infer<typeof schema>;

interface AiOutput {
  user_story: string;
  acceptance_criteria: string[];
  analytics_requirements: string[];
  measurement_plan: string;
  qa_checklist: string[];
}

export default function RequestCenterPage() {
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<AiOutput | null>(null);

  const { register, handleSubmit, setValue, watch, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'p2_medium', type: 'dashboard' },
  });

  async function generateAi() {
    setGenerating(true);
    const values = getValues();
    try {
      const res = await fetch('/api/command-center/generate-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      setAiOutput(data);
      toast.success('Artefactos generados con IA');
    } catch {
      toast.error('Error al generar con IA');
    } finally {
      setGenerating(false);
    }
  }

  async function onSubmit(data: FormData) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/command-center/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, ai: aiOutput }),
      });
      if (!res.ok) throw new Error();
      toast.success('Solicitud creada', { description: 'Visible en Delivery Board.' });
    } catch {
      toast.error('Error al crear solicitud');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <CommandCenterTopBar
        title="Analytics Request Center"
        subtitle="Autoservicio inteligente · IA genera user stories y criterios de aceptación"
      />

      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input {...register('requester_name')} className="mt-1.5" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" {...register('requester_email')} className="mt-1.5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo *</Label>
                <Select defaultValue="dashboard" onValueChange={(v) => setValue('type', v ?? 'dashboard')}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ACC_REQUEST_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridad</Label>
                <Select defaultValue="p2_medium" onValueChange={(v) => setValue('priority', v as FormData['priority'])}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
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
              <Label>Título *</Label>
              <Input {...register('title')} className="mt-1.5" placeholder="Ej: Dashboard de abandono checkout mobile" />
            </div>

            <div>
              <Label>Business Goal *</Label>
              <Textarea {...register('business_goal')} className="mt-1.5" rows={2} placeholder="¿Qué objetivo de negocio persigue?" />
            </div>

            <div>
              <Label>Problem Statement *</Label>
              <Textarea {...register('problem_statement')} className="mt-1.5" rows={2} placeholder="¿Qué problema estamos resolviendo?" />
            </div>

            <div>
              <Label>Decision To Be Made *</Label>
              <Textarea {...register('decision_to_be_made')} className="mt-1.5" rows={2} placeholder="¿Qué decisión tomaremos con estos datos?" />
            </div>

            <div>
              <Label>Deadline</Label>
              <Input type="date" {...register('deadline')} className="mt-1.5" />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={generateAi} disabled={generating}>
                {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generar con IA
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Crear solicitud
              </Button>
            </div>
          </form>
        </div>

        <div>
          {aiOutput ? (
            <Tabs defaultValue="story">
              <TabsList className="mb-4">
                <TabsTrigger value="story">User Story</TabsTrigger>
                <TabsTrigger value="ac">Acceptance Criteria</TabsTrigger>
                <TabsTrigger value="req">Requirements</TabsTrigger>
                <TabsTrigger value="qa">QA Checklist</TabsTrigger>
              </TabsList>
              <TabsContent value="story">
                <Card className="bg-card/50"><CardContent className="pt-4 text-sm whitespace-pre-wrap">{aiOutput.user_story}</CardContent></Card>
              </TabsContent>
              <TabsContent value="ac">
                <Card className="bg-card/50"><CardContent className="pt-4 space-y-2">
                  {aiOutput.acceptance_criteria.map((c, i) => (
                    <div key={i} className="flex gap-2 text-sm"><CheckSquare className="h-4 w-4 text-radar shrink-0" />{c}</div>
                  ))}
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="req">
                <Card className="bg-card/50"><CardContent className="pt-4 space-y-2">
                  {aiOutput.analytics_requirements.map((r, i) => (
                    <div key={i} className="flex gap-2 text-sm"><Target className="h-4 w-4 text-primary shrink-0" />{r}</div>
                  ))}
                  <p className="text-sm mt-4 pt-4 border-t border-border/40 whitespace-pre-wrap">{aiOutput.measurement_plan}</p>
                </CardContent></Card>
              </TabsContent>
              <TabsContent value="qa">
                <Card className="bg-card/50"><CardContent className="pt-4 space-y-2">
                  {aiOutput.qa_checklist.map((q, i) => (
                    <div key={i} className="flex gap-2 text-sm"><ClipboardList className="h-4 w-4 text-signal shrink-0" />{q}</div>
                  ))}
                </CardContent></Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card className="bg-card/30 border-dashed h-full flex items-center justify-center min-h-[400px]">
              <CardContent className="text-center">
                <Sparkles className="h-10 w-10 text-primary/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Completa el formulario y pulsa &quot;Generar con IA&quot;</p>
                <p className="text-xs text-muted-foreground mt-2">User Story · Acceptance Criteria · Measurement Plan · QA Checklist</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
