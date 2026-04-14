import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { StateMessage } from '@/components/state-message';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

function getStatusCopy(status: 'suspended' | 'banned') {
  if (status === 'banned') {
    return {
      body: 'This account can no longer use SideRoom. Access to the community is blocked at the app level so moderation status is clear instead of looking like broken navigation or missing data.',
      label: 'Account banned',
      title: 'This account is no longer allowed to use SideRoom.',
    };
  }

  return {
    body: 'This account is temporarily paused while the moderation team reviews recent activity. Community actions stay blocked until the account returns to active status.',
    label: 'Account suspended',
    title: 'This account is temporarily paused.',
  };
}

export function AccountStatusScreen() {
  const auth = useAppAuth();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const status = auth.account?.status === 'banned' ? 'banned' : 'suspended';
  const copy = getStatusCopy(status);

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label={copy.label} tone="warning" />
        <ThemedText type="title" style={styles.heroTitle}>
          {copy.title}
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>{copy.body}</ThemedText>
      </View>

      <SectionCard eyebrow="Account" title="Current account status">
        <ThemedText style={{ color: muted }}>Email: {auth.user?.email ?? 'Unavailable'}</ThemedText>
        <ThemedText style={{ color: muted }}>Handle: @{auth.profile?.handle ?? 'not set'}</ThemedText>
        <ThemedText style={{ color: muted }}>Role: {auth.account?.role ?? 'user'}</ThemedText>
        <ThemedText style={{ color: muted }}>Status: {auth.account?.status ?? status}</ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Session" title="What you can do here">
        <StateMessage
          message="This screen is intentionally explicit so moderation restrictions never look like a broken app or missing content."
          title="Clear next step"
          tone="warning"
        />
        <PrimaryButton
          accessibilityHint="Signs this account out on the current device."
          label="Sign out"
          onPress={() => void auth.signOut()}
          tone="secondary"
        />
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
});
