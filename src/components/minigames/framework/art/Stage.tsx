// Bühne eines Minigames (Auftrag 51): unten ein stilles Hintergrundbild, darüber die bewegte Szene als
// eine Picture. Das stille Bild zeichnet Skia nur neu, wenn sich die Größe ändert (im Web auf der
// CPU, ohne eigenen WebGL-Kontext, siehe src/perf/stillCanvas.ts); die bewegte Leinwand spielt pro
// Frame nur noch Figuren und Effekte ab.

import { Canvas, Picture, type SkCanvas, type SkPicture } from '@shopify/react-native-skia';
import { memo, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, StyleSheet, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { type AnimatedStyle, type SharedValue } from 'react-native-reanimated';

import { record, type Pen } from './kit';

export type BackdropDraw = (canvas: SkCanvas, pen: Pen, width: number, height: number) => void;

interface StillPictureProps {
  width: number;
  height: number;
  draw: BackdropDraw;
  style?: StyleProp<ViewStyle>;
}

/**
 * Ein festes Bild in Punkten. Neu aufgenommen nur, wenn sich Größe oder Zeichnung ändern. `memo`:
 * jedes Neuzeichnen einer stillen Leinwand rechnet im Web das ganze Bild auf der CPU, also nie
 * nur, weil das Spiel darüber neu rendert (Punkte, Popups).
 */
export const StillPicture = memo(function StillPicture({ width, height, draw, style }: StillPictureProps) {
  const picture = useMemo(() => record((c, pen) => draw(c, pen, width, height)), [draw, width, height]);
  useEffect(() => () => picture.dispose(), [picture]);
  return (
    <Canvas
      pointerEvents="none"
      style={StyleSheet.flatten([{ width, height }, style])}
      __destroyWebGLContextAfterRender={Platform.OS === 'web'}
    >
      <Picture picture={picture} />
    </Canvas>
  );
});

interface StageProps {
  scene: SharedValue<SkPicture>;
  backdrop?: BackdropDraw;
  /** Ebenen zwischen Hintergrund und Szene (z. B. Parallaxe), bekommen die Feldgröße. */
  layers?: (width: number, height: number) => ReactNode;
  onLayout?: (e: LayoutChangeEvent) => void;
  /** Kamera-Wackeln (useShakeStyle), bewegt Hintergrund und Szene gemeinsam. */
  shakeStyle?: AnimatedStyle<ViewStyle>;
}

/** `memo`: Props sind stabil (Shared Values, Modul-Funktionen), React-Renders des Spiels gehen vorbei. */
export const Stage = memo(function Stage({ scene, backdrop, layers, onLayout, shakeStyle }: StageProps) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);
  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((s) => (s && s.width === width && s.height === height ? s : { width, height }));
    onLayout?.(e);
  };
  return (
    <Animated.View style={[styles.fill, shakeStyle]} onLayout={handleLayout}>
      {size && size.width > 0 && backdrop && (
        <StillPicture width={size.width} height={size.height} draw={backdrop} style={styles.abs} />
      )}
      {size && size.width > 0 && layers?.(size.width, size.height)}
      <Canvas style={styles.abs} pointerEvents="none">
        <Picture picture={scene} />
      </Canvas>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  fill: { flex: 1 },
  abs: { position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 },
});
