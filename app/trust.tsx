import { Link, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { SectionCard } from '@/components/section-card';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import {
  launchTrustBlockers,
  moderationBoundaries,
  privacyPromises,
  reportFlow,
  trustCenterDisclaimer,
  trustCenterIntro,
} from '@/constants/trust-center';
import { useThemeColor } from '@/hooks/use-theme-color';

function TrustList({ items, muted }: { items: readonly string[]; muted: string }) {
  return (
    <View style={styles.list}>
      {items.map((item) => (
        <ThemedText key={item} style={[styles.body, { color: muted }]}>
          - {item}
        </ThemedText>
      ))}
    </View>
  );
}

export default function TrustCenterScreen() {
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Security-first" tone="success" />
        <StatusPill label="Moderated community" tone="default" />
        <StatusPill label="Beta trust work still open" tone="warning" />
        <ThemedText type="title" style={styles.heroTitle}>
          Trust Center
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>{trustCenterIntro}</ThemedText>
      </View>

      <SectionCard eyebrow="Privacy" title="What SideRoom already protects">
        <TrustList items={privacyPromises} muted={muted} />
      </SectionCard>

      <SectionCard eyebrow="Boundaries" title="What belongs here and what does not">
        <TrustList items={moderationBoundaries} muted={muted} />
      </SectionCard>

      <SectionCard eyebrow="Reports" title="What happens when someone flags content">
        <TrustList items={reportFlow} muted={muted} />
      </SectionCard>

      <SectionCard eyebrow="Plain-English Disclaimer" title="What SideRoom is not">
        <ThemedText style={[styles.body, { color: muted }]}>{trustCenterDisclaimer}</ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Before Public Launch" title="What still needs to be finished">
        <TrustList items={launchTrustBlockers} muted={muted} />
      </SectionCard>

      <SectionCard eyebrow="Policies" title="Legal links, support contact, and Play copy">
        <ThemedText style={[styles.body, { color: muted }]}>
          Open the policies and support screen to review the current repo-side launch metadata and
          replace any remaining placeholders before Google Play submission.
        </ThemedText>
        <Link href={'/policies' as Href}>
          <ThemedText type="link">Open Policies and Support</ThemedText>
        </Link>
      </SectionCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  body: {
    fontSize: 15,
    lineHeight: 22,
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
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },
  list: {
    gap: 10,
  },
});
