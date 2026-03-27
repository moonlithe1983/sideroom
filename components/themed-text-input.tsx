import { forwardRef } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export const ThemedTextInput = forwardRef<TextInput, TextInputProps>(function ThemedTextInput(
  props,
  ref
) {
  const border = useThemeColor({}, 'border');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');

  return (
    <TextInput
      placeholderTextColor={muted}
      ref={ref}
      selectionColor={tint}
      style={[
        styles.input,
        {
          backgroundColor: surface,
          borderColor: border,
          color: text,
        },
      ]}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    borderRadius: 18,
    borderWidth: 1,
    fontSize: 16,
    minHeight: 54,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
