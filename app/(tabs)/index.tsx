import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { PostCard } from '@/components/community/post-card';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { SelectableChip } from '@/components/selectable-chip';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { getFeedPosts } from '@/lib/community/api';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { CommunityFeedPost } from '@/types/community';

export default function HomeScreen() {
  const auth = useAppAuth();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [posts, setPosts] = useState<CommunityFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextPosts = await getFeedPosts(selectedTopicId);
      setPosts(nextPosts);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Could not load the feed.');
    } finally {
      setLoading(false);
    }
  }, [selectedTopicId]);

  useFocusEffect(
    useCallback(() => {
      void loadFeed();
    }, [loadFeed])
  );

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Home feed" tone="success" />
        <ThemedText type="title" style={styles.heroTitle}>
          Ask honestly. Get useful answers.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          Welcome back{auth.profile?.handle ? `, @${auth.profile.handle}` : ''}. The feed is built
          to surface practical questions and helpful replies without exposing real-world identity.
        </ThemedText>
        <PrimaryButton label="Ask a question" onPress={() => router.push('/create')} />
      </View>

      <SectionCard eyebrow="Topics" title="Filter the feed by the areas you care about most">
        <View style={styles.topicGrid}>
          <SelectableChip
            label="All topics"
            onPress={() => setSelectedTopicId(null)}
            selected={selectedTopicId === null}
          />
          {auth.topics.map((topic) => (
            <SelectableChip
              key={topic.id}
              label={topic.name}
              onPress={() => setSelectedTopicId(topic.id)}
              selected={selectedTopicId === topic.id}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard eyebrow="Live Feed" title="Recent questions and discussions">
        {loading ? (
          <ThemedText style={{ color: muted }}>Loading the latest SideRoom posts...</ThemedText>
        ) : null}
        {error ? (
          <ThemedText style={{ color: danger }}>{error}</ThemedText>
        ) : null}
        {!loading && !error && posts.length === 0 ? (
          <ThemedText style={{ color: muted }}>
            No posts are available yet. Seed the database or write the first post from the Ask tab.
          </ThemedText>
        ) : null}
        {posts.map((post) => (
          <PostCard
            key={post.post_id}
            onPress={() => router.push(`/post/${post.post_id}`)}
            post={post}
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
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
