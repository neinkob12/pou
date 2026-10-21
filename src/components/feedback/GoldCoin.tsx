import { View } from 'react-native';

import { colors, outline, tones } from '../../lib/theme';

/**
 * Münze im Spiele-Look (ART-5): Gold mit dunkler Kontur, dunklerer Unterkante und Glanzpunkt oben
 * links. Nur Views, damit sie in Münzregen und Münzflug ohne Leinwand fliegen kann.
 */
export function GoldCoin({ size }: { size: number }) {
  const ring = Math.max(2, size * 0.09);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: tones.gold.base,
        borderWidth: ring,
        borderColor: outline.color,
        borderBottomWidth: ring * 1.8,
        borderBottomColor: tones.gold.edge,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <View
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: size,
          borderWidth: Math.max(1, size * 0.07),
          borderColor: tones.gold.dark,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: size * 0.16,
          top: size * 0.12,
          width: size * 0.2,
          height: size * 0.13,
          borderRadius: size,
          backgroundColor: colors.white,
          opacity: 0.85,
          transform: [{ rotate: '-30deg' }],
        }}
      />
    </View>
  );
}
