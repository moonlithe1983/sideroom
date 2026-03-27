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
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={onReport}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  borderColor: tint,
                  opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
                },
              ]}>
              <ThemedText type="defaultSemiBold" style={[styles.actionText, { color: tint }]}>
                Report
              </ThemedText>
            </Pressable>
          ) : null}
          {onBlockAuthor ? (
            <Pressable
              accessibilityRole="button"
              disabled={disabled}
              onPress={onBlockAuthor}
              style={({ pressed }) => [
                styles.actionButton,
                {
                  borderColor: danger,
                  opacity: disabled ? 0.45 : pressed ? 0.78 : 1,
                },
              ]}>
              <ThemedText type="defaultSemiBold" style={[styles.actionText, { color: danger }]}>
                Block author
              </ThemedText>
            </Pressable>
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
    fontSize: 13,
    lineHeight: 16,
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
    fontSize: 13,
    lineHeight: 18,
  },
});
