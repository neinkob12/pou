// Parallaxe-Ebenen (Auftrag 51): stille Bilder in Feldgröße, nahtlos gekachelt, die nur als View
// verschoben werden. Skia zeichnet jedes Bild einmal. Zwei Kacheln statt einer doppelt so großen
// Leinwand, damit auf Handys mit hoher Pixeldichte keine Fläche über die GPU-Grenze (4096 px) wächst.

import { useEffect, useMemo } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { StillPicture, type BackdropDraw } from './Stage';

type Axis = 'x' | 'y';

/**
 * Macht aus einer Zeichnung eine nahtlose Kachel: alles wird zusätzlich eine Feldlänge davor und
 * dahinter gezeichnet, so ragen Formen über die Kante auf der anderen Seite wieder herein.
 */
function useWrapped(draw: BackdropDraw, axis: Axis): BackdropDraw {
  return useMemo<BackdropDraw>(
    () => (c, pen, width, height) => {
      'worklet';
      for (let k = -1; k <= 1; k += 1) {
        c.save();
        c.translate(axis === 'x' ? k * width : 0, axis === 'y' ? k * height : 0);
        draw(c, pen, width, height);
        c.restore();
      }
    },
    [axis, draw],
  );
}

interface TilesProps {
  width: number;
  height: number;
  draw: BackdropDraw;
  axis: Axis;
  /** Verschiebung in Punkten (beliebig groß, wird auf eine Feldlänge gefaltet). */
  offset: SharedValue<number>;
  /** Faktor auf die Verschiebung (Parallaxe: kleiner = weiter weg). */
  factor?: number;
  /** Deckkraft der Ebene, optional animiert. */
  opacity?: SharedValue<number>;
}

/** Zwei Kacheln, die zusammen um `offset` gleiten und sich endlos wiederholen. */
export function Tiles({ width, height, draw, axis, offset, factor = 1, opacity }: TilesProps) {
  const wrapped = useWrapped(draw, axis);
  const length = axis === 'x' ? width : height;
  const tileStyle = (second: boolean) => {
    'worklet';
    const raw = (offset.get() * factor) % length;
    const shift = (raw < 0 ? raw + length : raw) - (second ? length : 0);
    return {
      opacity: opacity ? opacity.get() : 1,
      transform: axis === 'x' ? [{ translateX: -shift }] : [{ translateY: shift }],
    };
  };
  const first = useAnimatedStyle(() => tileStyle(false));
  const second = useAnimatedStyle(() => tileStyle(true));
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.layer, { width, height }, first]}>
        <StillPicture width={width} height={height} draw={wrapped} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.layer, { width, height }, second]}>
        <StillPicture width={width} height={height} draw={wrapped} />
      </Animated.View>
    </>
  );
}

interface DriftProps {
  width: number;
  height: number;
  draw: BackdropDraw;
  /** Eine Feldlänge braucht so lange (ms). */
  durationMs: number;
  /** 'up': nach oben, 'left': nach links. */
  direction: 'up' | 'left';
}

/** Gleitet endlos von selbst (Lichtkugeln, Wolken). */
export function Drift({ width, height, draw, durationMs, direction }: DriftProps) {
  const t = useSharedValue(0);
  const up = direction === 'up';
  const length = up ? height : width;
  useEffect(() => {
    t.set(withRepeat(withTiming(length, { duration: durationMs, easing: Easing.linear }), -1, false));
    return () => cancelAnimation(t);
  }, [durationMs, length, t]);
  // Nach oben heißt: Kacheln wandern zu kleinerem y, also negative Verschiebung.
  return <Tiles width={width} height={height} draw={draw} axis={up ? 'y' : 'x'} offset={t} factor={up ? -1 : 1} />;
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0 },
});
