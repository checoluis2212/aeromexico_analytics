import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { notifyNewRequest } from '@/lib/notify-request';
import { pushRequestToExternal, saveExternalRef } from '@/lib/integrations/external-sync';
import { z } from 'zod';

const requestSchema = z.object({
  requester_name: z.string().min(2),
  requester_email: z.string().email(),
  company: z.string().optional(),
  type: z.enum(['tracking', 'dashboard', 'funnel', 'qa', 'reporting', 'investigation']).optional(),
  title: z.string().min(10),
  description: z.string().optional(),
  priority: z.enum(['p0_critical', 'p1_high', 'p2_medium', 'p3_low']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Configuración incompleta en el servidor. Avísale a Sergio.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const data = requestSchema.parse(body);

    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();

    const payload = {
      user_id: user?.id ?? null,
      requester_name: data.requester_name,
      requester_email: user?.email ?? data.requester_email,
      company: data.company ?? 'Sin área',
      type: data.type ?? 'dashboard',
      title: data.title,
      description: data.description ?? data.title,
      priority: data.priority ?? 'p2_medium',
      status: 'submitted' as const,
      delivery_status: 'backlog' as const,
    };

    const supabase = createAdminClient();

    const { data: inserted, error } = await supabase
      .from('requests')
      .insert(payload)
      .select('id, title, type, priority, requester_name, requester_email, company, description')
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    await notifyNewRequest(inserted);

    const external = await pushRequestToExternal({
      id: inserted.id,
      title: inserted.title,
      description: inserted.description ?? inserted.title,
      requester_name: inserted.requester_name,
      requester_email: inserted.requester_email,
      company: inserted.company,
      priority: inserted.priority,
      type: inserted.type,
    });

    if (external) {
      await saveExternalRef(inserted.id, external);
    }

    return NextResponse.json({
      success: true,
      id: inserted.id,
      external_url: external?.url ?? null,
    }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      const msg = err.issues[0]?.message ?? 'Datos incompletos';
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    console.error('Request API error:', err);
    return NextResponse.json({ error: 'Error interno. Intenta de nuevo.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
