// Parallaxe-Ebenen von Budi Jump (Auftrag 51): Abend- und Nachthimmel blenden mit der Höhe über den
// Tageshimmel, Wolken ziehen halb so schnell wie die Blätter vorbei, die Startwiese sinkt unten weg.
// Alles stille Bilder, bewegt nur über View-Transforms und Deckkraft.

import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { BUDI_JUMP } from '../../../game/config';
import { Tiles } from '../framework/art/Drift';
import { StillPicture } from '../framework/art/Stage';
import { drawJumpClouds, drawJumpDusk, drawJumpGround, drawJumpNight } from './jumpArt';
import { skyBlend } from './jumpFeel';
import type { JumpWorld } from './jumpWorld';

/** Anteil der Kamerafahrt, mit dem Wolken und Wiese wandern (kleiner = weiter weg). */
const CLOUD_FACTOR = 0.35;
const GROUND_FACTOR = 0.6;

interface JumpLayersProps {
  width: number;
  height: number;
  world: SharedValue<JumpWorld>;
}

export function JumpLayers({ width, height, world }: JumpLayersProps) {
  const k = width / BUDI_JUMP.worldWidth;
  const camera = useDerivedValue(() => world.get().cameraY * k);
  const blend = useDerivedValue(() => skyBlend(world.get().cameraY));
  const dusk = useAnimatedStyle(() => ({ opacity: blend.get().dusk }));
  const night = useAnimatedStyle(() => ({ opacity: blend.get().night }));
  const cloudOpacity = useDerivedValue(() => 1 - blend.get().night * 0.7);
  const ground = useAnimatedStyle(() => {
    const y = Math.max(0, camera.get() * GROUND_FACTOR);
    return { opacity: y > height ? 0 : 1, transform: [{ translateY: y }] };
  });
  const box = { width, height };
  return (
    <>
      <Animated.View pointerEvents="none" style={[styles.layer, box, dusk]}>
        <StillPicture width={width} height={height} draw={drawJumpDusk} />
      </Animated.View>
      <Animated.View pointerEvents="none" style={[styles.layer, box, night]}>
        <StillPicture width={width} height={height} draw={drawJumpNight} />
      </Animated.View>
      <Tiles
        width={width}
        height={height}
        draw={drawJumpClouds}
        axis="y"
        offset={camera}
        factor={CLOUD_FACTOR}
        opacity={cloudOpacity}
      />
      <Animated.View pointerEvents="none" style={[styles.layer, box, ground]}>
        <StillPicture width={width} height={height} draw={drawJumpGround} />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  layer: { position: 'absolute', left: 0, top: 0 },
});
