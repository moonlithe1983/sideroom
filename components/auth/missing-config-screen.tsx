import { ScrollView, StyleSheet, View } from 'react-native';

import { useAppAuth } from '@/components/auth/auth-provider';
import { SectionCard } from '@/components/section-card';
import { StateMessage } from '@/components/state-message';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

export function MissingConfigScreen() {
  const auth = useAppAuth();
  const background = useThemeColor({}, 'background');
  const accentSoft = useThemeColor({}, 'accentSoft');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');

  return (
    <ScrollView contentContainerStyle={[styles.content, { backgroundColor: background }]}>
      <View style={[styles.hero, { backgroundColor: accentSoft, borderColor: border }]}>
        <StatusPill label="Supabase setup required" tone="warning" />
        <ThemedText type="title" style={styles.heroTitle}>
          The backend foundation is scaffolded, but not configured yet.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: muted }]}>
          Add the missing environment variables, create the Supabase project, and apply the
          migrations before real auth and onboarding can run.
        </ThemedText>
      </View>

      <SectionCard eyebrow="Missing Environment" title="Variables still needed in local configuration">
        <StateMessage
          message="The app is working as designed: it stopped at setup instead of crashing because the backend values are still missing."
          title="Why you are seeing this screen"
          tone="warning"
        />
        {auth.missingEnv.map((variableName) => (
          <ThemedText key={variableName} type="defaultSemiBold">
            {variableName}
          </ThemedText>
        ))}
      </SectionCard>

      <SectionCard eyebrow="Next Setup" title="Complete these backend steps next">
        <ThemedText style={{ color: muted }}>1. Create a Supabase project.</ThemedText>
        <ThemedText style={{ color: muted }}>
          2. Add the redirect URL `sideroom://auth/callback`.
        </ThemedText>
        <ThemedText style={{ color: muted }}>
          3. Apply all SQL files in `supabase/migrations/` in order.
        </ThemedText>
        <ThemedText style={{ color: muted }}>
          4. Enable Google in Supabase before testing provider sign-in in the app.
        </ThemedText>
        <ThemedText style={{ color: muted }}>
          5. Copy `.env.example` to a local env file and fill in the publishable key and project
          URL.
        </ThemedText>
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
