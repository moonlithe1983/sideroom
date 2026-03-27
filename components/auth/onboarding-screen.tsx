import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { SelectableChip } from '@/components/selectable-chip';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { disclaimerText } from '@/constants/project-status';
import { useThemeColor } from '@/hooks/use-theme-color';

export function OnboardingScreen() {
  const auth = useAppAuth();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');
  const [handle, setHandle] = useState(auth.profile?.handle ?? '');
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleValidityMessage = useMemo(() => {
    const normalizedHandle = handle.trim().toLowerCase();

    if (normalizedHandle.length === 0) {
      return 'Pick a public handle for replies and non-anonymous posts.';
    }

    return /^[a-z0-9_]{3,24}$/.test(normalizedHandle)
      ? 'Handle format looks good.'
      : 'Use 3 to 24 characters with letters, numbers, or underscores only.';
  }, [handle]);

  function toggleTopic(topicId: string) {
    setSelectedTopicIds((currentIds) =>
      currentIds.includes(topicId)
        ? currentIds.filter((id) => id !== topicId)
        : currentIds.length >= 5
          ? currentIds
          : [...currentIds, topicId]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await auth.completeOnboarding({
        handle,
        topicIds: selectedTopicIds,
      });
    } finally {
      setSubmitting(false);
    }
  }

  const canSubmit =
    /^[a-z0-9_]{3,24}$/.test(handle.trim().toLowerCase()) &&
    selectedTopicIds.length >= 3 &&
    selectedTopicIds.length <= 5 &&
    auth.topics.length > 0;

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Complete secure setup" tone="success" />
        <ThemedText type="title" style={styles.heroTitle}>
          Finish the first-run onboarding.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          Your internal account already exists for moderation and safety. Now choose the public
          handle and topics that make the first feed useful from day one.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Public Handle" title="Choose how your non-anonymous posts appear">
        <ThemedText style={{ color: muted }}>
          This handle is public. Anonymous posts stay traceable to moderators, but not to the
          public feed.
        </ThemedText>
        <ThemedTextInput
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={24}
          onChangeText={setHandle}
          placeholder="sideroom_friend"
          value={handle}
        />
        <ThemedText
          style={[
            styles.helper,
            { color: /^[a-z0-9_]{3,24}$/.test(handle.trim().toLowerCase()) ? muted : danger },
          ]}>
          {handleValidityMessage}
        </ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Topics" title="Pick 3 to 5 topics to shape the first feed">
        <ThemedText style={{ color: muted }}>
          The launch brief calls for a utility-first feed. Starting with strong topic follows helps
          SideRoom feel relevant immediately.
        </ThemedText>
        {auth.topics.length === 0 ? (
          <ThemedText style={{ color: danger }}>
            No topics are available yet. Apply the initial Supabase migration so the seeded launch
            topics exist before onboarding.
          </ThemedText>
        ) : null}
        <View style={styles.topicGrid}>
          {auth.topics.map((topic) => (
            <SelectableChip
              key={topic.id}
              label={topic.name}
              onPress={() => toggleTopic(topic.id)}
              selected={selectedTopicIds.includes(topic.id)}
            />
          ))}
        </View>
        <ThemedText style={[styles.helper, { color: muted }]}>
          {selectedTopicIds.length}/5 selected
        </ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Safety Notice" title="This must be accepted before the account is active">
        <ThemedText style={{ color: muted }}>{disclaimerText}</ThemedText>
        <PrimaryButton
          disabled={!canSubmit || submitting}
          label={submitting ? 'Securing your profile...' : 'Finish secure setup'}
          onPress={() => void handleSubmit()}
        />
        {auth.notice ? (
          <ThemedText style={[styles.helper, { color: muted }]}>{auth.notice}</ThemedText>
        ) : null}
        {auth.authError ? (
          <ThemedText style={[styles.helper, { color: danger }]}>{auth.authError}</ThemedText>
        ) : null}
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
  helper: {
    fontSize: 14,
    lineHeight: 21,
  },
});
