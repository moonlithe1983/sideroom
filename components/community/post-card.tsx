import { Pressable, StyleSheet, View } from 'react-native';

import { SectionCard } from '@/components/section-card';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatRelativeTime } from '@/lib/format/relative-time';
import type { CommunityFeedPost } from '@/types/community';

type PostCardProps = {
  badges?: {
    label: string;
    tone: 'default' | 'success' | 'warning';
  }[];
  disabled?: boolean;
  onPress: () => void;
  post: CommunityFeedPost;
  showStatusBadge?: boolean;
};

function buildStatusBadge(post: CommunityFeedPost) {
  if (post.status === 'resolved') {
    return {
      label: 'Resolved',
      tone: 'success' as const,
    };
  }

  if (post.status === 'locked') {
    return {
      label: 'Locked',
      tone: 'warning' as const,
    };
  }

  if (post.status === 'removed') {
    return {
      label: 'Removed',
      tone: 'warning' as const,
    };
  }

  return null;
}

export function PostCard({
  badges = [],
  disabled = false,
  onPress,
  post,
  showStatusBadge = true,
}: PostCardProps) {
  const muted = useThemeColor({}, 'muted');
  const statusBadge = showStatusBadge ? buildStatusBadge(post) : null;
  const combinedBadges = statusBadge ? [statusBadge, ...badges] : badges;

  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}>
      <SectionCard eyebrow={post.topic_name} title={post.title}>
        {combinedBadges.length > 0 ? (
          <View style={styles.badgeRow}>
            {combinedBadges.map((badge) => (
              <StatusPill key={badge.label} label={badge.label} tone={badge.tone} />
            ))}
          </View>
        ) : null}
        <View style={styles.metaRow}>
          <StatusPill label={post.is_anonymous ? 'Anonymous' : post.author_label} tone="default" />
          <ThemedText style={[styles.metaText, { color: muted }]}>
            {post.author_trust_hint} | {formatRelativeTime(post.created_at)}
          </ThemedText>
        </View>
        {post.body_preview ? (
          <ThemedText style={[styles.preview, { color: muted }]}>{post.body_preview}</ThemedText>
        ) : null}
        <View style={styles.statsRow}>
          <ThemedText style={[styles.metaText, { color: muted }]}>
            {post.comment_count} comments
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: muted }]}>
            {post.helpful_count} helpful
          </ThemedText>
          <ThemedText style={[styles.metaText, { color: muted }]}>
            {post.net_votes} score
          </ThemedText>
          {post.viewer_has_saved ? (
            <ThemedText style={[styles.metaText, { color: muted }]}>Saved</ThemedText>
          ) : null}
        </View>
      </SectionCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  preview: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
});
