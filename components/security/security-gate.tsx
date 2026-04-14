import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { useAppSecurity } from '@/components/security/app-security-provider';
import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type SecurityGateProps = {
  loading?: boolean;
};

export function SecurityGate({ loading = false }: SecurityGateProps) {
  const security = useAppSecurity();
  const backdrop = useThemeColor({}, 'overlay');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={[styles.overlay, { backgroundColor: backdrop }]}>
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <StatusPill label="Private data shield" tone="success" />
        <ThemedText type="title" style={styles.title}>
          {loading ? 'Hardening SideRoom...' : 'SideRoom is locked'}
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>
          {loading
            ? 'Checking secure storage, biometric strength, and screenshot protection before loading the app.'
            : 'Use strong device authentication to open SideRoom. Sensitive content stays hidden whenever the app backgrounds or the device lock changes.'}
        </ThemedText>

        <View style={styles.pillRow}>
          <StatusPill
            label={security.snapshot.secureStorageAvailable ? 'Encrypted local storage' : 'No secure storage'}
            tone={security.snapshot.secureStorageAvailable ? 'success' : 'warning'}
          />
          <StatusPill
            label={security.snapshot.screenCaptureBlocked ? 'Capture blocked' : 'Capture unverified'}
            tone={security.snapshot.screenCaptureBlocked ? 'success' : 'warning'}
          />
        </View>

        {loading ? (
          <ActivityIndicator
            accessibilityLabel="Checking device protections"
            color={tint}
            size="large"
            style={styles.spinner}
          />
        ) : (
          <Pressable
            accessibilityHint="Uses the device's secure unlock method before SideRoom content becomes visible."
            accessibilityLabel="Unlock with device security"
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: tint }]}
            onPress={() => void security.unlockApp()}>
            <ThemedText type="defaultSemiBold" style={styles.buttonLabel}>
              Unlock with device security
            </ThemedText>
          </Pressable>
        )}

        {security.lastUnlockError ? (
          <ThemedText style={[styles.error, { color: muted }]}>{security.lastUnlockError}</ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 16,
    maxWidth: 480,
    padding: 24,
    width: '100%',
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  spinner: {
    marginVertical: 8,
  },
  button: {
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  buttonLabel: {
    color: '#FFF9F1',
  },
  error: {
    fontSize: 14,
    lineHeight: 21,
  },
});
