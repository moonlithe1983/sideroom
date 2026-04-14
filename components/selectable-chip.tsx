import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type SelectableChipProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function SelectableChip({
  accessibilityHint,
  accessibilityLabel,
  label,
  onPress,
  selected,
}: SelectableChipProps) {
  const border = useThemeColor({}, 'border');
  const focusRing = useThemeColor({}, 'focusRing');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const tint = useThemeColor({}, 'tint');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? tint : surfaceAlt,
          borderColor: isFocused ? focusRing : selected ? tint : border,
          borderWidth: isFocused ? 2 : 1,
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
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
  },
});
