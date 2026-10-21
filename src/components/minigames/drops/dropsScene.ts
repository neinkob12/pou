// Bewegte Szene von "Tropfen fangen" (Auftrag 51): Tropfen pendeln und strecken sich im Fall, Topf
// federt beim Fangen (Squash & Stretch), Schutzblase pulsiert, im Regenschauer fallen Regenstriche.
// Alles in eine Picture.
// Reihenfolge beachten: Worklets werden im Web nicht vorgezogen, Helfer stehen vor ihrer Nutzung.

import { Skia, StrokeCap, type SkCanvas, type SkPaint } from '@shopify/react-native-skia';

import { DROPS_GAME } from '../../../game/config';
import { drawFlash, drawFx } from '../framework/art/drawFx';
import { cached, stamp } from '../framework/art/kit';
import { tones } from '../framework/art/palette';
import type { FxState } from '../framework/fx/fxLogic';
import { potSquash } from './dropsFeel';
import { dropsSprites } from './dropsArt';
import { inShower, potTop, type DropsField } from './dropsLogic';

const R = DROPS_GAME.dropRadius;
const PH = DROPS_GAME.potHeight;

function rainPaint(): SkPaint {
  'worklet';
  return cached('drops:rain', () => {
    const p = Skia.Paint();
    p.setAntiAlias(true);
    p.setColor(Skia.Color(tones.water.light));
    p.setAlphaf(0.7);
    p.setStrokeWidth(2);
    p.setStrokeCap(StrokeCap.Round);
    return p;
  });
}

export interface DropsFrame {
  field: DropsField;
  elapsedMs: number;
  width: number;
  height: number;
  /** Effekt-Uhr und letzter Fang, für das Federn des Topfs. */
  now: number;
  lastCatchMs: number;
  fx: FxState;
  palette: readonly string[];
  sparkles: readonly number[];
}

function drawRain(canvas: SkCanvas, width: number, height: number, now: number) {
  'worklet';
  const paint = rainPaint();
  for (let i = 0; i < 24; i += 1) {
    const x = ((i * 53) % 100) / 100 * width;
    const y = ((now * 0.9 + i * 137) % (height + 40)) - 20;
    canvas.drawLine(x, y, x - 4, y + 16, paint);
  }
}

export function drawDropsScene(canvas: SkCanvas, f: DropsFrame) {
  'worklet';
  const sprites = dropsSprites();
  if (f.width === 0) return;
  if (inShower(f.elapsedMs)) drawRain(canvas, f.width, f.height, f.now);
  // Topf mit Schatten auf dem Brett
  const squash = potSquash(f.now - f.lastCatchMs);
  const top = potTop(f.height);
  const x = f.field.potX;
  stamp(canvas, sprites.potShadow, x, top + PH + 1, 2 - squash, 1);
  stamp(canvas, sprites.pot, x, top + PH * (1 - squash), 2 - squash, squash);
  if (f.field.shield) {
    const pulse = 1 + Math.sin(f.now / 160) * 0.04;
    stamp(canvas, sprites.bubble, x, top, pulse, pulse);
  }
  for (const d of f.field.drops) {
    const sway = Math.sin(f.now / 210 + d.id) * 0.12;
    if (d.kind === 'salt') stamp(canvas, sprites.salt, d.x, d.y, R * 0.95, R * 0.95, sway * 1.5);
    else if (d.kind === 'fertilizer') stamp(canvas, sprites.fertilizer, d.x, d.y, R, R, f.now / 400 + d.id);
    else if (d.kind === 'leaf') stamp(canvas, sprites.leaf, d.x, d.y, R, R, sway * 2.5);
    else {
      const sprite = d.kind === 'golden' ? sprites.golden : sprites.water;
      stamp(canvas, sprite, d.x, d.y, R * 0.92, R * 1.08, sway);
    }
  }
  drawFx(canvas, f.fx, f.now, f.palette, f.sparkles);
  drawFlash(canvas, f.fx, f.now, f.width, f.height);
}
