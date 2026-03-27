import * as Linking from 'expo-linking';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { SectionCard } from '@/components/section-card';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import {
  googlePlayFullDescription,
  googlePlayShortDescription,
  hasPlaceholderMarketingUrl,
  hasPlaceholderPrivacyPolicyUrl,
  hasPlaceholderSupportEmail,
  hasPlaceholderSupportUrl,
  hasPlaceholderTermsUrl,
  marketingUrl,
  missingReleaseMetadataItems,
  privacyPolicyUrl,
  releaseMetadataStatus,
  supportEmail,
  supportUrl,
  termsUrl,
} from '@/constants/release-metadata';
import { useThemeColor } from '@/hooks/use-theme-color';

type LinkCardProps = {
  description: string;
  label: string;
  muted: string;
  url: string;
};

function LinkCard({ description, label, muted, url }: LinkCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void Linking.openURL(url)}
      style={({ pressed }) => [
        styles.linkCard,
        {
          opacity: pressed ? 0.82 : 1,
        },
      ]}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedText style={[styles.body, { color: muted }]}>{description}</ThemedText>
      <ThemedText type="link">{url}</ThemedText>
    </Pressable>
  );
}

export default function PoliciesScreen() {
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill
          label={releaseMetadataStatus.policyLinksReady ? 'Policy links ready' : 'Policy links pending'}
          tone={releaseMetadataStatus.policyLinksReady ? 'success' : 'warning'}
        />
        <StatusPill
          label={releaseMetadataStatus.supportContactReady ? 'Support contact ready' : 'Support contact pending'}
          tone={releaseMetadataStatus.supportContactReady ? 'success' : 'warning'}
        />
        <StatusPill
          label={releaseMetadataStatus.playListingCopyReady ? 'Play copy drafted' : 'Play copy missing'}
          tone={releaseMetadataStatus.playListingCopyReady ? 'success' : 'warning'}
        />
        <ThemedText type="title" style={styles.heroTitle}>
          Policies and Support
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          This screen is the repo-side source of truth for the links and copy Google Play will need
          before release.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Legal" title="Links that must be live before launch">
        <LinkCard
          description={
            hasPlaceholderPrivacyPolicyUrl
              ? 'This is still a placeholder and must be replaced with the real privacy policy.'
              : 'Open the live privacy policy URL.'
          }
          label="Privacy policy"
          muted={muted}
          url={privacyPolicyUrl}
        />
        <LinkCard
          description={
            hasPlaceholderTermsUrl
              ? 'This is still a placeholder and must be replaced with the real terms URL.'
              : 'Open the live terms URL.'
          }
          label="Terms"
          muted={muted}
          url={termsUrl}
        />
      </SectionCard>

      <SectionCard eyebrow="Support" title="How users and reviewers can reach us">
        <LinkCard
          description={
            hasPlaceholderSupportEmail
              ? 'This placeholder email must be replaced before beta or store review.'
              : 'Email support using the configured support mailbox.'
          }
          label="Support email"
          muted={muted}
          url={`mailto:${supportEmail}`}
        />
        <LinkCard
          description={
            hasPlaceholderSupportUrl
              ? 'This placeholder support URL must be replaced before launch.'
              : 'Open the support site or contact page.'
          }
          label="Support URL"
          muted={muted}
          url={supportUrl}
        />
        <LinkCard
          description={
            hasPlaceholderMarketingUrl
              ? 'This placeholder marketing URL should be replaced with the live landing page.'
              : 'Open the public landing or marketing page.'
          }
          label="Marketing URL"
          muted={muted}
          url={marketingUrl}
        />
      </SectionCard>

      <SectionCard eyebrow="Play Listing" title="Draft copy already prepared in the repo">
        <ThemedText type="defaultSemiBold">Short description</ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          {googlePlayShortDescription}
        </ThemedText>
        <ThemedText type="defaultSemiBold">Full description</ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          {googlePlayFullDescription}
        </ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Still Missing" title="What must still be replaced before submission">
        {missingReleaseMetadataItems.length === 0 ? (
          <ThemedText style={[styles.body, { color: muted }]}>
            No repo-local metadata placeholders remain.
          </ThemedText>
        ) : (
          missingReleaseMetadataItems.map((item) => (
            <ThemedText key={item} style={[styles.body, { color: muted }]}>
              - {item}
            </ThemedText>
          ))
        )}
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
  linkCard: {
    gap: 8,
  },
});
