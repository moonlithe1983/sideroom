import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type StateMessageTone = 'default' | 'success' | 'warning' | 'danger';

type StateMessageProps = {
  actionHint?: string;
  actionLabel?: string;
  message: string;
  onAction?: () => void;
  title: string;
  tone?: StateMessageTone;
};

export function StateMessage({
  actionHint,
  actionLabel,
  message,
  onAction,
  title,
  tone = 'default',
}: StateMessageProps) {
  const border = useThemeColor({}, 'border');
  const surfaceAlt = useThemeColor({}, 'surfaceAlt');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const success = useThemeColor({}, 'success');
  const warning = useThemeColor({}, 'warning');
  const danger = useThemeColor({}, 'danger');
  const focusRing = useThemeColor({}, 'focusRing');
  const [isFocused, setIsFocused] = useState(false);

  const accentColor =
    tone === 'success' ? success : tone === 'warning' ? warning : tone === 'danger' ? danger : tint;

  return (
    <View
      accessibilityLiveRegion="polite"
      style={[
        styles.card,
        {
          backgroundColor: surfaceAlt,
          borderColor: accentColor || border,
        },
      ]}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.message, { color: muted }]}>{message}</ThemedText>
      {actionLabel && onAction ? (
        <Pressable
          accessibilityHint={actionHint}
          accessibilityLabel={actionLabel}
          accessibilityRole="button"
          onBlur={() => setIsFocused(false)}
          onFocus={() => setIsFocused(true)}
          onPress={onAction}
          style={({ pressed }) => [
            styles.action,
            {
              borderColor: isFocused ? focusRing : accentColor,
              opacity: pressed ? 0.84 : 1,
            },
          ]}>
          <ThemedText type="defaultSemiBold" style={{ color: accentColor }}>
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  action: {
    alignSelf: 'flex-start',
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    gap: 10,
    padding: 16,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
  },
  title: {
    fontSize: 16,
    lineHeight: 22,
  },
});
