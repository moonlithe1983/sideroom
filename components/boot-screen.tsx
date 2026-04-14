import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { StatusPill } from '@/components/status-pill';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type BootScreenProps = {
  title: string;
  body: string;
  eyebrow?: string;
};

export function BootScreen({
  title,
  body,
  eyebrow = 'Preparing SideRoom',
}: BootScreenProps) {
  const background = useThemeColor({}, 'background');
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const tint = useThemeColor({}, 'tint');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={[styles.screen, { backgroundColor: background }]}>
      <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
        <StatusPill label={eyebrow} tone="default" />
        <ThemedText type="title" style={styles.title}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.body, { color: muted }]}>{body}</ThemedText>
        <ActivityIndicator
          accessibilityLabel="Loading SideRoom"
          color={tint}
          size="large"
          style={styles.spinner}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    borderRadius: 28,
    borderWidth: 1,
    gap: 16,
    maxWidth: 520,
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
  spinner: {
    marginTop: 8,
  },
});
