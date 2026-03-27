import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { PostCard } from '@/components/community/post-card';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { SelectableChip } from '@/components/selectable-chip';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { useThemeColor } from '@/hooks/use-theme-color';
import { searchPosts } from '@/lib/community/api';
import type { CommunityFeedPost } from '@/types/community';

export default function SearchScreen() {
  const auth = useAppAuth();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');
  const [query, setQuery] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [results, setResults] = useState<CommunityFeedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (submittedQuery.length < 2) {
      return;
    }

    let isActive = true;

    async function loadResults() {
      setLoading(true);
      setError(null);

      try {
        const nextResults = await searchPosts(submittedQuery, selectedTopicId);

        if (isActive) {
          setResults(nextResults);
        }
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : 'Search failed.');
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    void loadResults();

    return () => {
      isActive = false;
    };
  }, [selectedTopicId, submittedQuery]);

  function handleSearch() {
    const nextQuery = query.trim();

    if (nextQuery.length < 2) {
      setHasSearched(false);
      setSubmittedQuery('');
      setResults([]);
      setError('Enter at least 2 characters to search posts.');
      return;
    }

    setHasSearched(true);
    setSubmittedQuery(nextQuery);
  }

  function handleClear() {
    setError(null);
    setHasSearched(false);
    setQuery('');
    setResults([]);
    setSubmittedQuery('');
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Search" tone="success" />
        <ThemedText type="title" style={styles.heroTitle}>
          Find practical advice fast.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          Search stays inside the privacy guardrails. Blocked accounts and flagged content are kept
          out of results automatically.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Query" title="Search titles, body text, and topics">
        <ThemedTextInput
          autoCapitalize="none"
          autoCorrect={false}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          placeholder="Try moving abroad, career pivot, family tension..."
          returnKeyType="search"
          value={query}
        />
        <View style={styles.buttonRow}>
          <PrimaryButton
            disabled={loading}
            label={loading ? 'Searching...' : 'Search'}
            onPress={handleSearch}
          />
          <PrimaryButton
            disabled={loading && !hasSearched}
            label="Clear"
            onPress={handleClear}
            tone="secondary"
          />
        </View>
      </SectionCard>

      <SectionCard eyebrow="Topics" title="Narrow results to a community area">
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

      <SectionCard
        eyebrow={hasSearched ? 'Results' : 'Guidance'}
        title={
          hasSearched
            ? `Matches for "${submittedQuery}"`
            : 'Search works best with a real-life situation or keyword'
        }>
        {!hasSearched ? (
          <>
            <ThemedText style={{ color: muted }}>
              Search questions like moving abroad, burnout, or dating after divorce to find
              threads people can actually use.
            </ThemedText>
            <ThemedText style={{ color: muted }}>
              Once the launch community is seeded, this will be one of the fastest ways to find
              helpful MVP content worth saving and sharing.
            </ThemedText>
          </>
        ) : null}
        {loading ? (
          <ThemedText style={{ color: muted }}>Searching the latest SideRoom posts...</ThemedText>
        ) : null}
        {error ? (
          <ThemedText style={{ color: danger }}>{error}</ThemedText>
        ) : null}
        {hasSearched && !loading && !error ? (
          <StatusPill
            label={results.length === 1 ? '1 result found' : `${results.length} results found`}
            tone={results.length > 0 ? 'success' : 'warning'}
          />
        ) : null}
        {hasSearched && !loading && !error && results.length === 0 ? (
          <ThemedText style={{ color: muted }}>
            No matches yet. Try a broader phrase, switch topics, or seed more launch content in the
            database.
          </ThemedText>
        ) : null}
        {results.map((post) => (
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
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
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
  heroBody: {
    fontSize: 16,
    lineHeight: 24,
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },
  topicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
});
