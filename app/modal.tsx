import { Link, type Href } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';

import { SectionCard } from '@/components/section-card';
import { StateMessage } from '@/components/state-message';
import { ThemedText } from '@/components/themed-text';
import { disclaimerText, moderationTriggers } from '@/constants/project-status';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SafetyModalScreen() {
  const background = useThemeColor({}, 'background');
  const muted = useThemeColor({}, 'muted');

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <SectionCard
        eyebrow="Required Disclaimer"
        title="SideRoom is for peer discussion, not professional advice.">
        <ThemedText style={[styles.body, { color: muted }]}>{disclaimerText}</ThemedText>
      </SectionCard>

      <SectionCard
        eyebrow="Auto-Review Topics"
        title="Content that should trigger warning flows or moderator review.">
        <StateMessage
          message="If a post falls into one of these categories, users should report it and moderators should review it instead of relying on peer replies."
          title="When moderation should step in"
          tone="warning"
        />
        {moderationTriggers.map((item) => (
          <ThemedText key={item} style={[styles.body, { color: muted }]}>
            - {item}
          </ThemedText>
        ))}
      </SectionCard>

      <SectionCard eyebrow="Trust Center" title="See the fuller privacy and moderation picture.">
        <ThemedText style={[styles.body, { color: muted }]}>
          The Trust Center explains what SideRoom already protects, how reports are handled, and
          what still needs to be finished before public launch.
        </ThemedText>
        <Link href={'/trust' as Href}>
          <ThemedText type="link">Open the Trust Center</ThemedText>
        </Link>
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
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
