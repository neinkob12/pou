// "Tipp den Kreis": Knospen antippen, bevor ihr Ring abläuft. Kreis, Effekte und Treffer laufen über
// Shared Values auf dem UI-Thread (60 fps); React bekommt nur Punkte, Kombo und Popups.
// Feedback (Auftrag 40): Blütenblatt-Partikel, kurzes Anhalten, Wackeln, "+1", Kombo-Zähler.

import { useCallback, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { minigameFun } from '../../../../content/strings';
import { MINIGAME_FEEL } from '../../../../game/config';
import { cue, useMinigameAudio } from '../../../../lib/audio';
import { colors, funColors } from '../../../../lib/theme';
import { Drift } from '../art/Drift';
import { sparks, tones } from '../art/palette';
import { Stage } from '../art/Stage';
import { useScene } from '../art/useScene';
import { ComboBadge } from '../fx/ComboBadge';
import { EventBanner, useBanner } from '../fx/EventBanner';
import { comboAfterHit, comboSlowMo } from '../fx/fxLogic';
import { PopupLayer } from '../fx/PopupLayer';
import { useFx } from '../fx/useFx';
import { useShakeStyle } from '../fx/useShake';
import { usePointerInput } from '../input/usePointerInput';
import type { MinigameSession } from '../useMinigameSession';
import { NO_CIRCLE, isHit, needsRespawn, placeCircle, radiusForHits, type TapCircle } from './tapCircle';
import { circleLifetime, inFinale, pointsForCircle, rollGolden } from './tapGolden';
import { drawTapBackdrop, drawTapBokeh } from './tapArt';
import { drawTapScene } from './tapScene';

/** Platz für den Zeit-Ring um die Knospe, damit er nicht am Rand abgeschnitten wird. */
const RING_ROOM = 12;

/** Neue Knospe irgendwo im Feld, mit Abstand für den Ring. Manchmal golden (Auftrag 45). */
function spawn(width: number, height: number, hits: number, elapsedMs: number): TapCircle {
  'worklet';
  const r = radiusForHits(hits);
  const placed = placeCircle(Math.random(), Math.random(), width, height, r + RING_ROOM, elapsedMs);
  return { ...placed, r, golden: rollGolden(Math.random(), elapsedMs) };
}

/** Farben der Partikel und Ringe: 0 Blütenblatt, 1 Licht, 2 Fehltipp, 3 Gold, 4 Ring. */
const PALETTE = [tones.petal.base, sparks.white, tones.petal.light, sparks.gold, sparks.white] as const;
/** Licht und Gold fliegen als Funkel-Sterne. */
const SPARKLES = [1, 3] as const;

/** Lichtkugeln ziehen langsam nach oben (Parallaxe). */
function bokehLayer(width: number, height: number) {
  return <Drift width={width} height={height} draw={drawTapBokeh} durationMs={14000} direction="up" />;
}

export function TapCircleGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, hitStop, slowMo, phase, result } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const circle = useSharedValue<TapCircle>(NO_CIRCLE);
  const hits = useSharedValue(0);
  const combo = useSharedValue(0);
  const lastHitMs = useSharedValue<number | null>(null);
  const [comboShown, setComboShown] = useState(0);
  const finaleShown = useSharedValue(false);
  const { banner, show: showBanner, clear: clearBanner } = useBanner();
  const fx = useFx(session.timeScale);
  const shakeStyle = useShakeStyle(fx.state, fx.now, size);
  const scene = useScene((canvas) => {
    'worklet';
    const { width, height } = size.get();
    drawTapScene(canvas, {
      circle: circle.get(),
      elapsedMs: clock.get().elapsedMs,
      width,
      height,
      fx: fx.state.get(),
      now: fx.now.get(),
      palette: PALETTE,
      sparkles: SPARKLES,
    });
  });
  useMinigameAudio(phase, result?.coins ?? null);

  // Kreis erscheint zum Spielstart und springt weiter, wenn er zu lange stehen bleibt.
  useFrameCallback(() => {
    'worklet';
    const { phase: p, elapsedMs } = clock.get();
    const { width, height } = size.get();
    if (p !== 'playing' || width === 0) return;
    if (!finaleShown.get() && inFinale(elapsedMs)) {
      finaleShown.set(true);
      scheduleOnRN(showBanner, minigameFun.tapFinale, colors.coral);
    }
    const c = circle.get();
    if (needsRespawn(c, elapsedMs, circleLifetime(c))) {
      if (c.r > 0) {
        fx.burstAt(c.x, c.y, { count: 6, color: 2, speed: 0.35 });
        if (combo.get() > 0) {
          combo.set(0);
          scheduleOnRN(setComboShown, 0);
        }
      }
      circle.set(spawn(width, height, hits.get(), elapsedMs));
    }
  });

  const onHit = useCallback(
    (x: number, y: number, nextCombo: number, points: number, golden: boolean) => {
      cue(golden ? 'collect' : 'catch');
      addScore(points);
      if (golden) fx.popup(x, y - 10, `+${points} ${minigameFun.tapGolden}`, funColors.goldDeep, true);
      else fx.popup(x, y - 10, `+${points}`, colors.plantDark, nextCombo >= MINIGAME_FEEL.comboShowFrom);
      setComboShown(nextCombo);
    },
    [addScore, fx],
  );

  const tapAt = (x: number, y: number) => {
    'worklet';
    const { phase: p, elapsedMs } = clock.get();
    if (p !== 'playing') return;
    const c = circle.get();
    if (!isHit(c, x, y)) {
      fx.burstAt(x, y, { count: 5, color: 2, speed: 0.3, size: 0.8 });
      return;
    }
    hits.set(hits.get() + 1);
    const nextCombo = comboAfterHit(combo.get(), lastHitMs.get(), elapsedMs);
    combo.set(nextCombo);
    lastHitMs.set(elapsedMs);
    fx.burstAt(c.x, c.y, { count: 14, color: c.golden ? 3 : 0, size: 1.3 });
    fx.burstAt(c.x, c.y, { count: c.golden ? 16 : 8, color: 1, speed: c.golden ? 1 : 0.6 });
    fx.ringAt(c.x, c.y, c.golden ? 3 : 4, c.r / 40);
    fx.shakeHit();
    hitStop(MINIGAME_FEEL.hitStopMs);
    if (c.golden) fx.flash();
    if (comboSlowMo(nextCombo)) {
      slowMo();
      fx.flash();
      fx.ringAt(c.x, c.y, 3, 2.4);
      fx.burstAt(c.x, c.y, { count: 18, color: 3, speed: 1.3, size: 1.2 });
    }
    const { width, height } = size.get();
    circle.set(spawn(width, height, hits.get(), elapsedMs));
    scheduleOnRN(onHit, c.x, c.y, nextCombo, pointsForCircle(c), c.golden === true);
  };

  const gesture = usePointerInput({ onDown: tapAt });

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      size.set({ width, height });
    },
    [size],
  );

  return (
    <GestureDetector gesture={gesture}>
      <View className="flex-1 overflow-hidden">
        <Stage
          scene={scene}
          backdrop={drawTapBackdrop}
          layers={bokehLayer}
          onLayout={onLayout}
          shakeStyle={shakeStyle}
        />
        <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
        <ComboBadge combo={comboShown} />
        <EventBanner banner={banner} onDone={clearBanner} />
      </View>
    </GestureDetector>
  );
}
