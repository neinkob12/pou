// "Schädlings-Smash": Whack-a-Mole auf einem großen Blatt. Zustand ist ein Shared Value; Auftauchen
// und Verschwinden laufen im Frame-Callback, Tipps werden ebenfalls auf dem UI-Thread ausgewertet,
// damit Frame und Tipp sich den Zustand nicht gegenseitig überschreiben.
// Feedback (Auftrag 40): Spritzer, kurzes Anhalten, Wackeln, Punkte-Popups, Kombo-Zähler.

import { Canvas, Group } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { minigameFun } from '../../../content/strings';
import { MINIGAME_FEEL, PEST_SMASH } from '../../../game/config';
import { cue, useMinigameAudio } from '../../../lib/audio';
import { colors, funColors, gameColors } from '../../../lib/theme';
import { ComboBadge } from '../framework/fx/ComboBadge';
import { EventBanner, useBanner } from '../framework/fx/EventBanner';
import { FxLayer } from '../framework/fx/FxLayer';
import { PopupLayer } from '../framework/fx/PopupLayer';
import { useFx } from '../framework/fx/useFx';
import { useShakeTransform } from '../framework/fx/useShake';
import { usePointerInput } from '../framework/input/usePointerInput';
import type { MinigameSession } from '../framework/useMinigameSession';
import { CritterSlot } from './CritterSlot';
import {
  comboMultiplier,
  createSmashState,
  earnsPestProtection,
  holeAt,
  holeCount,
  holeLayout,
  stepSmash,
  tapHole,
} from './pestSmash';
import { SmashInfo } from './SmashInfo';
import { SmashLeaf } from './SmashLeaf';
import { grantSmashReward } from './smashReward';

const HOLES = Array.from({ length: holeCount(PEST_SMASH) }, (_, i) => i);
/** Partikel: 0 Milbe, 1 Mücke, 2 Blattstücke, 3 Marienkäfer, 4 Fehltipp, 5 Panzer. */
const PALETTE = [
  colors.terracotta,
  colors.night,
  colors.plantLight,
  colors.coral,
  gameColors.leafLight,
  funColors.shell,
] as const;

export function SmashGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, hitStop, result, phase } = session;
  const size = useSharedValue({ width: 0, height: 0 });
  const state = useSharedValue(createSmashState());
  const score = useSharedValue(0);
  const [combo, setCombo] = useState(0);
  const { banner, show: showBanner, clear: clearBanner } = useBanner();
  const fx = useFx();
  const shakeTransform = useShakeTransform(fx.state, fx.now);
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
      fx.burstAt(at.x, at.y, { count: 10, color: 3, speed: 0.7 });
      fx.shakeFail();
    } else if (outcome.cracked) {
      fx.burstAt(at.x, at.y, { count: 10, color: 5, speed: 0.6, size: 1.3 });
      fx.shakeHit();
    } else {
      fx.burstAt(at.x, at.y, {
        count: 12,
        color: outcome.kind === 'gnat' ? 1 : 0,
        size: 1.2,
      });
      fx.burstAt(at.x, at.y, { count: 6, color: 2, speed: 0.5, size: 1.4 });
      fx.shakeHit();
      hitStop(MINIGAME_FEEL.hitStopMs);
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

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    size.set({ width, height });
  };

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
        <View className="mx-3 mb-3 flex-1 overflow-hidden rounded-3xl" onLayout={onLayout}>
          <Canvas style={{ flex: 1 }} pointerEvents="none">
            <Group transform={shakeTransform}>
              <SmashLeaf size={size} />
              {HOLES.map((h) => (
                <CritterSlot key={h} hole={h} state={state} clock={clock} size={size} />
              ))}
              <FxLayer state={fx.state} now={fx.now} palette={PALETTE} />
            </Group>
          </Canvas>
          <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
          <ComboBadge combo={combo} multiplier={comboMultiplier(combo, PEST_SMASH)} />
          <EventBanner banner={banner} onDone={clearBanner} />
        </View>
      </GestureDetector>
    </View>
  );
}
