// "Schädlings-Smash": Whack-a-Mole auf einem großen Blatt. Zustand ist ein Shared Value; Auftauchen
// und Verschwinden laufen im Frame-Callback, Tipps werden ebenfalls auf dem UI-Thread ausgewertet,
// damit Frame und Tipp sich den Zustand nicht gegenseitig überschreiben.
// Feedback (Auftrag 40): Spritzer, kurzes Anhalten, Wackeln, Punkte-Popups, Kombo-Zähler.

import { useCallback, useEffect, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { minigameFun } from '../../../content/strings';
import { MINIGAME_FEEL, PEST_SMASH } from '../../../game/config';
import { cue, useMinigameAudio } from '../../../lib/audio';
import { colors, funColors } from '../../../lib/theme';
import { Stage } from '../framework/art/Stage';
import { useScene } from '../framework/art/useScene';
import { sparks, tones } from '../framework/art/palette';
import { ComboBadge } from '../framework/fx/ComboBadge';
import { EventBanner, useBanner } from '../framework/fx/EventBanner';
import { comboSlowMo } from '../framework/fx/fxLogic';
import { PopupLayer } from '../framework/fx/PopupLayer';
import { useFx } from '../framework/fx/useFx';
import { useShakeStyle } from '../framework/fx/useShake';
import { usePointerInput } from '../framework/input/usePointerInput';
import type { MinigameSession } from '../framework/useMinigameSession';
import {
  comboMultiplier,
  createSmashState,
  earnsPestProtection,
  holeAt,
  holeLayout,
  stepSmash,
  tapHole,
} from './pestSmash';
import { SmashInfo } from './SmashInfo';
import { drawSmashBackdrop } from './smashArt';
import { drawSmashScene } from './smashScene';
import { grantSmashReward } from './smashReward';

/** Partikel und Ringe: 0 Milbe, 1 Mücke, 2 Blattstücke, 3 Marienkäfer, 4 Fehltipp, 5 Panzer, 6 Funken. */
const PALETTE = [
  tones.mite.base,
  tones.gnat.light,
  tones.leaf.light,
  tones.ladybug.base,
  tones.mint.light,
  tones.shell.base,
  sparks.gold,
] as const;
/** Diese Partikel fliegen als Funkel-Sterne. */
const SPARKLES = [6] as const;

export function SmashGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, hitStop, slowMo, result, phase } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const state = useSharedValue(createSmashState());
  const score = useSharedValue(0);
  const [combo, setCombo] = useState(0);
  const { banner, show: showBanner, clear: clearBanner } = useBanner();
  const fx = useFx(session.timeScale);
  const shakeStyle = useShakeStyle(fx.state, fx.now, size);
  const scene = useScene((canvas) => {
    'worklet';
    const { width, height } = size.get();
    drawSmashScene(canvas, {
      state: state.get(),
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

  useFrameCallback(() => {
    'worklet';
    const { phase: p, elapsedMs } = clock.get();
    if (p !== 'playing' || size.get().width === 0) return;
    const before = state.get();
    const next = stepSmash(before, elapsedMs, Math.random(), Math.random(), PEST_SMASH);
    if (next === before) return;
    state.set(next);
    if (next.combo !== before.combo) scheduleOnRN(setCombo, next.combo);
    if ((next.swarms ?? 0) > (before.swarms ?? 0)) {
      fx.shakeHit();
      scheduleOnRN(showBanner, minigameFun.smashSwarm, colors.night);
    }
  });

  const onPoints = useCallback(
    (points: number, nextCombo: number, friendlyHit: boolean, x: number, y: number, cracked: boolean) => {
      cue(friendlyHit ? 'ouch' : 'hit');
      addScore(points);
      setCombo(nextCombo);
      if (cracked) fx.popup(x, y - 20, minigameFun.smashCrack, funColors.shell, true);
      else if (friendlyHit) fx.popup(x, y - 20, points < 0 ? `${points}` : '!', colors.coral, true);
      else fx.popup(x, y - 20, `+${points}`, points > 1 ? colors.coral : colors.plantDark, points > 1);
    },
    [addScore, fx],
  );

  const tapAt = (x: number, y: number) => {
    'worklet';
    const { phase: p, elapsedMs } = clock.get();
    if (p !== 'playing') return;
    const { width, height } = size.get();
    const hole = holeAt(x, y, width, height, PEST_SMASH);
    const outcome = hole < 0 ? null : tapHole(state.get(), hole, elapsedMs, score.get(), PEST_SMASH);
    if (!outcome || outcome.kind === null) {
      fx.burstAt(x, y, { count: 4, color: 4, speed: 0.3, size: 0.8 });
      return;
    }
    state.set(outcome.state);
    score.set(score.get() + outcome.points);
    const at = holeLayout(hole, width, height, PEST_SMASH);
    if (outcome.kind === 'ladybug') {
      fx.burstAt(at.x, at.y, { count: 12, color: 3, speed: 0.7 });
      fx.ringAt(at.x, at.y, 3, 1.3);
      fx.shakeFail();
    } else if (outcome.cracked) {
      fx.burstAt(at.x, at.y, { count: 10, color: 5, speed: 0.6, size: 1.3 });
      fx.ringAt(at.x, at.y, 5, 0.9);
      fx.shakeHit();
    } else {
      fx.burstAt(at.x, at.y, {
        count: 12,
        color: outcome.kind === 'gnat' ? 1 : 0,
        size: 1.2,
      });
      fx.burstAt(at.x, at.y, { count: 6, color: 2, speed: 0.5, size: 1.4 });
      fx.burstAt(at.x, at.y, { count: 5, color: 6, speed: 0.8, size: 1.1 });
      fx.ringAt(at.x, at.y, 4);
      fx.shakeHit();
      hitStop(MINIGAME_FEEL.hitStopMs);
      if (comboSlowMo(outcome.state.combo)) {
        slowMo();
        fx.flash();
        fx.ringAt(at.x, at.y, 6, 2.2);
        fx.burstAt(at.x, at.y, { count: 16, color: 6, speed: 1.2, size: 1.3 });
      }
    }
    scheduleOnRN(
      onPoints,
      outcome.points,
      outcome.state.combo,
      outcome.kind === 'ladybug',
      at.x,
      at.y,
      outcome.cracked === true,
    );
  };

  const gesture = usePointerInput({ onDown: tapAt });

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      const { width, height } = e.nativeEvent.layout;
      size.set({ width, height });
    },
    [size],
  );

  // Rundenende: Schädlingsschutz zusätzlich zu Münzen (genau einmal pro Runde).
  const rewarded = useRef(false);
  useEffect(() => {
    if (!result || rewarded.current) return;
    rewarded.current = true;
    grantSmashReward(result.score);
  }, [result]);

  return (
    <View className="flex-1">
      <SmashInfo protectionEarned={result !== null && earnsPestProtection(result.score)} />
      <GestureDetector gesture={gesture}>
        <View className="mx-3 mb-3 flex-1 overflow-hidden rounded-3xl">
          <Stage scene={scene} backdrop={drawSmashBackdrop} onLayout={onLayout} shakeStyle={shakeStyle} />
          <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
          <ComboBadge combo={combo} multiplier={comboMultiplier(combo, PEST_SMASH)} />
          <EventBanner banner={banner} onDone={clearBanner} />
        </View>
      </GestureDetector>
    </View>
  );
}
