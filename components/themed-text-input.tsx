import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, type TextInputProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export const ThemedTextInput = forwardRef<TextInput, TextInputProps>(function ThemedTextInput(
  { onBlur, onFocus, style, ...props },
  ref
) {
  const border = useThemeColor({}, 'border');
  const focusRing = useThemeColor({}, 'focusRing');
  const surface = useThemeColor({}, 'surface');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');
  const tint = useThemeColor({}, 'tint');
  const [isFocused, setIsFocused] = useState(false);

  return (
    <TextInput
      allowFontScaling
      maxFontSizeMultiplier={2}
      placeholderTextColor={muted}
      ref={ref}
      selectionColor={tint}
      onBlur={(event) => {
        setIsFocused(false);
        onBlur?.(event);
      }}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      style={[
        styles.input,
        {
          backgroundColor: surface,
          borderColor: isFocused ? focusRing : border,
          color: text,
          borderWidth: isFocused ? 2 : 1,
        },
        style,
      ]}
      {...props}
    />
  );
});

const styles = StyleSheet.create({
  input: {
    borderRadius: 18,
    fontSize: 16,
    lineHeight: 24,
    minHeight: 56,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
