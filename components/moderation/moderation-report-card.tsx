import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatRelativeTime } from '@/lib/format/relative-time';
import type { ModerationAction, ModerationQueueItem } from '@/types/moderation';

type ModerationReportCardProps = {
  disabled?: boolean;
  item: ModerationQueueItem;
  onAction: (action: ModerationAction) => void;
  onOpenPost?: () => void;
};

type ActionButtonProps = {
  danger?: boolean;
  disabled?: boolean;
  label: string;
  onPress: () => void;
};

function ActionButton({ danger = false, disabled = false, label, onPress }: ActionButtonProps) {
  const border = useThemeColor({}, 'border');
  const dangerColor = useThemeColor({}, 'danger');
  const focusRing = useThemeColor({}, 'focusRing');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const tint = useThemeColor({}, 'tint');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: surfaceAlt,
          borderColor: isFocused ? focusRing : danger ? dangerColor : border,
          borderWidth: isFocused ? 2 : 1,
          opacity: disabled ? 0.45 : pressed ? 0.8 : 1,
        },
      ]}>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.actionLabel, { color: danger ? dangerColor : tint }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function getStatusTone(status: ModerationQueueItem['report_status']) {
  if (status === 'open') {
    return 'warning' as const;
  }

  if (status === 'actioned' || status === 'dismissed') {
    return 'success' as const;
  }

  return 'default' as const;
}

export function ModerationReportCard({
  disabled = false,
  item,
  onAction,
  onOpenPost,
}: ModerationReportCardProps) {
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const surface = useThemeColor({}, 'surface');

  const targetTypeLabel = item.target_type === 'comment' ? 'Comment report' : 'Post report';
  const accountTone =
    item.target_account_status === 'active'
      ? 'default'
      : item.target_account_status === 'suspended'
        ? 'warning'
        : 'warning';

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <View style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <ThemedText type="subtitle" style={styles.title}>
            {targetTypeLabel}
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: muted }]}>
            Reported {formatRelativeTime(item.reported_at)} by @{item.reporter_label}
          </ThemedText>
        </View>
        <StatusPill label={item.report_status} tone={getStatusTone(item.report_status)} />
      </View>

      <View style={styles.pillRow}>
        <StatusPill label={`Reason: ${item.report_reason}`} tone="default" />
        <StatusPill label={`Target: @${item.target_author_label}`} tone="default" />
        <StatusPill
          label={`Account: ${item.target_account_status ?? 'unknown'}`}
          tone={accountTone}
        />
        <StatusPill label={`${item.open_reports_for_target} open reports`} tone="default" />
      </View>

      {item.post_title ? (
        <ThemedText type="defaultSemiBold">Post: {item.post_title}</ThemedText>
      ) : null}
      {item.target_preview ? (
        <ThemedText style={{ color: muted }}>{item.target_preview}</ThemedText>
      ) : null}
      {item.report_details ? (
        <ThemedText style={{ color: muted }}>Reporter notes: {item.report_details}</ThemedText>
      ) : null}

      <View style={styles.actionRow}>
        {onOpenPost ? <ActionButton disabled={disabled} label="Open post" onPress={onOpenPost} /> : null}
        <ActionButton disabled={disabled} label="Dismiss" onPress={() => onAction('dismiss')} />
        {item.target_type === 'post' ? (
          <>
            <ActionButton
              danger
              disabled={disabled}
              label="Remove post"
              onPress={() => onAction('remove_post')}
            />
            <ActionButton disabled={disabled} label="Lock post" onPress={() => onAction('lock_post')} />
          </>
        ) : null}
        {item.target_type === 'comment' ? (
          <ActionButton
            danger
            disabled={disabled}
            label="Remove comment"
            onPress={() => onAction('remove_comment')}
          />
        ) : null}
        <ActionButton
          danger
          disabled={disabled}
          label="Suspend author"
          onPress={() => onAction('suspend_author')}
        />
        <ActionButton
          danger
          disabled={disabled}
          label="Ban author"
          onPress={() => onAction('ban_author')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionLabel: {
    fontSize: 14,
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 14,
    padding: 18,
  },
  headerCopy: {
    flex: 1,
    gap: 6,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
});
