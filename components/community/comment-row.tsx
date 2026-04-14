import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatRelativeTime } from '@/lib/format/relative-time';
import type { CommunityComment } from '@/types/community';

type CommentRowProps = {
  comment: CommunityComment;
  disabled?: boolean;
  onBlockAuthor?: () => void;
  onReport?: () => void;
  selectedForSafety?: boolean;
};

type ActionButtonProps = {
  accessibilityHint: string;
  accessibilityLabel: string;
  borderColor: string;
  disabled?: boolean;
  label: string;
  onPress: () => void;
  textColor: string;
};

function ActionButton({
  accessibilityHint,
  accessibilityLabel,
  borderColor,
  disabled = false,
  label,
  onPress,
  textColor,
}: ActionButtonProps) {
  const focusRing = useThemeColor({}, 'focusRing');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionButton,
        {
          borderColor: isFocused ? focusRing : borderColor,
          borderWidth: isFocused ? 2 : 1,
          opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
        },
      ]}>
      <ThemedText type="defaultSemiBold" style={[styles.actionText, { color: textColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function CommentRow({
  comment,
  disabled = false,
  onBlockAuthor,
  onReport,
  selectedForSafety = false,
}: CommentRowProps) {
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={[styles.card, { backgroundColor: surfaceAlt, borderColor: border }]}>
      <View style={styles.metaRow}>
        <StatusPill label={comment.author_label} tone="default" />
        <ThemedText style={[styles.metaText, { color: muted }]}>
          {comment.author_trust_hint} | {formatRelativeTime(comment.created_at)}
        </ThemedText>
      </View>
      <ThemedText>{comment.body}</ThemedText>
      {selectedForSafety ? <StatusPill label="Selected for safety review" tone="warning" /> : null}
      {onReport || onBlockAuthor ? (
        <View style={styles.actionRow}>
          {onReport ? (
            <ActionButton
              accessibilityHint="Sends this comment to the moderation queue and removes it from your view."
              accessibilityLabel={`Report comment from ${comment.author_label}`}
              borderColor={tint}
              disabled={disabled}
              label="Report"
              onPress={onReport}
              textColor={tint}
            />
          ) : null}
          {onBlockAuthor ? (
            <ActionButton
              accessibilityHint="Hides this author from your feed, search, comments, and notifications."
              accessibilityLabel={`Block author ${comment.author_label}`}
              borderColor={danger}
              disabled={disabled}
              label="Block author"
              onPress={onBlockAuthor}
              textColor={danger}
            />
          ) : null}
        </View>
      ) : null}
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
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actionText: {
    fontSize: 14,
    lineHeight: 18,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
