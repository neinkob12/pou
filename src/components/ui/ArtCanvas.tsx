import { Canvas, Group } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

interface ArtCanvasProps {
  /** Breite in Punkten. Gezeichnet wird in Einheiten: 100 Einheiten = volle Breite. */
  width: number;
  height: number;
  /**
   * Bild ändert sich nur mit React-Props (keine Shared Values). Im Browser rendert Skia dann einmal
   * und gibt den WebGL-Kontext sofort frei: Chrome erlaubt nur 16 gleichzeitig.
   */
  still?: boolean;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}

/** Skia-Leinwand für Budi- und Zimmer-Grafik, skaliert auf 100 Einheiten Breite. */
export function ArtCanvas({ width, height, still = false, style, children }: ArtCanvasProps) {
  return (
    <Canvas
      pointerEvents="none"
      style={StyleSheet.flatten([{ width, height }, style])}
      __destroyWebGLContextAfterRender={still && Platform.OS === 'web'}
    >
      <Group transform={[{ scale: width / 100 }]}>{children}</Group>
    </Canvas>
  );
}
