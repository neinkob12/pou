import { Group, LinearGradient, Oval, Path, RoundedRect, vec } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';

import type { StrainId } from '../../../game/config';
import { iconColors as c, iconInk } from './iconPalette';
import { Dot, Line, Shape, shine, Sparkle, starPath } from './shapes';
import { darken, lighten } from './tint';

// Sorten (ART-2): Abzeichen (Medaille mit Blatt und Merkmal) und Samentüte je Sorte.
// Einheiten 100 × 100. Nur Pflanzen und Gärtner-Symbole, keine Marken.

export type StrainBadgeId = `badge_${StrainId}`;
export type SeedPacketId = `packet_${StrainId}`;

interface StrainLook {
  /** Grundfarbe der Sorte (Blatt, Tüte). */
  main: string;
  /** Ring der Medaille nach Seltenheit. */
  ring: string;
  emblem: () => ReactNode;
}

/** Fächerblatt aus Fingern, um (cx, cy) unten am Stiel. */
export function FanLeaf({ cx, cy, size, color, fingers = 7, narrow = 1 }: { cx: number; cy: number; size: number; color: string; fingers?: number; narrow?: number }) {
  const spread = 150;
  const items = Array.from({ length: fingers }, (_, i) => {
    const t = fingers === 1 ? 0 : i / (fingers - 1) - 0.5;
    const deg = t * spread;
    const len = size * (1 - Math.abs(t) * 0.75);
    const w = len * 0.2 * narrow;
    const d = `M${cx} ${cy} C${cx - w} ${cy - len * 0.35} ${cx - w} ${cy - len * 0.75} ${cx} ${cy - len} C${cx + w} ${cy - len * 0.75} ${cx + w} ${cy - len * 0.35} ${cx} ${cy} Z`;
    return { d, deg };
  });
  const rot = (deg: number) => [{ rotate: (deg * Math.PI) / 180 }];
  return (
    <Group>
      {items.map((f) => (
        <Path key={`o${f.deg}`} path={f.d} color={iconInk.outline} style="stroke" strokeWidth={5} strokeJoin="round" transform={rot(f.deg)} origin={{ x: cx, y: cy }} />
      ))}
      {items.map((f) => (
        <Group key={`f${f.deg}`} transform={rot(f.deg)} origin={{ x: cx, y: cy }}>
          <Path path={f.d}>
            <LinearGradient start={vec(cx, cy - size)} end={vec(cx, cy)} colors={[lighten(color, 0.3), color, darken(color, 0.12)]} />
          </Path>
          <Path path={`M${cx} ${cy - 2} L${cx} ${cy - size * 0.6}`} color={darken(color, 0.25)} style="stroke" strokeWidth={1.6} strokeCap="round" />
        </Group>
      ))}
    </Group>
  );
}

const LOOKS: Record<StrainId, StrainLook> = {
  gustav: {
    main: '#5FBF4F',
    ring: '#8BD66F',
    // Gurkenscheibe
    emblem: () => (
      <Group>
        <Dot cx={0} cy={0} r={10} fill="#4E9B3A" line={4} flat />
        <Oval x={-7.5} y={-7.5} width={15} height={15} color="#D8F2B4" />
        {[0, 120, 240].map((deg) => (
          <Oval key={deg} x={-1.5} y={-5.5} width={3} height={4} color="#A8D27A" transform={[{ rotate: (deg * Math.PI) / 180 }]} origin={{ x: 0, y: 0 }} />
        ))}
      </Group>
    ),
  },
  lotte: {
    main: '#A27BEA',
    ring: '#C3A6F5',
    // Blüte
    emblem: () => (
      <Group>
        {[0, 72, 144, 216, 288].map((deg) => (
          <Group key={deg} transform={[{ rotate: (deg * Math.PI) / 180 }]} origin={{ x: 0, y: 0 }}>
            <Oval x={-5.5} y={-13} width={11} height={13} color={iconInk.outline} />
            <Oval x={-4} y={-11.5} width={8} height={10} color="#E4D3FF" />
          </Group>
        ))}
        <Dot cx={0} cy={0} r={4} fill={c.sun} line={3} flat />
      </Group>
    ),
  },
  sascha: {
    main: '#3FAE7A',
    ring: c.coral,
    // Pfeil nach oben: wächst hoch
    emblem: () => (
      <Group>
        <Shape d="M0 -13 L11 1 L4 1 L4 12 L-4 12 L-4 1 L-11 1 Z" fill={c.coral} line={4} gloss={false} />
      </Group>
    ),
  },
  anton: {
    main: '#7CC94A',
    ring: c.sun,
    // Blitz: schnell
    emblem: () => <Shape d="M3 -14 L-9 2 L-1 2 L-4 14 L9 -3 L1 -3 Z" fill={c.sun} line={4} gloss={false} />,
  },
  koelsch: {
    main: '#9BC23C',
    ring: '#F2B233',
    // Krone
    emblem: () => (
      <Group>
        <Shape d="M-12 8 L-13 -8 L-6 -1 L0 -11 L6 -1 L13 -8 L12 8 Z" fill={c.star} line={4} gloss={false} />
        <Oval x={-2} y={0} width={4} height={4} color={c.coral} />
      </Group>
    ),
  },
};

const RIBBON_L = 'M30 66 L20 94 L30 88 L38 96 L44 72 Z';
const RIBBON_R = 'M70 66 L80 94 L70 88 L62 96 L56 72 Z';

function Badge({ id }: { id: StrainId }) {
  const look = LOOKS[id];
  return (
    <Group>
      <Shape d={RIBBON_L} fill={look.ring} gloss={false} line={6} />
      <Shape d={RIBBON_R} fill={look.ring} gloss={false} line={6} />
      <Dot cx={50} cy={44} r={38} fill={look.ring} />
      <Dot cx={50} cy={44} r={28} fill={lighten(look.main, 0.75)} line={5} flat />
      <FanLeaf cx={50} cy={62} size={34} color={look.main} narrow={id === 'sascha' ? 0.6 : id === 'anton' ? 1.35 : 1} />
      <Line d="M50 62 L50 70" color={darken(look.main, 0.2)} width={3} />
      <Group transform={[{ translateX: 72 }, { translateY: 66 }]}>{look.emblem()}</Group>
      {shine('M20 30 C24 20 32 12 42 9', 5)}
    </Group>
  );
}

function Packet({ id }: { id: StrainId }) {
  const look = LOOKS[id];
  return (
    <Group>
      <Shape d="M18 14 L82 14 L84 88 C84 92 81 94 77 94 L23 94 C19 94 16 92 16 88 Z" fill={c.paper} />
      <Path path="M18 14 L24 8 L30 14 L36 8 L42 14 L48 8 L54 14 L60 8 L66 14 L72 8 L78 14 L82 14" color={iconInk.outline} style="stroke" strokeWidth={4} strokeJoin="round" />
      <Path path="M17 22 L83 22 L83.4 38 L16.6 38 Z" color={look.main} />
      <Path path="M17 30 L83 30" color={iconInk.gloss} style="stroke" strokeWidth={2} opacity={0.5} />
      <RoundedRect x={26} y={44} width={48} height={40} r={10} color={iconInk.outline} />
      <RoundedRect x={29} y={47} width={42} height={34} r={8} color={lighten(look.main, 0.78)} />
      <FanLeaf cx={50} cy={78} size={28} color={look.main} narrow={id === 'sascha' ? 0.6 : id === 'anton' ? 1.35 : 1} />
      <Group transform={[{ translateX: 72 }, { translateY: 82 }]}>{look.emblem()}</Group>
      <Path path={starPath(28, 30, 5)} color={iconInk.gloss} />
      {shine('M24 46 L22 80', 4)}
      {id === 'koelsch' ? <Sparkle cx={86} cy={12} r={10} color={c.star} /> : null}
    </Group>
  );
}

const ids = Object.keys(LOOKS) as StrainId[];

export const STRAIN_ICONS = Object.fromEntries([
  ...ids.map((id) => [`badge_${id}`, () => <Badge id={id} />]),
  ...ids.map((id) => [`packet_${id}`, () => <Packet id={id} />]),
]) as Record<StrainBadgeId | SeedPacketId, () => ReactNode>;
