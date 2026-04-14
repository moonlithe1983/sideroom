import { useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type PrimaryButtonProps = {
  accessibilityHint?: string;
  accessibilityLabel?: string;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'danger';
  busy?: boolean;
};

export function PrimaryButton({
  accessibilityHint,
  accessibilityLabel,
  busy = false,
  label,
  onPress,
  disabled = false,
  tone = 'primary',
}: PrimaryButtonProps) {
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const focusRing = useThemeColor({}, 'focusRing');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const tint = useThemeColor({}, 'tint');
  const [isFocused, setIsFocused] = useState(false);

  const backgroundColor =
    tone === 'primary' ? tint : tone === 'danger' ? danger : surfaceAlt;
  const textColor = tone === 'primary' || tone === 'danger' ? '#FFF9F1' : tint;

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy, disabled }}
      disabled={disabled}
      onBlur={() => setIsFocused(false)}
      onFocus={() => setIsFocused(true)}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: isFocused
            ? focusRing
            : tone === 'primary'
              ? tint
              : tone === 'danger'
                ? danger
                : border,
          borderWidth: isFocused ? 2 : 1,
          opacity: disabled ? 0.45 : pressed ? 0.84 : 1,
        },
      ]}>
      <ThemedText type="defaultSemiBold" style={[styles.label, { color: textColor }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: 18,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
  },
});
