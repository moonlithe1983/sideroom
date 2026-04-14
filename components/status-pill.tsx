import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type StatusPillProps = {
  label: string;
  tone: 'default' | 'success' | 'warning';
};

export function StatusPill({ label, tone }: StatusPillProps) {
  const tint = useThemeColor({}, 'tint');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');

  const color = tone === 'success' ? success : tone === 'warning' ? warning : tint;

  return (
    <View style={[styles.pill, { backgroundColor: surfaceAlt, borderColor: color }]}>
      <ThemedText type="defaultSemiBold" style={[styles.label, { color }]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 30,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
  },
});
