// "Tipp den Kreis": Knospen antippen, bevor ihr Ring abläuft. Kreis, Effekte und Treffer laufen über
// Shared Values auf dem UI-Thread (60 fps); React bekommt nur Punkte, Kombo und Popups.
// Feedback (Auftrag 40): Blütenblatt-Partikel, kurzes Anhalten, Wackeln, "+1", Kombo-Zähler.

import { Canvas, Group } from '@shopify/react-native-skia';
import { useCallback, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { minigameFun } from '../../../../content/strings';
import { MINIGAME_FEEL } from '../../../../game/config';
import { cue, useMinigameAudio } from '../../../../lib/audio';
import { colors, funColors, gameColors } from '../../../../lib/theme';
import { ComboBadge } from '../fx/ComboBadge';
import { EventBanner, useBanner } from '../fx/EventBanner';
import { comboAfterHit } from '../fx/fxLogic';
import { FxLayer } from '../fx/FxLayer';
import { PopupLayer } from '../fx/PopupLayer';
import { useFx } from '../fx/useFx';
import { useShakeTransform } from '../fx/useShake';
import { usePointerInput } from '../input/usePointerInput';
import type { MinigameSession } from '../useMinigameSession';
import { NO_CIRCLE, isHit, needsRespawn, placeCircle, radiusForHits, type TapCircle } from './tapCircle';
import { circleLifetime, inFinale, pointsForCircle, rollGolden } from './tapGolden';
import { TapScene } from './TapScene';

/** Platz für den Zeit-Ring um die Knospe, damit er nicht am Rand abgeschnitten wird. */
const RING_ROOM = 12;

/** Neue Knospe irgendwo im Feld, mit Abstand für den Ring. Manchmal golden (Auftrag 45). */
function spawn(width: number, height: number, hits: number, elapsedMs: number): TapCircle {
  'worklet';
  const r = radiusForHits(hits);
  const placed = placeCircle(Math.random(), Math.random(), width, height, r + RING_ROOM, elapsedMs);
  return { ...placed, r, golden: rollGolden(Math.random(), elapsedMs) };
}

/** Farben der Partikel: 0 Blütenblatt, 1 Licht, 2 Fehltipp, 3 Gold. */
const PALETTE = [colors.lavender, colors.lamp, gameColors.creamDeep, funColors.gold] as const;

export function TapCircleGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, hitStop, phase, result } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const circle = useSharedValue<TapCircle>(NO_CIRCLE);
  const hits = useSharedValue(0);
  const combo = useSharedValue(0);
  const lastHitMs = useSharedValue<number | null>(null);
  const [comboShown, setComboShown] = useState(0);
  const finaleShown = useSharedValue(false);
  const { banner, show: showBanner, clear: clearBanner } = useBanner();
  const fx = useFx();
  const shakeTransform = useShakeTransform(fx.state, fx.now);
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
    fx.shakeHit();
    hitStop(MINIGAME_FEEL.hitStopMs);
    const { width, height } = size.get();
    circle.set(spawn(width, height, hits.get(), elapsedMs));
    scheduleOnRN(onHit, c.x, c.y, nextCombo, pointsForCircle(c), c.golden === true);
  };

  const gesture = usePointerInput({ onDown: tapAt });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    size.set({ width, height });
  };

  return (
    <GestureDetector gesture={gesture}>
      <View className="flex-1 overflow-hidden" onLayout={onLayout}>
        <Canvas style={{ flex: 1 }} pointerEvents="none">
          <Group transform={shakeTransform}>
            <TapScene circle={circle} clock={clock} size={size} />
            <FxLayer state={fx.state} now={fx.now} palette={PALETTE} />
          </Group>
        </Canvas>
        <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
        <ComboBadge combo={comboShown} />
        <EventBanner banner={banner} onDone={clearBanner} />
      </View>
    </GestureDetector>
  );
}
