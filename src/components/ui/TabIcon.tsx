import { View, type ColorValue } from 'react-native';

import { radii } from '../../lib/theme';

/** Platzhalter-Icon für die Tab-Leiste, bis echte Icons in assets.ui liegen. */
export function TabIcon({ color, size }: { color: ColorValue; size: number }) {
  return <View style={{ width: size * 0.8, height: size * 0.8, borderRadius: radii.pill, backgroundColor: color }} />;
}
