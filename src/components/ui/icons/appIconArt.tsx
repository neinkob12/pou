import { Circle, Group, LinearGradient, Oval, Path, RadialGradient, Rect, RoundedRect, Text, vec, type SkFont } from '@shopify/react-native-skia';

import { artColors, colors } from '../../../lib/theme';
import { iconColors as c, iconInk } from './iconPalette';
import { Dot, Line, Shape, Sparkle } from './shapes';
import { darken, lighten } from './tint';

// App-Icon, Android-Ebenen, Favicon und Ladebild (ART-2). Einheiten 100 × 100.
// Gerendert mit `node assets/render-art.cjs` nach assets/icon/.

export type AppArtVariant = 'icon' | 'background' | 'foreground' | 'monochrome' | 'favicon' | 'splash';

const BG_INNER = '#C9F59A';
const BG_OUTER = '#3E9F4E';
const RAY = 'rgba(255,255,255,0.16)';

/** Hintergrund: grüner Strahlenkranz wie bei einer Belohnung. */
function Burst() {
  const rays = 12;
  return (
    <Group>
      <Rect x={0} y={0} width={100} height={100}>
        <RadialGradient c={vec(50, 46)} r={72} colors={[BG_INNER, colors.plantLight, BG_OUTER]} positions={[0, 0.45, 1]} />
      </Rect>
      {Array.from({ length: rays }, (_, i) => {
        const a = (i / rays) * Math.PI * 2;
        const w = Math.PI / rays / 1.6;
        const p = (da: number) => `${50 + Math.cos(a + da) * 90} ${46 + Math.sin(a + da) * 90}`;
        return <Path key={i} path={`M50 46 L${p(-w)} L${p(w)} Z`} color={RAY} />;
      })}
      <Circle cx={50} cy={46} r={34} color="rgba(255,248,200,0.35)" />
    </Group>
  );
}

// Eigene Topfform und eigenes Gesicht, damit das Logo nicht an Budis Spielgrafik hängt.
const POT_BODY = 'M22 66 L78 66 Q80 66 79.6 68 L74.6 93.5 Q74 97 70.5 97 L29.5 97 Q26 97 25.4 93.5 L20.4 68 Q20 66 22 66 Z';
// Keimling (Chef-Entscheidung a52): zwei runde Keimblätter und eine kleine Knospe in der Mitte.
const SPROUT_LEFT = 'M48 34 C40 40 22 38 16 26 C12 16 22 8 32 12 C42 16 48 24 48 34 Z';
const SPROUT_RIGHT = 'M52 32 C60 38 80 36 86 22 C90 10 80 2 68 6 C58 10 52 20 52 32 Z';
const SPROUT_BUD = 'M50 30 C46 26 46 20 50 14 C54 20 54 26 50 30 Z';
const FACE = { eyeY: 78, eyeDx: 9.5, eyeRx: 4.2, eyeRy: 5 } as const;

/** Fröhliches Gesicht auf dem Topf: große Augen mit Glanz, Bäckchen, offenes Lachen. */
function HappyFace() {
  const { eyeY, eyeDx, eyeRx, eyeRy } = FACE;
  return (
    <Group>
      {[-1, 1].map((s) => (
        <Group key={s}>
          <Oval x={50 + s * eyeDx - eyeRx} y={eyeY - eyeRy} width={eyeRx * 2} height={eyeRy * 2} color={artColors.eye} />
          <Oval x={50 + s * eyeDx - eyeRx * 0.6} y={eyeY} width={eyeRx * 1.2} height={eyeRy * 0.8} color={artColors.iris} opacity={0.6} />
          <Circle cx={50 + s * eyeDx + eyeRx * 0.3} cy={eyeY - eyeRy * 0.4} r={eyeRx * 0.42} color={iconInk.gloss} />
          <Circle cx={50 + s * eyeDx - eyeRx * 0.35} cy={eyeY + eyeRy * 0.42} r={eyeRx * 0.2} color={iconInk.gloss} />
          <Oval x={50 + s * 17 - 4.5} y={eyeY + 4} width={9} height={4.5} color={artColors.cheek} opacity={0.85} />
        </Group>
      ))}
      <Path path="M44 84 L56 84 C56 90 53 92 50 92 C47 92 44 90 44 84 Z" color={iconInk.outline} style="stroke" strokeWidth={1.6} strokeJoin="round" />
      <Path path="M44 84 L56 84 C56 90 53 92 50 92 C47 92 44 90 44 84 Z" color={artColors.mouth} />
      <Oval x={46.5} y={88} width={7} height={3.4} color={artColors.tongue} />
    </Group>
  );
}

/** Budi als Logo: kräftiger Topf mit fröhlichem Gesicht, ein Keimling mit zwei runden Blättern. Budi-Leinwand 100 × 100. */
export function BudiMark({ mono = false }: { mono?: boolean }) {
  return (
    <Group>
      <Line d="M50 60 C50 50 49 42 50 32" color={artColors.stem} width={4.5} />
      <Shape d={SPROUT_LEFT} fill={colors.plantLight} line={4} />
      <Shape d={SPROUT_RIGHT} fill={colors.plantLight} line={4} />
      <Path path="M47 32 C40 30 33 26 26 22 M53 30 C60 26 67 20 74 16" color={artColors.leafShade} style="stroke" strokeWidth={1.8} strokeCap="round" />
      <Shape d={SPROUT_BUD} fill={artColors.leafLight} line={3.5} />
      <Shape d={POT_BODY} fill={artColors.pot} line={4} />
      <RoundedRect x={13} y={55} width={74} height={14} r={6} color={iconInk.outline} />
      <RoundedRect x={15.5} y={57.5} width={69} height={9} r={4}>
        <LinearGradient start={vec(0, 57.5)} end={vec(0, 66.5)} colors={[lighten(artColors.potRim, 0.3), artColors.potRim]} />
      </RoundedRect>
      <RoundedRect x={20} y={59} width={36} height={2.6} r={1.3} color={iconInk.gloss} opacity={0.6} />
      {mono ? null : (
        <HappyFace />
      )}
    </Group>
  );
}

/** Budi in einen Bereich setzen: Mitte (cx, cy), Größe `s` (1 = 100 Einheiten). */
function Placed({ cx, cy, s, mono }: { cx: number; cy: number; s: number; mono?: boolean }) {
  return (
    <Group transform={[{ translateX: cx - 50 * s }, { translateY: cy - 58 * s }, { scale: s }]}>
      <BudiMark mono={mono} />
    </Group>
  );
}

/** Logo-Schriftzug „PotPou“ mit Kontur und Glanz. */
function Logo({ font, y }: { font: SkFont; y: number }) {
  const text = 'PotPou';
  const w = font.measureText(text).width;
  const x = 50 - w / 2;
  return (
    <Group>
      <Text x={x} y={y + 1.6} text={text} font={font} color={darken(iconInk.outline, 0.2)} />
      <Text x={x} y={y} text={text} font={font} color={iconInk.outline} style="stroke" strokeWidth={3.4} strokeJoin="round" />
      <Text x={x} y={y} text={text} font={font}>
        <LinearGradient start={vec(0, y - 12)} end={vec(0, y)} colors={[lighten(c.coral, 0.35), c.coral, darken(c.coral, 0.15)]} />
      </Text>
    </Group>
  );
}

/** Ein Teil des App-Auftritts. `font` braucht nur das Ladebild (Schriftzug). */
export function AppIconArt({ variant, font }: { variant: AppArtVariant; font?: SkFont }) {
  switch (variant) {
    case 'icon':
      return (
        <Group>
          <Burst />
          <Placed cx={50} cy={54} s={0.84} />
          <Sparkle cx={82} cy={20} r={6} />
          <Sparkle cx={18} cy={30} r={4} />
        </Group>
      );
    case 'background':
      return <Burst />;
    case 'foreground':
      // Android schneidet auf die mittleren 66 von 108 dp zu: Budi bleibt in diesem Kreis.
      return <Placed cx={50} cy={53} s={0.48} />;
    case 'monochrome':
      return <Placed cx={50} cy={53} s={0.48} mono />;
    case 'favicon':
      return (
        <Group>
          <Group clip={{ rect: { x: 2, y: 2, width: 96, height: 96 }, rx: 22, ry: 22 }}>
            <Burst />
          </Group>
          <Placed cx={50} cy={54} s={0.92} />
        </Group>
      );
    case 'splash':
      return (
        <Group>
          <Dot cx={50} cy={40} r={30} fill={c.sun} flat line={0} />
          <Circle cx={50} cy={40} r={30} color={colors.cream} opacity={0.55} />
          <Placed cx={50} cy={42} s={0.62} />
          <Sparkle cx={78} cy={18} r={5} color={c.star} />
          <Sparkle cx={22} cy={28} r={3.5} color={c.star} />
          {font ? <Logo font={font} y={88} /> : null}
        </Group>
      );
  }
}
