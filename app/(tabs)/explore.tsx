import { Link, type Href, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { PostCard } from '@/components/community/post-card';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { StatusPill } from '@/components/status-pill';
import { useAppSecurity } from '@/components/security/app-security-provider';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { getMyPosts, getSavedPosts } from '@/lib/community/api';
import { formatRelativeTime } from '@/lib/format/relative-time';
import type { CommunityProfilePost } from '@/types/community';

function getPostStatusBadge(post: CommunityProfilePost) {
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

  return {
    label: 'Open',
    tone: 'default' as const,
  };
}

function getModerationBadge(post: CommunityProfilePost) {
  if (post.moderation_status === 'clean') {
    return null;
  }

  if (post.moderation_status === 'under_review') {
    return {
      label: 'Under review',
      tone: 'warning' as const,
    };
  }

  if (post.moderation_status === 'flagged') {
    return {
      label: 'Flagged',
      tone: 'warning' as const,
    };
  }

  return {
    label: 'Moderated',
    tone: 'warning' as const,
  };
}

export default function ProfileScreen() {
  const auth = useAppAuth();
  const router = useRouter();
  const security = useAppSecurity();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');
  const [savedPosts, setSavedPosts] = useState<CommunityProfilePost[]>([]);
  const [myPosts, setMyPosts] = useState<CommunityProfilePost[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState<string | null>(null);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    setActivityError(null);

    try {
      const [nextSavedPosts, nextMyPosts] = await Promise.all([getSavedPosts(), getMyPosts()]);
      setSavedPosts(nextSavedPosts);
      setMyPosts(nextMyPosts);
    } catch (loadError) {
      setActivityError(loadError instanceof Error ? loadError.message : 'Could not load your SideRoom activity.');
    } finally {
      setActivityLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadActivity();
    }, [loadActivity])
  );

  const activeOwnPosts = myPosts.filter((post) => post.status !== 'removed').length;
  const moderatedOwnPosts = myPosts.filter((post) => post.moderation_status !== 'clean').length;

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Account" tone="success" />
        <ThemedText type="title" style={styles.heroTitle}>
          @{auth.profile?.handle ?? 'handle'}
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          {auth.user?.email ?? 'No email loaded'} | Role {auth.account?.role ?? 'user'} | Status{' '}
          {auth.account?.status ?? 'active'}
        </ThemedText>
      </View>

      <SectionCard eyebrow="Your SideRoom" title="Revisit what you saved and what you asked">
        <View style={styles.pillRow}>
          <StatusPill label={`${savedPosts.length} saved`} tone="default" />
          <StatusPill label={`${activeOwnPosts} active posts`} tone="success" />
          <StatusPill
            label={
              moderatedOwnPosts === 0 ? 'No moderated posts' : `${moderatedOwnPosts} moderation updates`
            }
            tone={moderatedOwnPosts === 0 ? 'success' : 'warning'}
          />
        </View>
        <ThemedText style={{ color: muted }}>
          This tab is where the MVP starts feeling sticky: people can come back to saved advice,
          track their own threads, and understand any moderation changes without guessing.
        </ThemedText>
        {activityLoading ? (
          <ThemedText style={{ color: muted }}>Loading your saved posts and authored threads...</ThemedText>
        ) : null}
        {activityError ? <ThemedText style={{ color: danger }}>{activityError}</ThemedText> : null}
      </SectionCard>

      <SectionCard eyebrow="Saved" title="Posts worth revisiting">
        {!activityLoading && !activityError && savedPosts.length === 0 ? (
          <ThemedText style={{ color: muted }}>
            You have not saved any posts yet. Save thoughtful threads from the feed so they are easy
            to revisit later.
          </ThemedText>
        ) : null}
        {savedPosts.map((post) => (
          <PostCard
            badges={
              post.saved_at
                ? [
                    {
                      label: `Saved ${formatRelativeTime(post.saved_at)}`,
                      tone: 'default',
                    },
                  ]
                : []
            }
            key={`saved-${post.post_id}`}
            onPress={() => router.push(`/post/${post.post_id}`)}
            post={post}
          />
        ))}
      </SectionCard>

      <SectionCard eyebrow="Your Posts" title="Questions and updates you authored">
        {!activityLoading && !activityError && myPosts.length === 0 ? (
          <ThemedText style={{ color: muted }}>
            You have not posted yet. The Ask tab is ready whenever you want to start a conversation.
          </ThemedText>
        ) : null}
        {myPosts.some((post) => post.status === 'removed' || post.moderation_status !== 'clean') ? (
          <ThemedText style={{ color: muted }}>
            Moderation-related status changes stay visible here so your own content never seems to
            vanish without context.
          </ThemedText>
        ) : null}
        {myPosts.map((post) => {
          const moderationBadge = getModerationBadge(post);
          const badges = [getPostStatusBadge(post), ...(moderationBadge ? [moderationBadge] : [])];

          return (
            <PostCard
              badges={badges}
              disabled={post.status === 'removed'}
              key={`mine-${post.post_id}`}
              onPress={() => {
                if (post.status !== 'removed') {
                  router.push(`/post/${post.post_id}`);
                }
              }}
              post={post}
              showStatusBadge={false}
            />
          );
        })}
      </SectionCard>

      <SectionCard eyebrow="Privacy" title="Current device and app protections">
        <View style={styles.pillRow}>
          <StatusPill
            label={security.snapshot.secureStorageAvailable ? 'Encrypted storage ready' : 'Secure storage limited'}
            tone={security.snapshot.secureStorageAvailable ? 'success' : 'warning'}
          />
          <StatusPill
            label={security.snapshot.screenCaptureBlocked ? 'Screen capture blocked' : 'Capture not confirmed'}
            tone={security.snapshot.screenCaptureBlocked ? 'success' : 'warning'}
          />
          <StatusPill
            label={security.snapshot.appLockEnabled ? 'Biometric relock on' : 'Biometric relock unavailable'}
            tone={security.snapshot.appLockEnabled ? 'success' : 'warning'}
          />
        </View>
        {security.snapshot.warnings.map((warning) => (
          <ThemedText key={warning} style={{ color: muted }}>
            {warning}
          </ThemedText>
        ))}
      </SectionCard>

      <SectionCard eyebrow="Community Identity" title="How your account appears in SideRoom">
        <ThemedText style={{ color: muted }}>
          Public handle: @{auth.profile?.handle ?? 'not set'}
        </ThemedText>
        <ThemedText style={{ color: muted }}>
          Topics available in the app: {auth.topics.length}
        </ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Trust Center" title="Privacy, moderation, and product boundaries">
        <ThemedText style={{ color: muted }}>
          Review the plain-English trust summary before launch: what we already protect, what
          moderators can act on, and what still needs to be finalized before the public app-store release.
        </ThemedText>
        <Link href={'/trust' as Href} style={styles.link}>
          <ThemedText type="link">Open the Trust Center</ThemedText>
        </Link>
        <Link href={'/policies' as Href} style={styles.link}>
          <ThemedText type="link">Open Policies and Support</ThemedText>
        </Link>
        <Link href="/modal" style={styles.link}>
          <ThemedText type="link">Review the safety disclaimer</ThemedText>
        </Link>
      </SectionCard>

      <SectionCard eyebrow="Session" title="Account controls">
        <ThemedText style={{ color: muted }}>
          Last seen: {auth.account?.last_seen_at ? new Date(auth.account.last_seen_at).toLocaleString() : 'Unknown'}
        </ThemedText>
        <PrimaryButton label="Sign out" onPress={() => void auth.signOut()} tone="secondary" />
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
  hero: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 24,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  link: {
    alignSelf: 'flex-start',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
