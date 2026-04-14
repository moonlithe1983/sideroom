import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { FormField } from '@/components/form-field';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { SelectableChip } from '@/components/selectable-chip';
import { StateMessage } from '@/components/state-message';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { disclaimerText } from '@/constants/project-status';
import { createPost } from '@/lib/community/api';
import { announceForAccessibility } from '@/lib/accessibility/announce';
import { useThemeColor } from '@/hooks/use-theme-color';
import type { CommunityFeedPost } from '@/types/community';

const postTypes: { label: string; value: CommunityFeedPost['post_type'] }[] = [
  { label: 'Question', value: 'question' },
  { label: 'Advice request', value: 'advice_request' },
  { label: 'Poll', value: 'poll' },
  { label: 'Story', value: 'story' },
  { label: 'Update', value: 'update' },
];

export default function CreatePostScreen() {
  const auth = useAppAuth();
  const router = useRouter();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(auth.topics[0]?.id ?? null);
  const [postType, setPostType] = useState<CommunityFeedPost['post_type']>('question');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!selectedTopicId) {
      setError('Choose a topic before posting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const postId = await createPost({
        body,
        isAnonymous,
        postType,
        title,
        topicId: selectedTopicId,
      });
      void announceForAccessibility('Post created. Opening your new thread.');
      router.push(`/post/${postId}`);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Could not publish your post.');
      void announceForAccessibility(
        submitError instanceof Error ? submitError.message : 'Could not publish your post.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit = selectedTopicId && title.trim().length >= 6 && title.trim().length <= 160;

  return (
    <ScrollView
      contentContainerStyle={[styles.content, { backgroundColor: background }]}
      keyboardShouldPersistTaps="handled">
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Create post" tone="success" />
        <ThemedText type="title" style={styles.heroTitle}>
          Write the question you would not ask publicly.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          Anonymous posting hides your public handle from the feed, but moderators can still trace
          content back to your internal account when safety requires it.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Topic" title="Choose where this should live">
        <View style={styles.chipGrid}>
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

      <SectionCard eyebrow="Post Type" title="Pick the best format for the conversation">
        <View style={styles.chipGrid}>
          {postTypes.map((option) => (
            <SelectableChip
              key={option.value}
              label={option.label}
              onPress={() => setPostType(option.value)}
              selected={postType === option.value}
            />
          ))}
        </View>
      </SectionCard>

      <SectionCard eyebrow="Identity" title="Choose how this post appears in public">
        <View style={styles.chipGrid}>
          <SelectableChip
            accessibilityHint="Keeps your public handle off the post while moderators can still trace it internally."
            label="Post anonymously"
            onPress={() => setIsAnonymous(true)}
            selected={isAnonymous}
          />
          <SelectableChip
            accessibilityHint="Shows your public handle on the post."
            label={`Post as @${auth.profile?.handle ?? 'your_handle'}`}
            onPress={() => setIsAnonymous(false)}
            selected={!isAnonymous}
          />
        </View>
        <StateMessage
          message={
            isAnonymous
              ? 'Anonymous posts hide your public handle from other members. Moderators can still trace the post internally if safety review is needed.'
              : `This post will show publicly as @${auth.profile?.handle ?? 'your_handle'}.`
          }
          title="How this identity setting works"
          tone={isAnonymous ? 'warning' : 'default'}
        />
      </SectionCard>

      <SectionCard eyebrow="Write" title="Describe what you need help with">
        <FormField
          helperText="Aim for a clear, specific title so people know what kind of help you need."
          label="Post title"
          required>
          <ThemedTextInput
            accessibilityHint="Enter a short summary of the question or situation."
            accessibilityLabel="Post title"
            maxLength={160}
            onChangeText={setTitle}
            placeholder="How do I talk to my boss about burnout without sounding unreliable?"
            value={title}
          />
        </FormField>
        <FormField
          helperText="Context is optional but helps people give more useful answers."
          label="Post details">
          <ThemedTextInput
            accessibilityHint="Add optional context for the people replying to your post."
            accessibilityLabel="Post details"
            multiline
            onChangeText={setBody}
            placeholder="Add context if it will help people give better answers."
            style={styles.bodyInput}
            textAlignVertical="top"
            value={body}
          />
        </FormField>
        <ThemedText style={[styles.helper, { color: muted }]}>
          {title.trim().length}/160 title characters
        </ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Safety Notice" title="Every post must stay inside the product boundary">
        <ThemedText style={{ color: muted }}>{disclaimerText}</ThemedText>
        {error ? <StateMessage message={error} title="Post could not be published" tone="danger" /> : null}
        {!canSubmit ? (
          <ThemedText style={{ color: muted }}>
            Choose a topic and write a title with 6 to 160 characters before posting.
          </ThemedText>
        ) : null}
        <PrimaryButton
          accessibilityHint="Publishes this post using the topic and identity settings above."
          busy={submitting}
          disabled={!canSubmit || submitting}
          label={submitting ? 'Publishing securely...' : 'Publish post'}
          onPress={() => void handleSubmit()}
        />
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bodyInput: {
    minHeight: 180,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  content: {
    gap: 16,
    padding: 20,
    paddingBottom: 32,
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
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
});
