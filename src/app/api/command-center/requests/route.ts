import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ai, ...data } = body;

    const payload = {
      requester_name: data.requester_name,
      requester_email: data.requester_email,
      title: data.title,
      description: data.problem_statement ?? data.title,
      type: mapType(data.type),
      priority: data.priority ?? 'p2_medium',
      status: 'submitted',
      delivery_status: 'backlog',
      business_goal: data.business_goal,
      problem_statement: data.problem_statement,
      decision_to_be_made: data.decision_to_be_made,
      due_date: data.deadline || null,
      ai_user_story: ai?.user_story ?? null,
      ai_acceptance_criteria: ai?.acceptance_criteria ?? [],
      ai_analytics_requirements: ai?.analytics_requirements ?? [],
      ai_measurement_plan: ai?.measurement_plan ?? null,
      ai_qa_checklist: ai?.qa_checklist ?? [],
    };

    const supabase = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? createAdminClient()
      : await createClient();

    const { data: inserted, error } = await supabase
      .from('requests')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: inserted.id }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

function mapType(type: string): string {
  const map: Record<string, string> = {
    dashboard: 'dashboard',
    tracking: 'tracking',
    event: 'tracking',
    investigation: 'investigation',
    funnel: 'funnel',
    qa_analytics: 'qa',
    gtm_implementation: 'tracking',
    bigquery: 'reporting',
  };
  return map[type] ?? 'tracking';
}
