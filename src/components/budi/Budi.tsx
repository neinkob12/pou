import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { type SharedValue } from 'react-native-reanimated';

import type { Condition } from '../../game/needs';
import { budi } from '../../lib/assets';
import type { CareReaction } from '../room/care/CareStage';
import { BudiLayer } from './BudiLayer';
import { useBudiLook } from './useBudiLook';
import { useBudiMotion } from './useBudiMotion';

/** Kantenlänge der gemeinsamen Leinwand im Raum (Bildvorlage 1024 × 1024). */
export const BUDI_SIZE = 260;

interface BudiProps {
  /** Zustand aus deriveCondition (needs.ts). null = kein Samen. */
  condition: Condition | null;
  /** Letzte Pflege aus CareStage (P10): spielt Squash-and-Stretch oder Kopfschütteln. */
  reaction: CareReaction | null;
  /** 1, solange ein Werkzeug über Budi schwebt. */
  hovering: SharedValue<number>;
  /**
   * Accessoire-Slot (P25): Hut, Brille usw. als Ebene auf derselben 1024er-Leinwand,
   * liegt über Pflanze und Gesicht und bewegt sich mit Budi.
   */
  accessory?: ImageSourcePropType | null;
  size?: number;
}

/** Budi aus Ebenen: Pflanze je Phase, Topf, Gesicht je Zustand, Blinzeln, Accessoire. */
export function Budi({ condition, reaction, hovering, accessory, size = BUDI_SIZE }: BudiProps) {
  const look = useBudiLook(condition, reaction, hovering);
  const idle = look.pot !== null && look.face !== 'b10_face_coma';
  const motion = useBudiMotion(idle, look.blink, reaction, hovering);
  const { plant } = look;

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.origin, motion.bodyStyle]}>
        {plant ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              styles.origin,
              { transform: [{ scaleX: plant.scaleX }, { scaleY: plant.scaleY }] },
            ]}
          >
            <BudiLayer source={budi[plant.key] ?? budi[plant.base]} tint={plant.tint} style={motion.plantStyle} />
          </View>
        ) : null}
        {look.pot ? <BudiLayer source={budi[look.pot]} /> : null}
        {look.face ? <BudiLayer source={budi[look.face]} style={motion.faceStyle} /> : null}
        {look.blink ? <BudiLayer source={budi.b12_blink} style={motion.blinkStyle} /> : null}
        {accessory && look.pot ? <BudiLayer source={accessory} /> : null}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  origin: { transformOrigin: 'bottom' },
});
