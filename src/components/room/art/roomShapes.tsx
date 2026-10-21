import { Group, LinearGradient, RoundedRect, vec } from '@shopify/react-native-skia';

// Grundformen im Spielstil (ART-4): dicke dunkle Kontur, Verlauf, Glanzkante oben.
// Einheiten wie RoomArt: Bildbreite = 100.

/** Konturbreite der Möbel in Einheiten (bei 390 Punkten Breite gut 3 Punkte). */
export const LINE = 0.8;

interface BoxProps {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number;
  /** Oben hell, unten dunkel. */
  top: string;
  bottom: string;
  outline: string;
  /** Glanzstreifen oben, leer = keiner. */
  gloss?: string;
}

/** Gefüllter Kasten mit Kontur und Glanz, die Grundform für Möbel, Rahmen und Bücher. */
export function Box({ x, y, w, h, r, top, bottom, outline, gloss }: BoxProps) {
  return (
    <Group>
      <RoundedRect x={x - LINE} y={y - LINE} width={w + LINE * 2} height={h + LINE * 2} r={r + LINE} color={outline} />
      <RoundedRect x={x} y={y} width={w} height={h} r={r}>
        <LinearGradient start={vec(0, y)} end={vec(0, y + h)} colors={[top, bottom]} />
      </RoundedRect>
      {gloss && h > 2 ? (
        <RoundedRect x={x + Math.min(1.2, w * 0.15)} y={y + 0.5} width={w - Math.min(2.4, w * 0.3)} height={Math.min(1.2, h * 0.22)} r={0.6} color={gloss} />
      ) : null}
    </Group>
  );
}
