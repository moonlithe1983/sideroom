import { getSupabaseClient } from '@/lib/supabase/client';
import type { ModerationAction, ModerationQueueItem, ModerationQueueStatus } from '@/types/moderation';

function requireSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  return supabase;
}

export async function getModerationQueue(status: ModerationQueueStatus) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_moderation_queue', {
    input_limit: 30,
    input_offset: 0,
    input_status: status,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ModerationQueueItem[];
}

export async function resolveReport(
  reportId: string,
  action: ModerationAction,
  notes?: string | null
) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('resolve_report', {
    input_action: action,
    input_notes: notes?.trim() ? notes.trim() : null,
    input_report_id: reportId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}
