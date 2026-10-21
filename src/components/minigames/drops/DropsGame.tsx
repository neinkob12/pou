// "Tropfen fangen": Topf unten per Wischen (oder Pfeiltasten am Rechner) bewegen, Wasser und Dünger
// fangen, Salz meiden. Feld und Topf sind Shared Values (UI-Thread, 60 fps). React bekommt nur Punkte,
// Leben und Fänge. Am Rundenende füllen die Fänge Budis Balken über applyCare (dropsReward.ts).
// Feedback (Auftrag 40): Spritzer, Topf federt, Popups, Wackeln bei Salz, Kombo für Fänge in Folge.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { dropsGame as t, minigameFeel } from '../../../content/strings';
import { DROPS_GAME, MINIGAME_FRAMEWORK } from '../../../game/config';
import { cue, useMinigameAudio } from '../../../lib/audio';
import { colors } from '../../../lib/theme';
import { Drift } from '../framework/art/Drift';
import { sparks, tones } from '../framework/art/palette';
import { Stage } from '../framework/art/Stage';
import { useScene } from '../framework/art/useScene';
import { ComboBadge } from '../framework/fx/ComboBadge';
import { EventBanner, useBanner } from '../framework/fx/EventBanner';
import { crossesSlowMo } from '../framework/fx/fxLogic';
import { PopupLayer } from '../framework/fx/PopupLayer';
import { useFx } from '../framework/fx/useFx';
import { useShakeStyle } from '../framework/fx/useShake';
import { useKeyAxis } from '../framework/input/useKeyboard';
import type { MinigameSession } from '../framework/useMinigameSession';
import { drawDropsBackdrop, drawDropsClouds } from './dropsArt';
import { drawDropsScene } from './dropsScene';
import { floorY, movePotByKeys, vanishedDrops } from './dropsFeel';
import { DropsHud } from './DropsHud';
import {
  barGain,
  clampPot,
  createField,
  grantExtraLife,
  inShower,
  potTop,
  stepField,
  type DropsReward,
} from './dropsLogic';
import { applyDropsReward } from './dropsReward';
import { useDropsSpecial } from './useDropsSpecial';

/** Partikel und Ringe: 0 Wasser, 1 Dünger, 2 Salz, 3 Gold, 4 Schutzblatt, 5 Funken. */
const PALETTE = [tones.water.base, tones.fertilizer.base, tones.salt.dark, sparks.gold, tones.leaf.base, sparks.white] as const;
const SPARKLES = [3, 5] as const;

/** Wolken ziehen langsam nach links (Parallaxe). */
function cloudLayer(width: number, height: number) {
  return <Drift width={width} height={height} draw={drawDropsClouds} durationMs={40000} direction="left" />;
}
const KIND_COLOR = { water: 0, fertilizer: 1, salt: 2, golden: 3, leaf: 4 } as const;

export function DropsGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, endGame, setExtraLifeHandler, slowMo, phase, result } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const field = useSharedValue(createField(0));
  const lastCatchMs = useSharedValue(-1e9);
  const streak = useSharedValue(0);
  const keyAxis = useKeyAxis();
  const [lives, setLives] = useState<number>(DROPS_GAME.lives);
  const [caught, setCaught] = useState({ water: 0, fertilizer: 0 });
  const [combo, setCombo] = useState(0);
  const showerOn = useSharedValue(false);
  const { banner, show: showBanner, clear: clearBanner } = useBanner();
  const [reward, setReward] = useState<DropsReward | null | undefined>(undefined);
  const rewardedRef = useRef(false);
  const fx = useFx(session.timeScale);
  const shakeStyle = useShakeStyle(fx.state, fx.now, size);
  const scene = useScene((canvas) => {
    'worklet';
    const { width, height } = size.get();
    drawDropsScene(canvas, {
      field: field.get(),
      elapsedMs: clock.get().elapsedMs,
      width,
      height,
      now: fx.now.get(),
      lastCatchMs: lastCatchMs.get(),
      fx: fx.state.get(),
      palette: PALETTE,
      sparkles: SPARKLES,
    });
  });
  useMinigameAudio(phase, result?.coins ?? null);

  const onStep = useCallback(
    (
      points: number,
      livesLeft: number,
      water: number,
      fertilizer: number,
      livesLost: number,
      run: number,
      x: number,
    ) => {
      if (livesLost > 0) cue(livesLeft <= 0 ? 'fail' : 'ouch');
      else if (points > 0) cue('catch');
      const y = potTop(size.get().height) - 16;
      if (points > 0) {
        addScore(points);
        setCaught({ water, fertilizer });
        fx.popup(x, y, `+${points}`, colors.plantDark, run >= 5);
      }
      if (livesLost > 0) fx.popup(x, y, minigameFeel.dropsSalt, colors.coral, true);
      setCombo(run);
      setLives(livesLeft);
      if (livesLeft <= 0) endGame();
    },
    [addScore, endGame, fx, size],
  );

  const onSpecial = useDropsSpecial(fx, showBanner, size);

  useFrameCallback((frame) => {
    'worklet';
    const { phase: p, elapsedMs } = clock.get();
    const { width, height } = size.get();
    const start = field.get();
    if (p !== 'playing' || width === 0 || start.lives <= 0) return;
    const dt = Math.min(frame.timeSincePreviousFrame ?? 0, MINIGAME_FRAMEWORK.maxFrameStepMs);
    const axis = keyAxis.get();
    const before = axis === 0 ? start : { ...start, potX: movePotByKeys(start.potX, axis, dt, width) };
    const { field: next, events } = stepField(before, dt, elapsedMs, width, height, Math.random(), Math.random());
    field.set(next);
    let catchX = next.potX;
    let streakBroken = false;
    for (const v of vanishedDrops(before, next, height)) {
      if (v.caught) {
        catchX = v.x;
        fx.burstAt(v.x, potTop(height), {
          count: v.kind === 'salt' ? 8 : 10,
          color: KIND_COLOR[v.kind],
          upward: true,
        });
      } else if (v.kind !== 'salt' && v.kind !== 'leaf') {
        // Daneben: kleiner Platscher am Boden, Serie vorbei.
        fx.burstAt(v.x, floorY(height), {
          count: 5,
          color: KIND_COLOR[v.kind],
          upward: true,
          speed: 0.45,
          size: 0.7,
        });
        streakBroken = streak.get() > 0;
        streak.set(0);
      }
    }
    if (events.points > 0) {
      lastCatchMs.set(fx.now.get());
      const before = streak.get();
      streak.set(before + events.points);
      fx.ringAt(catchX, potTop(height), 0, 0.8);
      // Zeitlupe, wenn die Serie eine volle Stufe überschreitet (5, 10, 15 ...).
      if (crossesSlowMo(before, before + events.points)) {
        slowMo();
        fx.flash();
        fx.ringAt(catchX, potTop(height), 3, 2);
        fx.burstAt(catchX, potTop(height), { count: 14, color: 5, upward: true, speed: 1.2 });
      }
    }
    if (events.livesLost > 0) {
      streak.set(0);
      fx.shakeFail();
      fx.ringAt(catchX, potTop(height), 2, 1.4);
    }
    const shower = inShower(elapsedMs);
    if (shower !== showerOn.get()) {
      showerOn.set(shower);
      if (shower) scheduleOnRN(onSpecial, 'shower', next.potX);
    }
    if (events.golden) scheduleOnRN(onSpecial, 'golden', catchX);
    if (events.shieldGained) scheduleOnRN(onSpecial, 'shield', catchX);
    if (events.shieldUsed) {
      fx.burstAt(catchX, potTop(height), {
        count: 12,
        color: 4,
        upward: true,
        speed: 0.8,
      });
      scheduleOnRN(onSpecial, 'shieldUsed', catchX);
    }
    if (events.points > 0 || events.livesLost > 0 || streakBroken) {
      scheduleOnRN(
        onStep,
        events.points,
        next.lives,
        next.caughtWater,
        next.caughtFertilizer,
        events.livesLost,
        streak.get(),
        catchX,
      );
    }
  });

  // Extra-Leben (P29): ein Leben zurück, Salz vom Feld.
  useEffect(() => {
    setExtraLifeHandler(() => {
      const next = grantExtraLife(field.get());
      field.set(next);
      setLives(next.lives);
    });
    return () => setExtraLifeHandler(null);
  }, [field, setExtraLifeHandler]);

  // Rundenende (auch "Aufhören" in der Pause): einmal die Balken füllen.
  useEffect(() => {
    if (!result || rewardedRef.current) return;
    rewardedRef.current = true;
    const f = field.get();
    setReward(applyDropsReward(f.caughtWater, f.caughtFertilizer));
  }, [field, result]);

  const pan = usePanGesture({
    minDistance: 0,
    onUpdate: (e) => {
      'worklet';
      const f = field.get();
      field.set({ ...f, potX: clampPot(f.potX + e.changeX, size.get().width) });
    },
  });

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      size.set({ width, height });
      const f = field.get();
      field.set({ ...f, potX: clampPot(f.potX || width / 2, width) });
    },
    [field, size],
  );

  const gain = {
    water: barGain(caught.water),
    nutrients: barGain(caught.fertilizer),
  };
  return (
    <View className="flex-1">
      <DropsHud lives={lives} gain={gain} reward={reward} />
      <GestureDetector gesture={pan}>
        <View className="flex-1 overflow-hidden">
          <Stage
            scene={scene}
            backdrop={drawDropsBackdrop}
            layers={cloudLayer}
            onLayout={onLayout}
            shakeStyle={shakeStyle}
          />
          <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
          <ComboBadge combo={combo} />
          <EventBanner banner={banner} onDone={clearBanner} />
          {phase === 'countdown' && (
            <View className="absolute inset-x-0 bottom-24 items-center gap-1 px-6" pointerEvents="none">
              <Text className="text-center font-body-bold text-base text-ink">{t.hint}</Text>
              {Platform.OS === 'web' && (
                <Text className="text-center font-body text-sm text-inkMuted">{minigameFeel.keyboardHint}</Text>
              )}
            </View>
          )}
        </View>
      </GestureDetector>
    </View>
  );
}
