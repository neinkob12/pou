// Bild auf der Auswahl-Karte (Auftrag 40, Auftrag 51): die Hauptfigur jedes Spiels auf einem runden,
// glänzenden Feld in der Kartenfarbe, aus denselben Sprites wie im Spiel. Ein stilles Bild.

import { Skia, type SkCanvas } from '@shopify/react-native-skia';

import { colors } from '../../../lib/theme';
import { drawDropIcon } from '../drops/dropsArt';
import { drawBudiIcon } from '../jump/jumpArt';
import { drawMiteIcon } from '../smash/smashArt';
import { circlePath, outlined, type Pen } from './art/kit';
import { ink } from './art/palette';
import { StillPicture, type BackdropDraw } from './art/Stage';
import type { MinigameInfo } from './catalog';
import { drawBudIcon } from './example/tapArt';

const SIZE = 72;
const C = SIZE / 2;

function figure(id: MinigameInfo['id'], c: SkCanvas, pen: Pen) {
  'worklet';
  c.save();
  if (id === 'tap') {
    c.translate(C, C);
    c.scale(23, 23);
    drawBudIcon(c, pen);
  } else if (id === 'smash') {
    c.translate(C, C - 2);
    c.scale(24, 24);
    drawMiteIcon(c, pen);
  } else if (id === 'drops') {
    c.translate(C, C + 3);
    c.scale(18, 18);
    drawDropIcon(c, pen);
  } else {
    c.translate(C - 1, C + 9);
    c.scale(17, 17);
    drawBudiIcon(c, pen);
    if (id === 'quiz') {
      // Fragezeichen neben Budi
      const q = Skia.PathBuilder.Make()
        .moveTo(0.9, -1.2)
        .quadTo(1.3, -1.9, 1.7, -1.3)
        .quadTo(1.8, -0.9, 1.35, -0.7)
        .lineTo(1.35, -0.45)
        .detach();
      c.drawPath(q, pen.stroke(ink.outline, 0.32));
      c.drawPath(q, pen.stroke(colors.white, 0.14));
      c.drawCircle(1.35, -0.1, 0.13, pen.fill(ink.outline));
    }
  }
  c.restore();
}

function iconDraw(game: MinigameInfo): BackdropDraw {
  return (c, pen) => {
    'worklet';
    const base = colors[game.color];
    outlined(c, pen, circlePath(C, C, C - 3), pen.radial(C * 0.7, C * 0.6, C * 1.3, [colors.white, base]), 1.5);
    c.drawOval(Skia.XYWHRect(C * 0.45, C * 0.2, C * 0.7, C * 0.32), pen.fill(ink.shineSoft));
    figure(game.id, c, pen);
  };
}

const draws = new Map<string, BackdropDraw>();

/** Bild in beliebiger Größe: gezeichnet wird immer in SIZE-Einheiten, dann skaliert (scharf). */
function scaledDraw(game: MinigameInfo, size: number): BackdropDraw {
  const base = iconDraw(game);
  const k = size / SIZE;
  return (c, pen, w, h) => {
    'worklet';
    c.save();
    c.scale(k, k);
    base(c, pen, w, h);
    c.restore();
  };
}

export function MinigameIcon({ game, size = SIZE }: { game: MinigameInfo; size?: number }) {
  const key = `${game.id}:${size}`;
  let draw = draws.get(key);
  if (!draw) {
    draw = scaledDraw(game, size);
    draws.set(key, draw);
  }
  return <StillPicture width={size} height={size} draw={draw} />;
}
