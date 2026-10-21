import { Circle, Group, LinearGradient, Oval, Path, Rect, RoundedRect, vec } from '@shopify/react-native-skia';

import { artColors, colors } from '../../../lib/theme';
import { Depth, Garland, HangingPlant, Moonbeam } from './RoomDecor';
import { roomLayout, type RoomLayout } from './roomLayout';

const OUTLINE = 0.9;

function Outlined({ x, y, width, height, r, fill }: { x: number; y: number; width: number; height: number; r: number; fill: string }) {
  return (
    <>
      <RoundedRect x={x - OUTLINE} y={y - OUTLINE} width={width + OUTLINE * 2} height={height + OUTLINE * 2} r={r + OUTLINE} color={artColors.outline} />
      <RoundedRect x={x} y={y} width={width} height={height} r={r} color={fill} />
    </>
  );
}

function Wall({ l, isDay }: { l: RoomLayout; isDay: boolean }) {
  const stripes = Array.from({ length: 11 }, (_, i) => i * 10 - 1);
  return (
    <Group>
      <Rect x={0} y={0} width={100} height={l.floorY}>
        <LinearGradient
          start={vec(0, 0)}
          end={vec(0, l.floorY)}
          colors={isDay ? [artColors.wallDayTop, artColors.wallDayBottom] : [artColors.wallNightTop, artColors.wallNightBottom]}
        />
      </Rect>
      {stripes.map((x) => (
        <Rect key={x} x={x} y={0} width={3} height={l.floorY} color={isDay ? artColors.wallPattern : artColors.wallPatternNight} opacity={0.35} />
      ))}
      {/* Fußleiste */}
      <Rect x={0} y={l.floorY - 2.4} width={100} height={2.4} color={isDay ? artColors.wood : artColors.floorNightShade} />
      <Rect x={0} y={l.floorY - 0.5} width={100} height={0.5} color={artColors.outline} opacity={0.5} />
    </Group>
  );
}

function Floor({ l, isDay }: { l: RoomLayout; isDay: boolean }) {
  const planks = Array.from({ length: 8 }, (_, i) => l.floorY + 4 + i * 7);
  const fill = isDay ? artColors.floor : artColors.floorNight;
  const shade = isDay ? artColors.floorShade : artColors.floorNightShade;
  return (
    <Group>
      <Rect x={0} y={l.floorY} width={100} height={l.height - l.floorY} color={fill} />
      {planks.map((y, i) => (
        <Group key={y}>
          <Rect x={0} y={y} width={100} height={0.5} color={shade} />
          <Rect x={i % 2 ? 30 : 64} y={y - 7} width={0.5} height={7} color={shade} />
        </Group>
      ))}
      {/* Teppich mit Schatten unter Budi */}
      <Oval x={10} y={l.rugY - 6.5} width={80} height={13} color={artColors.outline} opacity={0.25} />
      <Oval x={11} y={l.rugY - 6.8} width={78} height={12.6} color={isDay ? artColors.rug : artColors.rugNight} />
      <Oval x={16} y={l.rugY - 4.8} width={68} height={8.6} color={isDay ? artColors.rugShade : artColors.rugNightShade} opacity={0.5} />
      {/* Fransen-Muster am Rand */}
      <Oval x={13.5} y={l.rugY - 5.9} width={73} height={10.8} color={colors.white} opacity={isDay ? 0.35 : 0.15} style="stroke" strokeWidth={0.4} />
      <Oval x={30} y={l.rugY - 2.6} width={40} height={4.6} color={artColors.outline} opacity={0.22} />
    </Group>
  );
}

function Window({ l, isDay }: { l: RoomLayout; isDay: boolean }) {
  const { x, y, w, h } = l.window;
  const stars = [
    [0.2, 0.2],
    [0.7, 0.15],
    [0.45, 0.35],
    [0.15, 0.6],
    [0.8, 0.5],
    [0.6, 0.7],
  ];
  return (
    <Group>
      <Outlined x={x - 1.6} y={y - 1.6} width={w + 3.2} height={h + 3.2} r={2.4} fill={artColors.wood} />
      <RoundedRect x={x} y={y} width={w} height={h} r={1.2}>
        <LinearGradient
          start={vec(x, y)}
          end={vec(x, y + h)}
          colors={isDay ? [artColors.skyDayTop, artColors.skyDayBottom] : [artColors.skyNightTop, artColors.skyNightBottom]}
        />
      </RoundedRect>
      {isDay ? (
        <Group>
          <Circle cx={x + w * 0.72} cy={y + h * 0.28} r={w * 0.16} color={artColors.sun} opacity={0.35} />
          <Circle cx={x + w * 0.72} cy={y + h * 0.28} r={w * 0.11} color={artColors.sun} />
          <Oval x={x + w * 0.08} y={y + h * 0.5} width={w * 0.42} height={h * 0.12} color={artColors.cloud} />
          <Oval x={x + w * 0.16} y={y + h * 0.43} width={w * 0.24} height={h * 0.14} color={artColors.cloud} />
        </Group>
      ) : (
        <Group>
          {stars.map(([sx, sy]) => (
            <Circle key={`${sx}${sy}`} cx={x + w * sx} cy={y + h * sy} r={0.45} color={artColors.moon} />
          ))}
          <Circle cx={x + w * 0.68} cy={y + h * 0.3} r={w * 0.13} color={artColors.moon} />
          <Circle cx={x + w * 0.75} cy={y + h * 0.25} r={w * 0.11} color={artColors.skyNightTop} />
        </Group>
      )}
      {/* Fensterkreuz */}
      <Rect x={x + w / 2 - 0.7} y={y} width={1.4} height={h} color={artColors.wood} />
      <Rect x={x} y={y + h / 2 - 0.7} width={w} height={1.4} color={artColors.wood} />
      {/* Fensterbrett */}
      <Outlined x={x - 3} y={y + h + 1.4} width={w + 6} height={2.4} r={1} fill={artColors.woodShade} />
      {/* Vorhänge */}
      {[x - 3.5, x + w - 3.5].map((cx, i) => (
        <Group key={cx}>
          <Path
            path={`M${cx} ${y - 3} L${cx + 7} ${y - 3} Q${cx + (i ? 3 : 4)} ${y + h * 0.5} ${cx + (i ? 6.5 : 0.5)} ${y + h + 1} L${cx + (i ? 3.5 : 0)} ${y + h + 1} Q${cx + (i ? 0 : 1)} ${y + h * 0.5} ${cx} ${y - 3} Z`}
            color={artColors.curtain}
          />
          <Path
            path={`M${cx} ${y - 3} L${cx + 7} ${y - 3} Q${cx + (i ? 3 : 4)} ${y + h * 0.5} ${cx + (i ? 6.5 : 0.5)} ${y + h + 1} L${cx + (i ? 3.5 : 0)} ${y + h + 1} Q${cx + (i ? 0 : 1)} ${y + h * 0.5} ${cx} ${y - 3} Z`}
            color={artColors.outline}
            style="stroke"
            strokeWidth={0.6}
          />
        </Group>
      ))}
      <Outlined x={x - 5} y={y - 4.4} width={w + 10} height={1.6} r={0.8} fill={artColors.woodShade} />
      {/* Sonnenlicht fällt schräg auf den Boden */}
      {isDay ? (
        <Path
          path={`M${x} ${y + h} L${x + w} ${y + h} L${x + w + 18} ${l.floorY + 14} L${x + 10} ${l.floorY + 14} Z`}
          color={artColors.sun}
          opacity={0.13}
        />
      ) : null}
    </Group>
  );
}

function Shelf({ l, isDay }: { l: RoomLayout; isDay: boolean }) {
  const { x, y, w } = l.shelf;
  const books = [
    { dx: 1.5, bw: 2.6, bh: 8, c: artColors.curtain },
    { dx: 4.3, bw: 2.2, bh: 9.5, c: artColors.rug },
    { dx: 6.7, bw: 2.8, bh: 7.2, c: artColors.leafShade },
  ];
  const dim = isDay ? 1 : 0.75;
  return (
    <Group opacity={dim}>
      {books.map((b) => (
        <Outlined key={b.dx} x={x + b.dx} y={y - b.bh} width={b.bw} height={b.bh} r={0.6} fill={b.c} />
      ))}
      {/* Kleiner Kaktus im Mini-Topf */}
      <Outlined x={x + w - 8.5} y={y - 9.5} width={3.6} height={6.6} r={1.8} fill={artColors.leafShade} />
      <Path path={`M${x + w - 10} ${y - 3.4} L${x + w - 3.4} ${y - 3.4} L${x + w - 4.2} ${y} L${x + w - 9.2} ${y} Z`} color={artColors.pot} />
      <Path
        path={`M${x + w - 10} ${y - 3.4} L${x + w - 3.4} ${y - 3.4} L${x + w - 4.2} ${y} L${x + w - 9.2} ${y} Z`}
        color={artColors.outline}
        style="stroke"
        strokeWidth={0.6}
      />
      {/* Bilderrahmen mit Herz */}
      <Outlined x={x + 11} y={y - 7.5} width={6} height={7} r={0.8} fill={artColors.wallDayBottom} />
      <Path
        path={`M${x + 14} ${y - 2.4} C${x + 12} ${y - 3.6} ${x + 12.4} ${y - 5.6} ${x + 14} ${y - 4.6} C${x + 15.6} ${y - 5.6} ${x + 16} ${y - 3.6} ${x + 14} ${y - 2.4} Z`}
        color={artColors.curtain}
      />
      <Outlined x={x} y={y} width={w} height={1.8} r={0.6} fill={artColors.wood} />
      <Rect x={x + 2} y={y + 1.8} width={1} height={2.4} color={artColors.woodShade} />
      <Rect x={x + w - 3} y={y + 1.8} width={1} height={2.4} color={artColors.woodShade} />
    </Group>
  );
}

/** Budis Zimmer: Wand, Fenster mit Tag und Nacht, Regal, Holzboden, Teppich. Einheiten: Breite 100. */
export function RoomArt({ width, height, isDay }: { width: number; height: number; isDay: boolean }) {
  const l = roomLayout(width, height);
  return (
    <Group>
      <Wall l={l} isDay={isDay} />
      <Window l={l} isDay={isDay} />
      <Shelf l={l} isDay={isDay} />
      <HangingPlant l={l} isDay={isDay} />
      <Garland l={l} isDay={isDay} />
      <Floor l={l} isDay={isDay} />
      {isDay ? null : <Moonbeam l={l} />}
      <Depth l={l} isDay={isDay} />
    </Group>
  );
}
