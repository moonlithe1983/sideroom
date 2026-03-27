// Material icon wrapper used across the Android-first app.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconWeight = 'regular' | 'medium' | 'semibold' | 'bold';
type IconSymbolName =
  | 'house.fill'
  | 'magnifyingglass'
  | 'square.and.pencil'
  | 'bell.fill'
  | 'person.crop.circle.fill'
  | 'lock.shield.fill'
  | 'chevron.left.forwardslash.chevron.right'
  | 'chevron.right';
type IconMapping = Record<IconSymbolName, ComponentProps<typeof MaterialIcons>['name']>;

/**
 * Add symbol-style names to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 */
const MAPPING = {
  'house.fill': 'home',
  magnifyingglass: 'search',
  'square.and.pencil': 'edit-square',
  'bell.fill': 'notifications',
  'person.crop.circle.fill': 'account-circle',
  'lock.shield.fill': 'verified-user',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
} as IconMapping;

/**
 * Icon `name`s use a symbol-style naming scheme and map to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: IconWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
