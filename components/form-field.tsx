import { type PropsWithChildren } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

type FormFieldProps = PropsWithChildren<{
  errorText?: string | null;
  helperText?: string | null;
  label: string;
  required?: boolean;
}>;

export function FormField({
  children,
  errorText,
  helperText,
  label,
  required = false,
}: FormFieldProps) {
  const danger = useThemeColor({}, 'danger');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.field}>
      <ThemedText type="defaultSemiBold" style={styles.label}>
        {label}
        {required ? ' *' : ''}
      </ThemedText>
      {helperText ? (
        <ThemedText style={[styles.helper, { color: muted }]}>{helperText}</ThemedText>
      ) : null}
      {children}
      {errorText ? (
        <ThemedText
          accessibilityLiveRegion="polite"
          style={[styles.error, { color: danger }]}>
          {errorText}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 14,
    lineHeight: 21,
  },
  field: {
    gap: 8,
  },
  helper: {
    fontSize: 14,
    lineHeight: 21,
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
  },
});
