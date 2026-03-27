import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type SelectableChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectableChip({ label, onPress, selected }: SelectableChipProps) {
  const border = useThemeColor({}, 'border');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const tint = useThemeColor({}, 'tint');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? tint : surfaceAlt,
          borderColor: selected ? tint : border,
          opacity: pressed ? 0.82 : 1,
        },
      ]}>
      <ThemedText
        type="defaultSemiBold"
        style={[styles.label, { color: selected ? '#FFF9F1' : tint }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 14,
    lineHeight: 18,
  },
});
