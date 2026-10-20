import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';

import type { Condition } from '../../game/needs';
import type { CareReaction } from '../room/care/CareStage';
import { ArtCanvas } from './art/ArtCanvas';
import { CareFx } from './art/CareFx';
import { FaceArt } from './art/FaceArt';
import { PLANT_H } from './art/geometry';
import { HarvestArt } from './art/HarvestArt';
import { plantPalette } from './art/palette';
import { PlantArt } from './art/PlantArt';
import { PotArt } from './art/PotArt';
import { SleepZ } from './art/SleepZ';
import { canBlink } from './budiLook';
import { BudiLayer } from './BudiLayer';
import { useBudiLook } from './useBudiLook';
import { useBudiMotion } from './useBudiMotion';

/** Kantenlänge der gemeinsamen Leinwand im Raum (Budi-Einheiten 100 × 100). */
export const BUDI_SIZE = 260;

interface BudiProps {
  /** Zustand aus deriveCondition (needs.ts). null = kein Samen. */
  condition: Condition | null;
  /** Letzte Pflege aus CareStage (P10): spielt Squash-and-Stretch, Wackeln oder Kopfschütteln. */
  reaction: CareReaction | null;
  /** 1, solange ein Werkzeug über Budi schwebt. */
  hovering: SharedValue<number>;
  /**
   * Accessoire-Slot (P25): Hut, Brille usw. als Ebene auf derselben Leinwand,
   * liegt über Pflanze und Gesicht und bewegt sich mit Budi.
   */
  accessory?: ImageSourcePropType | null;
  size?: number;
}

/**
 * Budi als Vektorgrafik (Skia): Pflanze je Phase, Topf, Gesicht je Zustand, Accessoire.
 * Zwei Leinwände: Die Pflanze ändert sich nur mit der Phase (einmal gerendert, wippt per
 * View-Transform), der Topf mit Gesicht zeichnet nur beim Blinzeln neu.
 */
export function Budi({ condition, reaction, hovering, accessory, size = BUDI_SIZE }: BudiProps) {
  const look = useBudiLook(condition, reaction, hovering);
  const asleep = look.face === 'b10_face_snoring';
  const idle = look.pot !== null && look.face !== 'b10_face_coma';
  const eyesOpen = look.face !== null && canBlink(look.face);
  const motion = useBudiMotion(idle, eyesOpen, asleep, reaction, hovering);
  const { plant } = look;
  const palette = plantPalette(plant?.tint ?? null, look.ripe);
  const harvested = plant !== null && look.pot === null;
  const plantHeight = (size * PLANT_H) / 100;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.origin, motion.bodyStyle]}>
        {harvested ? (
          <ArtCanvas width={size} height={size} still>
            <HarvestArt kind={plant.base === 'b07_drying' ? 'drying' : 'crate'} palette={palette} />
          </ArtCanvas>
        ) : null}
        {plant && !harvested ? (
          <View
            pointerEvents="none"
            style={[
              styles.plantBox,
              { height: plantHeight },
              { transform: [{ scaleX: plant.scaleX }, { scaleY: plant.scaleY }] },
            ]}
          >
            <Animated.View style={[styles.origin, motion.plantStyle]}>
              <ArtCanvas width={size} height={plantHeight} still>
                <PlantArt id={plant.base} palette={palette} />
              </ArtCanvas>
            </Animated.View>
          </View>
        ) : null}
        {look.pot ? (
          <ArtCanvas width={size} height={size} style={StyleSheet.absoluteFill}>
            <PotArt />
            {look.face ? <FaceArt face={look.face} lid={motion.lid} gaze={motion.gaze} /> : null}
          </ArtCanvas>
        ) : null}
        {accessory && look.pot ? <BudiLayer source={accessory} /> : null}
      </Animated.View>
      <SleepZ visible={asleep} size={size} />
      <CareFx reaction={reaction} size={size} />
    </View>
  );
}

const styles = StyleSheet.create({
  // Topfboden unten mittig: Wippen und Squash drehen und stauchen um diesen Punkt.
  origin: { transformOrigin: 'bottom' },
  plantBox: { position: 'absolute', left: 0, right: 0, top: 0, transformOrigin: 'bottom' },
});
