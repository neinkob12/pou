import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';

import type { Condition } from '../../game/needs';
import type { CareReaction } from '../room/care/CareStage';
import { ArtCanvas } from '../ui/ArtCanvas';
import { CareFx } from './art/CareFx';
import { EYE_Y, FaceArt, MOUTH_Y, type FacePart } from './art/FaceArt';
import { FACE_BOXES, hasMovingIris } from './art/faceSpec';
import { PLANT_H } from './art/geometry';
import { HarvestArt } from './art/HarvestArt';
import { plantPalette } from './art/palette';
import { PlantArt } from './art/PlantArt';
import { PotArt, ShadowArt } from './art/PotArt';
import { SleepZ } from './art/SleepZ';
import { canBlink, type BudiFace } from './budiLook';
import { BudiCanvas, type BudiBox } from './BudiCanvas';
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

/** Ausschnitte von Topf und Schatten auf der Budi-Leinwand. */
const POT_BOX: BudiBox = [13, 53, 74, 46];
const SHADOW_BOX: BudiBox = [16, 92, 68, 8];

/** Eine Gesichtsebene auf eigener, knapp bemessener stiller Leinwand. */
function FaceLayer({ face, part, size }: { face: BudiFace; part: FacePart; size: number }) {
  return (
    <BudiCanvas size={size} box={FACE_BOXES[part]}>
      <FaceArt face={face} part={part} />
    </BudiCanvas>
  );
}

/**
 * Budi als Vektorgrafik (Skia): Schatten, Pflanze je Phase, Topf, Gesicht je Mimik, Accessoire.
 * Jede Ebene zeichnet nur, wenn sich Phase oder Mimik ändern. Alle Bewegung (Hüpfen, Squash &
 * Stretch, Blinzeln, Umschauen, Kauen) läuft als View-Transform: keine Leinwand zeichnet pro Frame.
 */
export function Budi({ condition, reaction, hovering, accessory, size = BUDI_SIZE }: BudiProps) {
  const look = useBudiLook(condition, reaction, hovering);
  const asleep = look.face === 'b10_face_snoring';
  const idle = look.pot !== null && look.face !== 'b10_face_coma';
  const eyesOpen = look.face !== null && canBlink(look.face);
  const motion = useBudiMotion({ look, face: look.face, idle, eyesOpen, asleep, condition, hovering, size });
  const { plant } = look;
  const palette = plantPalette(plant?.tint ?? null, look.ripe);
  const harvested = plant !== null && look.pot === null;
  const plantHeight = (size * PLANT_H) / 100;

  return (
    <View style={{ width: size, height: size }}>
      {look.pot ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shadow, motion.shadowStyle]}>
          <BudiCanvas size={size} box={SHADOW_BOX}>
            <ShadowArt />
          </BudiCanvas>
        </Animated.View>
      ) : null}
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
                <PlantArt id={plant.base} palette={palette} leafWidth={plant.leafWidth} />
              </ArtCanvas>
            </Animated.View>
          </View>
        ) : null}
        {look.pot ? (
          <BudiCanvas size={size} box={POT_BOX}>
            <PotArt />
          </BudiCanvas>
        ) : null}
        {look.pot && look.face ? (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <FaceLayer face={look.face} part="rest" size={size} />
            <Animated.View style={[StyleSheet.absoluteFill, styles.eyes, motion.eyeStyle]}>
              <FaceLayer face={look.face} part="eyes" size={size} />
              {hasMovingIris(look.face) ? (
                <Animated.View style={[StyleSheet.absoluteFill, motion.pupilStyle]}>
                  <FaceLayer face={look.face} part="pupils" size={size} />
                </Animated.View>
              ) : null}
            </Animated.View>
            <Animated.View style={[StyleSheet.absoluteFill, styles.mouth, motion.mouthStyle]}>
              <FaceLayer face={look.face} part="mouth" size={size} />
            </Animated.View>
          </View>
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
  // Lider klappen um die Augenlinie, der Mund kaut um seine Mitte.
  eyes: { transformOrigin: `50% ${EYE_Y}%` },
  mouth: { transformOrigin: `50% ${MOUTH_Y + 1.5}%` },
  // Schatten schrumpft um seine Mitte am Boden.
  shadow: { transformOrigin: '50% 97%' },
  plantBox: { position: 'absolute', left: 0, right: 0, top: 0, transformOrigin: 'bottom' },
});
