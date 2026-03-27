import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type SectionCardProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
}>;

export function SectionCard({ children, eyebrow, title }: SectionCardProps) {
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const surface = useThemeColor({}, 'surface');

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <ThemedText type="defaultSemiBold" style={[styles.eyebrow, { color: muted }]}>
        {eyebrow}
      </ThemedText>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  eyebrow: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
  content: {
    gap: 14,
  },
});
