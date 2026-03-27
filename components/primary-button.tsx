import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type PrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'primary' | 'secondary' | 'danger';
};

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = 'primary',
}: PrimaryButtonProps) {
  const border = useThemeColor({}, 'border');
  const danger = useThemeColor({}, 'danger');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const tint = useThemeColor({}, 'tint');

  const backgroundColor =
    tone === 'primary' ? tint : tone === 'danger' ? danger : surfaceAlt;
  const textColor = tone === 'primary' || tone === 'danger' ? '#FFF9F1' : tint;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor,
          borderColor: tone === 'primary' ? tint : tone === 'danger' ? danger : border,
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
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  label: {
    fontSize: 15,
    lineHeight: 20,
  },
});
