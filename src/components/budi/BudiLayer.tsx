import type { ComponentProps } from 'react';
import { Image, StyleSheet, type ImageSourcePropType } from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, type ColorName } from '../../lib/theme';

/** Deckkraft des Sorten-Farbschleiers über der Grundebene. */
const TINT_OPACITY = 0.45;

interface BudiLayerProps {
  source: ImageSourcePropType;
  /** Farbschleier (Sorten-Variante ohne eigene Datei). Färbt nur die sichtbaren Pixel. */
  tint?: ColorName | null;
  style?: ComponentProps<typeof Animated.View>['style'];
}

/** Eine Ebene auf Budis gemeinsamer Leinwand (alle Ebenen gleich groß, docs/ASSETS.md). */
export function BudiLayer({ source, tint, style }: BudiLayerProps) {
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.origin, style]}>
      <Image source={source} style={styles.fill} resizeMode="contain" />
      {tint ? (
        <Image
          source={source}
          style={[styles.fill, StyleSheet.absoluteFill, { tintColor: colors[tint], opacity: TINT_OPACITY }]}
          resizeMode="contain"
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Topfboden unten mittig: Wippen und Squash drehen und stauchen um diesen Punkt.
  origin: { transformOrigin: 'bottom' },
  fill: { width: '100%', height: '100%' },
});
