/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#1F6A56';
const tintColorDark = '#8ED0B8';

export const Colors = {
  light: {
    text: '#1C1713',
    background: '#F6F1E7',
    surface: '#FFFCF7',
    surfaceAlt: '#EEE4D4',
    border: '#D2C3AE',
    tint: tintColorLight,
    icon: '#73685D',
    muted: '#6A5D50',
    accentSoft: '#DDEEE5',
    overlay: 'rgba(20, 16, 12, 0.72)',
    danger: '#9A4337',
    success: '#1F6A56',
    tabIconDefault: '#73685D',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F8EFE4',
    background: '#181311',
    surface: '#221B18',
    surfaceAlt: '#312823',
    border: '#433730',
    tint: tintColorDark,
    icon: '#B5A79A',
    muted: '#C7B7A8',
    accentSoft: '#24382F',
    overlay: 'rgba(10, 8, 7, 0.82)',
    danger: '#E2877D',
    success: '#8ED0B8',
    tabIconDefault: '#B5A79A',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
