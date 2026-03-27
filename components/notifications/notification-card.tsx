import { Pressable, StyleSheet, View } from 'react-native';

import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatRelativeTime } from '@/lib/format/relative-time';
import type { AppNotification } from '@/types/notifications';

type NotificationCardProps = {
  disabled?: boolean;
  notification: AppNotification;
  onPress: () => void;
};

export function NotificationCard({
  disabled = false,
  notification,
  onPress,
}: NotificationCardProps) {
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: surface,
          borderColor: notification.is_read ? border : tint,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
        },
      ]}>
      <View style={styles.headerRow}>
        <View style={styles.titleBlock}>
          <ThemedText type="defaultSemiBold" style={styles.title}>
            {notification.message_title}
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: muted }]}>
            {formatRelativeTime(notification.created_at)}
          </ThemedText>
        </View>
        {!notification.is_read ? <StatusPill label="Unread" tone="warning" /> : null}
      </View>
      {notification.message_preview ? (
        <ThemedText style={[styles.preview, { color: muted }]}>
          {notification.message_preview}
        </ThemedText>
      ) : null}
      {notification.post_title ? (
        <ThemedText style={[styles.postTitle, { color: muted }]}>
          On post: {notification.post_title}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
    lineHeight: 18,
  },
  postTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
  titleBlock: {
    flex: 1,
    gap: 6,
  },
});
