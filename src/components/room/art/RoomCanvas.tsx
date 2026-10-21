import { Canvas, Group } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import type { Box } from './roomLayout';

interface RoomCanvasProps {
  /** Punkte je Einheit (Bildbreite / 100). */
  u: number;
  /** Ausschnitt des Zimmers in Einheiten, den diese Leinwand zeigt. */
  box: Box;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/**
 * Stille Leinwand für einen Ausschnitt des Zimmers. Gezeichnet wird in Zimmer-Einheiten, damit
 * Teile wie Fensterkreuz oder Vorhang dieselben Koordinaten nutzen wie das ganze Zimmer.
 * Ändert sich nur mit Props; im Browser wird einmal gerechnet und der WebGL-Kontext freigegeben (WEB-6).
 */
export function RoomCanvas({ u, box, style, children }: RoomCanvasProps) {
  return (
    <Canvas
      pointerEvents="none"
      // Skia-Web setzt den Stil direkt aufs DOM: kein Array, sonst Fehler.
      style={StyleSheet.flatten([{ position: 'absolute', left: box.x * u, top: box.y * u, width: box.w * u, height: box.h * u }, style])}
      __destroyWebGLContextAfterRender={Platform.OS === 'web'}
    >
      <Group transform={[{ scale: u }, { translateX: -box.x }, { translateY: -box.y }]}>{children}</Group>
    </Canvas>
  );
}
