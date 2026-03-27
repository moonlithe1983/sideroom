import { getSupabaseClient } from '@/lib/supabase/client';
import type { AppNotification } from '@/types/notifications';

function requireSupabase() {
  const supabase = getSupabaseClient();

  if (!supabase) {
    throw new Error('Supabase is not configured yet.');
  }

  return supabase;
}

export async function getNotifications(unreadOnly = false) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_notifications', {
    input_limit: 30,
    input_offset: 0,
    input_unread_only: unreadOnly,
  });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AppNotification[];
}

export async function getUnreadNotificationCount() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('get_unread_notification_count');

  if (error) {
    throw new Error(error.message);
  }

  return Number(data ?? 0);
}

export async function markNotificationRead(notificationId: string) {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('mark_notification_read', {
    input_notification_id: notificationId,
  });

  if (error) {
    throw new Error(error.message);
  }

  return Boolean(data);
}

export async function markAllNotificationsRead() {
  const supabase = requireSupabase();
  const { data, error } = await supabase.rpc('mark_all_notifications_read');

  if (error) {
    throw new Error(error.message);
  }

  return Number(data ?? 0);
}
