import { View } from 'react-native';

import { colors, radii } from '../../lib/theme';

interface BudiAvatarProps {
  size?: number;
}

/**
 * Kleiner Budi-Kopf für Sprechblasen und Feiern (WEB-3): grünes Blatt mit Augen und Lächeln, aus
 * Formen gezeichnet. Bewusst unabhängig von den Budi-Ebenen (budi/), damit Sprechblasen auch ohne
 * fertige Grafik freundlich aussehen.
 */
export function BudiAvatar({ size = 56 }: BudiAvatarProps) {
  const eye = size * 0.12;
  const smileWidth = size * 0.36;
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: radii.pill,
        borderTopLeftRadius: size * 0.15,
        backgroundColor: colors.plantLight,
        borderWidth: 2,
        borderColor: colors.plantDark,
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: '-8deg' }],
      }}
    >
      <View style={{ flexDirection: 'row', gap: size * 0.2, marginTop: size * 0.08 }}>
        <View style={{ width: eye, height: eye * 1.3, borderRadius: radii.pill, backgroundColor: colors.ink }} />
        <View style={{ width: eye, height: eye * 1.3, borderRadius: radii.pill, backgroundColor: colors.ink }} />
      </View>
      <View
        style={{
          width: smileWidth,
          height: smileWidth / 2,
          marginTop: size * 0.03,
          borderBottomLeftRadius: smileWidth,
          borderBottomRightRadius: smileWidth,
          borderWidth: 2,
          borderTopWidth: 0,
          borderColor: colors.ink,
        }}
      />
    </View>
  );
}
