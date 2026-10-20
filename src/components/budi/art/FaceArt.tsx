import { Circle, Group, Oval, Path } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import type { BudiFaceId } from '../../../lib/assets';
import { artColors } from '../../../lib/theme';

// Gesicht auf dem Topf (DESIGN_GUIDE D4), Budi-Leinwand 100 × 100. Augen groß und weit auseinander.
const EYE_Y = 79.5;
const EYE_X = [39.5, 60.5] as const;
const EYE_RX = 4.3;
const EYE_RY = 5.1;
const MOUTH_Y = 88;
const CHEEK_Y = 86;
const CHEEK_X = [31, 69] as const;
const LINE = 1.5;

type EyeKind = 'open' | 'big' | 'half' | 'closedHappy' | 'closedSleep' | 'cross' | 'squint';
type MouthKind =
  | 'smile'
  | 'grin'
  | 'laugh'
  | 'tongueOut'
  | 'drool'
  | 'flat'
  | 'wavy'
  | 'pout'
  | 'o'
  | 'smallO'
  | 'sickWavy';
type Extra = 'sweat' | 'worryBrows' | 'angryBrows' | 'sickCheeks' | 'blush' | 'droop';

interface FaceSpec {
  eyes: EyeKind;
  mouth: MouthKind;
  extras: readonly Extra[];
}

const FACES: Record<BudiFaceId, FaceSpec> = {
  b10_face_neutral: { eyes: 'open', mouth: 'smile', extras: ['blush'] },
  b10_face_happy: { eyes: 'open', mouth: 'grin', extras: ['blush'] },
  b10_face_very_happy: { eyes: 'closedHappy', mouth: 'laugh', extras: ['blush'] },
  b10_face_thirsty: { eyes: 'open', mouth: 'tongueOut', extras: ['droop'] },
  b10_face_hungry: { eyes: 'open', mouth: 'drool', extras: ['worryBrows'] },
  b10_face_tired: { eyes: 'half', mouth: 'flat', extras: [] },
  b10_face_snoring: { eyes: 'closedSleep', mouth: 'smallO', extras: ['blush'] },
  b10_face_stressed: { eyes: 'open', mouth: 'wavy', extras: ['worryBrows', 'sweat'] },
  b10_face_sick: { eyes: 'half', mouth: 'sickWavy', extras: ['sickCheeks', 'sweat'] },
  b10_face_offended: { eyes: 'squint', mouth: 'pout', extras: ['angryBrows', 'blush'] },
  b10_face_coma: { eyes: 'cross', mouth: 'flat', extras: [] },
  b10_face_surprised: { eyes: 'big', mouth: 'o', extras: [] },
  b12_blink: { eyes: 'closedSleep', mouth: 'smile', extras: ['blush'] },
};

const stroke = (d: string, color: string = artColors.eye, w = LINE) => (
  <Path key={d} path={d} color={color} style="stroke" strokeWidth={w} strokeCap="round" strokeJoin="round" />
);

function OpenEye({ cx, big }: { cx: number; big: boolean }) {
  const rx = big ? EYE_RX * 1.2 : EYE_RX;
  const ry = big ? EYE_RY * 1.2 : EYE_RY;
  return (
    <Group>
      <Oval x={cx - rx} y={EYE_Y - ry} width={rx * 2} height={ry * 2} color={artColors.eye} />
      <Circle cx={cx + rx * 0.32} cy={EYE_Y - ry * 0.38} r={rx * 0.38} color={artColors.eyeShine} />
      <Circle cx={cx - rx * 0.35} cy={EYE_Y + ry * 0.42} r={rx * 0.17} color={artColors.eyeShine} />
    </Group>
  );
}

function Eyes({ kind, lid, gaze }: { kind: EyeKind; lid: SharedValue<number>; gaze: SharedValue<number> }) {
  const blinkTransform = useDerivedValue(() => [{ translateX: gaze.value }, { scaleY: Math.max(0.08, lid.value) }]);
  switch (kind) {
    case 'open':
    case 'big':
      return (
        <>
          {EYE_X.map((cx) => (
            <Group key={cx} origin={{ x: cx, y: EYE_Y }} transform={blinkTransform}>
              <OpenEye cx={cx} big={kind === 'big'} />
            </Group>
          ))}
        </>
      );
    case 'half':
      return (
        <>
          {EYE_X.map((cx) => (
            <Group key={cx}>
              <Path
                path={`M${cx - EYE_RX} ${EYE_Y} A${EYE_RX} ${EYE_RY * 0.8} 0 0 0 ${cx + EYE_RX} ${EYE_Y} Z`}
                color={artColors.eye}
              />
              {stroke(`M${cx - EYE_RX - 0.8} ${EYE_Y - 0.2} L${cx + EYE_RX + 0.8} ${EYE_Y - 0.2}`, artColors.eye, LINE * 1.1)}
              <Circle cx={cx + 1.4} cy={EYE_Y + 1.4} r={1} color={artColors.eyeShine} />
            </Group>
          ))}
        </>
      );
    case 'closedHappy':
      return <>{EYE_X.map((cx) => stroke(`M${cx - 4} ${EYE_Y + 1.5} Q${cx} ${EYE_Y - 4.5} ${cx + 4} ${EYE_Y + 1.5}`, artColors.eye, LINE * 1.4))}</>;
    case 'closedSleep':
      return <>{EYE_X.map((cx) => stroke(`M${cx - 4} ${EYE_Y} Q${cx} ${EYE_Y + 4} ${cx + 4} ${EYE_Y}`, artColors.eye, LINE * 1.3))}</>;
    case 'squint':
      return (
        <>
          {EYE_X.map((cx, i) => (
            <Group key={cx}>
              <Path
                path={`M${cx - EYE_RX} ${EYE_Y - (i ? 0 : 1.2)} L${cx + EYE_RX} ${EYE_Y - (i ? 1.2 : 0)} A${EYE_RX} ${EYE_RY * 0.75} 0 0 1 ${cx - EYE_RX} ${EYE_Y - (i ? 0 : 1.2)} Z`}
                color={artColors.eye}
              />
              <Circle cx={cx + 1.2} cy={EYE_Y + 1.6} r={0.9} color={artColors.eyeShine} />
            </Group>
          ))}
        </>
      );
    case 'cross':
      return (
        <>
          {EYE_X.map((cx) =>
            stroke(`M${cx - 3.2} ${EYE_Y - 3.2} L${cx + 3.2} ${EYE_Y + 3.2} M${cx + 3.2} ${EYE_Y - 3.2} L${cx - 3.2} ${EYE_Y + 3.2}`, artColors.eye, LINE * 1.3),
          )}
        </>
      );
  }
}

function Mouth({ kind }: { kind: MouthKind }) {
  const m = MOUTH_Y;
  switch (kind) {
    case 'smile':
      return stroke(`M46 ${m - 0.5} Q50 ${m + 3} 54 ${m - 0.5}`);
    case 'grin':
      return (
        <Group>
          <Path path={`M44.5 ${m - 1} Q50 ${m - 1.6} 55.5 ${m - 1} Q55 ${m + 5} 50 ${m + 5} Q45 ${m + 5} 44.5 ${m - 1} Z`} color={artColors.mouth} />
          <Path path={`M46.8 ${m + 3.2} Q50 ${m + 1.2} 53.2 ${m + 3.2} Q50 ${m + 5.2} 46.8 ${m + 3.2} Z`} color={artColors.tongue} />
          {stroke(`M44.5 ${m - 1} Q50 ${m - 1.6} 55.5 ${m - 1} Q55 ${m + 5} 50 ${m + 5} Q45 ${m + 5} 44.5 ${m - 1} Z`, artColors.eye, LINE * 0.9)}
        </Group>
      );
    case 'laugh':
      return (
        <Group>
          <Path path={`M43 ${m - 2} Q50 ${m - 3} 57 ${m - 2} Q56.5 ${m + 7} 50 ${m + 7} Q43.5 ${m + 7} 43 ${m - 2} Z`} color={artColors.mouth} />
          <Path path={`M45.5 ${m + 4} Q50 ${m + 1} 54.5 ${m + 4} Q50 ${m + 7.2} 45.5 ${m + 4} Z`} color={artColors.tongue} />
          {stroke(`M43 ${m - 2} Q50 ${m - 3} 57 ${m - 2} Q56.5 ${m + 7} 50 ${m + 7} Q43.5 ${m + 7} 43 ${m - 2} Z`, artColors.eye, LINE * 0.9)}
        </Group>
      );
    case 'tongueOut':
      return (
        <Group>
          <Path path={`M47.5 ${m} Q50 ${m - 0.4} 52.5 ${m} L52.5 ${m + 3.6} Q50 ${m + 6.4} 47.5 ${m + 3.6} Z`} color={artColors.tongue} />
          {stroke(`M47.5 ${m} Q50 ${m - 0.4} 52.5 ${m} L52.5 ${m + 3.6} Q50 ${m + 6.4} 47.5 ${m + 3.6} Z`, artColors.eye, LINE * 0.8)}
          {stroke(`M50 ${m + 0.6} L50 ${m + 3}`, artColors.mouth, LINE * 0.6)}
          {stroke(`M44.5 ${m} Q50 ${m - 2} 55.5 ${m}`)}
        </Group>
      );
    case 'drool':
      return (
        <Group>
          <Oval x={46.6} y={m - 2} width={6.8} height={5.4} color={artColors.mouth} />
          {stroke(`M46.6 ${m + 0.7} A3.4 2.7 0 1 0 53.4 ${m + 0.7} A3.4 2.7 0 1 0 46.6 ${m + 0.7}`, artColors.eye, LINE * 0.9)}
          <Path path={`M53 ${m + 2} Q54.4 ${m + 5} 53.6 ${m + 6} Q52.4 ${m + 6.4} 52.6 ${m + 4.6} Z`} color={artColors.sweat} />
        </Group>
      );
    case 'flat':
      return stroke(`M46 ${m + 1} L54 ${m + 1}`);
    case 'wavy':
      return stroke(`M44.5 ${m + 1.5} Q46.3 ${m - 0.6} 48.2 ${m + 1.5} Q50 ${m + 3.4} 51.8 ${m + 1.5} Q53.7 ${m - 0.6} 55.5 ${m + 1.5}`);
    case 'sickWavy':
      return stroke(`M45 ${m + 2} Q47.5 ${m - 0.5} 50 ${m + 2} Q52.5 ${m + 4.4} 55 ${m + 2}`, artColors.eye, LINE * 1.1);
    case 'pout':
      return stroke(`M47 ${m + 2.5} Q50 ${m - 0.8} 53 ${m + 2.5}`, artColors.eye, LINE * 1.2);
    case 'o':
      return (
        <Group>
          <Oval x={47} y={m - 2} width={6} height={7} color={artColors.mouth} />
          {stroke(`M47 ${m + 1.5} A3 3.5 0 1 0 53 ${m + 1.5} A3 3.5 0 1 0 47 ${m + 1.5}`, artColors.eye, LINE * 0.9)}
        </Group>
      );
    case 'smallO':
      return (
        <Group>
          <Oval x={48.3} y={m} width={3.4} height={3.2} color={artColors.mouth} />
          {stroke(`M48.3 ${m + 1.6} A1.7 1.6 0 1 0 51.7 ${m + 1.6} A1.7 1.6 0 1 0 48.3 ${m + 1.6}`, artColors.eye, LINE * 0.8)}
        </Group>
      );
  }
}

function ExtraPart({ kind }: { kind: Extra }): ReactNode {
  switch (kind) {
    case 'blush':
      return (
        <>
          {CHEEK_X.map((cx) => (
            <Oval key={cx} x={cx - 3.6} y={CHEEK_Y - 2} width={7.2} height={4} color={artColors.cheek} opacity={0.75} />
          ))}
        </>
      );
    case 'sickCheeks':
      return (
        <>
          {CHEEK_X.map((cx) => (
            <Oval key={cx} x={cx - 4} y={CHEEK_Y - 2.4} width={8} height={4.8} color={artColors.sick} opacity={0.9} />
          ))}
        </>
      );
    case 'sweat':
      return (
        <Group>
          <Path path="M70 70 Q73.6 75 72.6 77 Q70 79.4 67.6 77 Q66.8 75 70 70 Z" color={artColors.sweat} />
          {stroke('M70 70 Q73.6 75 72.6 77 Q70 79.4 67.6 77 Q66.8 75 70 70 Z', artColors.outline, 0.9)}
          <Circle cx={69} cy={76} r={0.8} color={artColors.eyeShine} />
        </Group>
      );
    case 'worryBrows':
      return (
        <>
          {stroke(`M${EYE_X[0] - 4} ${EYE_Y - 7} L${EYE_X[0] + 3} ${EYE_Y - 9}`, artColors.eye, LINE * 1.1)}
          {stroke(`M${EYE_X[1] + 4} ${EYE_Y - 7} L${EYE_X[1] - 3} ${EYE_Y - 9}`, artColors.eye, LINE * 1.1)}
        </>
      );
    case 'angryBrows':
      return (
        <>
          {stroke(`M${EYE_X[0] - 4.5} ${EYE_Y - 8.5} L${EYE_X[0] + 4} ${EYE_Y - 5}`, artColors.eye, LINE * 1.3)}
          {stroke(`M${EYE_X[1] + 4.5} ${EYE_Y - 8.5} L${EYE_X[1] - 4} ${EYE_Y - 5}`, artColors.eye, LINE * 1.3)}
        </>
      );
    case 'droop':
      return (
        <>
          {stroke(`M${EYE_X[0] - 4.5} ${EYE_Y - 6.5} L${EYE_X[0] + 3.5} ${EYE_Y - 7.8}`, artColors.eye, LINE)}
          {stroke(`M${EYE_X[1] + 4.5} ${EYE_Y - 6.5} L${EYE_X[1] - 3.5} ${EYE_Y - 7.8}`, artColors.eye, LINE)}
        </>
      );
  }
}

interface FaceArtProps {
  face: BudiFaceId;
  /** Augenlid: 1 offen, 0 zu (Blinzeln). Wirkt nur auf offene Augen. */
  lid: SharedValue<number>;
  /** Blickrichtung in Leinwand-Einheiten (links negativ). */
  gaze: SharedValue<number>;
}

/** Budis Gesicht je Zustand (B10), gezeichnet statt Bild-Ebene. */
export function FaceArt({ face, lid, gaze }: FaceArtProps) {
  const spec = FACES[face];
  return (
    <Group>
      {spec.extras.map((e) => (
        <ExtraPart key={e} kind={e} />
      ))}
      <Eyes kind={spec.eyes} lid={lid} gaze={gaze} />
      <Mouth kind={spec.mouth} />
    </Group>
  );
}
