import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { z } from 'zod';

const requestSchema = z.object({
  requester_name: z.string().min(2),
  requester_email: z.string().email(),
  company: z.string().optional(),
  type: z.enum(['tracking', 'dashboard', 'funnel', 'qa', 'reporting', 'investigation']),
  title: z.string().min(5),
  description: z.string().min(20),
  business_context: z.string().optional(),
  priority: z.enum(['p0_critical', 'p1_high', 'p2_medium', 'p3_low']),
});

function getSupabaseClient() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return createAdminClient();
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = requestSchema.parse(body);

    const payload = {
      requester_name: data.requester_name,
      requester_email: data.requester_email,
      company: data.company ?? null,
      type: data.type,
      title: data.title,
      description: data.description,
      business_context: data.business_context ?? null,
      priority: data.priority,
      status: 'submitted' as const,
    };

    const admin = getSupabaseClient();
    const supabase = admin ?? await createClient();

    const { data: inserted, error } = await supabase
      .from('requests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create request' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: inserted.id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation failed', details: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = getSupabaseClient() ?? await createClient();
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
