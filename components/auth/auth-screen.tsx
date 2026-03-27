import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { PrimaryButton } from '@/components/primary-button';
import { SectionCard } from '@/components/section-card';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { ThemedTextInput } from '@/components/themed-text-input';
import { disclaimerText } from '@/constants/project-status';
import { useThemeColor } from '@/hooks/use-theme-color';

export function AuthScreen() {
  const auth = useAppAuth();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');
  const [email, setEmail] = useState(auth.lastMagicLinkEmail ?? '');
  const [pendingMethod, setPendingMethod] = useState<'google' | 'magic-link' | null>(null);

  async function handleMagicLinkSubmit() {
    setPendingMethod('magic-link');
    try {
      await auth.signInWithMagicLink(email);
    } finally {
      setPendingMethod(null);
    }
  }

  async function handleProviderSubmit(provider: 'google') {
    setPendingMethod(provider);
    try {
      await auth.signInWithProvider(provider);
    } finally {
      setPendingMethod(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Private beta sign-in" tone="success" />
        <ThemedText type="title" style={styles.heroTitle}>
          Sign in securely before posting.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          Email magic links remain the safest fallback, and Google sign-in is now wired into the
          Android auth flow for faster re-entry once the provider is enabled in Supabase.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Secure Sign-In" title="Choose the easiest way back into SideRoom">
        <ThemedText style={{ color: muted }}>
          Use Google for quick sign-in, or request a one-time email link if you prefer the most
          explicit recovery path.
        </ThemedText>
        <View style={styles.actions}>
          <PrimaryButton
            disabled={pendingMethod !== null}
            label={pendingMethod === 'google' ? 'Connecting to Google...' : 'Continue with Google'}
            onPress={() => void handleProviderSubmit('google')}
            tone="secondary"
          />
        </View>
        <ThemedText style={[styles.helper, { color: muted }]}>
          Provider sign-in depends on Google being enabled in the Supabase dashboard for the active
          project.
        </ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Email Magic Link" title="Send a one-time sign-in link">
        <ThemedText style={{ color: muted }}>
          Use the email address tied to your account. Opening the link will route back into the app
          and finish sign-in through Supabase.
        </ThemedText>
        <ThemedTextInput
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect={false}
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="you@example.com"
          value={email}
        />
        <PrimaryButton
          disabled={pendingMethod !== null || email.trim().length === 0}
          label={
            pendingMethod === 'magic-link' ? 'Sending secure link...' : 'Send secure sign-in link'
          }
          onPress={() => void handleMagicLinkSubmit()}
        />
        {auth.notice ? (
          <ThemedText style={[styles.message, { color: muted }]}>{auth.notice}</ThemedText>
        ) : null}
        {auth.authError ? (
          <ThemedText style={[styles.message, { color: danger }]}>{auth.authError}</ThemedText>
        ) : null}
      </SectionCard>

      <SectionCard eyebrow="Provider Setup" title="What still needs to be enabled on the backend">
        <ThemedText style={{ color: muted }}>
          Add `sideroom://auth/callback` to Supabase auth redirects, enable Google in the Supabase
          provider settings, and then validate the flow end to end on real Android devices.
        </ThemedText>
      </SectionCard>

      <SectionCard eyebrow="Safety Boundary" title="Required product disclaimer">
        <ThemedText style={{ color: muted }}>{disclaimerText}</ThemedText>
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
  message: {
    fontSize: 14,
    lineHeight: 21,
  },
  helper: {
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    gap: 12,
  },
});
