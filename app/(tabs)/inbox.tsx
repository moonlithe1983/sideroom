import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { NotificationCard } from '@/components/notifications/notification-card';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { SelectableChip } from '@/components/selectable-chip';
import { StateMessage } from '@/components/state-message';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import {
  getNotifications,
  getUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from '@/lib/notifications/api';
import type { AppNotification } from '@/types/notifications';

export default function InboxScreen() {
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bulkWorking, setBulkWorking] = useState(false);
  const [workingNotificationId, setWorkingNotificationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [nextNotifications, nextUnreadCount] = await Promise.all([
        getNotifications(unreadOnly),
        getUnreadNotificationCount(),
      ]);
      setNotifications(nextNotifications);
      setUnreadCount(nextUnreadCount);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load your inbox.');
    } finally {
      setLoading(false);
    }
  }, [unreadOnly]);

  useFocusEffect(
    useCallback(() => {
      void loadInbox();
    }, [loadInbox])
  );

  async function handleMarkAllRead() {
    setBulkWorking(true);
    setError(null);

    try {
      await markAllNotificationsRead();
      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) => ({
          ...notification,
          is_read: true,
        }))
      );
      setUnreadCount(0);
    } catch (markError) {
      setError(markError instanceof Error ? markError.message : 'Could not mark notifications as read.');
    } finally {
      setBulkWorking(false);
    }
  }

  async function handleOpenNotification(notification: AppNotification) {
    setWorkingNotificationId(notification.notification_id);
    setError(null);

    try {
      if (!notification.is_read) {
        const updated = await markNotificationRead(notification.notification_id);

        if (updated) {
          setNotifications((currentNotifications) =>
            currentNotifications.map((currentNotification) =>
              currentNotification.notification_id === notification.notification_id
                ? { ...currentNotification, is_read: true }
                : currentNotification
            )
          );
          setUnreadCount((currentCount) => Math.max(currentCount - 1, 0));
        }
      }

      router.push(`/post/${notification.post_id}`);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : 'Could not open this notification.');
    } finally {
      setWorkingNotificationId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill
          label={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
          tone={unreadCount > 0 ? 'warning' : 'success'}
        />
        <ThemedText type="title" style={styles.heroTitle}>
          Keep track of replies and useful feedback.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          SideRoom only shows activity tied to sanitized post and comment flows, so your inbox stays
          focused on safe, relevant updates.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Filters" title="Choose how you want to review activity">
        <View style={styles.filterRow}>
          <SelectableChip label="All activity" onPress={() => setUnreadOnly(false)} selected={!unreadOnly} />
          <SelectableChip label="Unread only" onPress={() => setUnreadOnly(true)} selected={unreadOnly} />
        </View>
        <PrimaryButton
          accessibilityHint="Marks every inbox item as read."
          busy={bulkWorking}
          disabled={bulkWorking || unreadCount === 0}
          label={bulkWorking ? 'Marking...' : 'Mark all as read'}
          onPress={() => void handleMarkAllRead()}
          tone="secondary"
        />
      </SectionCard>

      <SectionCard eyebrow="Inbox" title="Recent activity on your content">
        {loading ? (
          <StateMessage
            message="SideRoom is loading the latest replies and reactions tied to your content."
            title="Loading inbox"
          />
        ) : null}
        {error ? (
          <StateMessage
            actionHint="Loads the inbox again."
            actionLabel="Try again"
            message={error}
            onAction={() => void loadInbox()}
            title="Inbox could not load"
            tone="danger"
          />
        ) : null}
        {!loading && !error && notifications.length === 0 ? (
          <StateMessage
            message={
              unreadOnly
                ? 'No unread activity right now. New replies and reactions will show up here.'
                : 'Your inbox is empty for now. Once people reply to your posts, activity will appear here.'
            }
            title={unreadOnly ? 'Nothing unread right now' : 'No activity yet'}
          />
        ) : null}
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.notification_id}
            disabled={bulkWorking || workingNotificationId === notification.notification_id}
            notification={notification}
            onPress={() => void handleOpenNotification(notification)}
          />
        ))}
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 24,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },
});
