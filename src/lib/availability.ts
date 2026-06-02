import { createAdminClient } from '@/lib/supabase/admin';
import { createPublicClient } from '@/lib/supabase/public';
import {
  DEFAULT_AVAILABILITY,
  type SergioAvailability,
  type SergioCapacity,
} from '@/lib/availability-config';

export type { SergioAvailability, SergioCapacity };
export { CAPACITY_CONFIG } from '@/lib/availability-config';

export async function getSergioAvailability(): Promise<SergioAvailability> {
  try {
    const supabase = createPublicClient();
    if (!supabase) return DEFAULT_AVAILABILITY;

    const { data, error } = await supabase
      .from('sergio_availability')
      .select('capacity, note, updated_at')
      .eq('id', 1)
      .maybeSingle();

    if (error || !data?.capacity) return DEFAULT_AVAILABILITY;

    return {
      capacity: data.capacity as SergioCapacity,
      note: data.note,
      updated_at: data.updated_at,
    };
  } catch {
    return DEFAULT_AVAILABILITY;
  }
}

export async function updateSergioAvailability(input: {
  capacity: SergioCapacity;
  note?: string | null;
  userId: string;
}): Promise<SergioAvailability> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('sergio_availability')
    .upsert({
      id: 1,
      capacity: input.capacity,
      note: input.note ?? null,
      updated_at: new Date().toISOString(),
      updated_by: input.userId,
    })
    .select('capacity, note, updated_at')
    .single();

  if (error) throw error;

  return {
    capacity: data.capacity as SergioCapacity,
    note: data.note,
    updated_at: data.updated_at,
  };
}
