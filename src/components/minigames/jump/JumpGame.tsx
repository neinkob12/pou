// Budi Jump: Budi springt automatisch von Blatt zu Blatt nach oben, gelenkt per Neigen, Tippen oder
// Tastatur. Physik läuft im Frame-Callback auf dem UI-Thread; React bekommt nur Punkte und das Spielende.
// Feedback (Auftrag 40): Blattstücke beim Landen, Funken an Federn und Lichtpunkten, Budi staucht sich.

import { Canvas, Group } from '@shopify/react-native-skia';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, Text, View, type LayoutChangeEvent } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { jumpGame, minigameFeel } from '../../../content/strings';
import { BUDI_JUMP, MINIGAME_FRAMEWORK } from '../../../game/config';
import { cue, useMinigameAudio } from '../../../lib/audio';
import { colors } from '../../../lib/theme';
import { FxLayer } from '../framework/fx/FxLayer';
import { PopupLayer } from '../framework/fx/PopupLayer';
import { useFx } from '../framework/fx/useFx';
import { useShakeTransform } from '../framework/fx/useShake';
import type { MinigameSession } from '../framework/useMinigameSession';
import { useGameStore } from '../../../store/gameStore';
import { landingBetween } from './jumpFeel';
import { fillPlatforms } from './jumpLevel';
import { listenForJumpLightBonus } from './jumpLightBonus';
import { advanceWorld, revive, scoreForHeight } from './jumpPhysics';
import { JUMP_GAME_ID, recordHeight } from './jumpReward';
import { JumpScene } from './JumpScene';
import { createWorld, type JumpWorld } from './jumpWorld';
import { RecordMark } from './RecordMark';
import { useJumpInput } from './useJumpInput';

/** Partikel: 0 Blattstücke, 1 Feder, 2 Licht. */
const PALETTE = [colors.plantLight, colors.lavender, colors.lamp] as const;

export function JumpGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, endGame, setExtraLifeHandler, phase, result } = session;
  const input = useJumpInput(useGameStore((s) => s.jumpControl));
  const { readVx } = input;
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const world = useSharedValue<JumpWorld>(createWorld(seed));
  const size = useSharedValue({ width: 0, height: 0 });
  const reported = useSharedValue(0);
  const reportedLights = useSharedValue(0);
  const lastLandingMs = useSharedValue(-1e9);
  const [lights, setLights] = useState(0);
  const lightsRef = useRef(0);
  const fx = useFx();
  const shakeTransform = useShakeTransform(fx.state, fx.now);
  useMinigameAudio(phase, result?.coins ?? null);
  // Rekord zu Rundenbeginn: die Marke bleibt stehen, auch wenn Budi sie überholt.
  const [recordY] = useState(() => recordHeight(useGameStore.getState().minigameHighscores[JUMP_GAME_ID] ?? 0));

  const onLights = useCallback(
    (count: number, x: number, y: number) => {
      cue('collect');
      lightsRef.current = count;
      setLights(count);
      fx.popup(x, y, `+1 ${jumpGame.lights}`, colors.lamp);
    },
    [fx],
  );

  useFrameCallback((frame) => {
    'worklet';
    const { width, height } = size.get();
    if (width === 0) return;
    const viewHeight = (height * BUDI_JUMP.worldWidth) / width;
    const before = world.get();
    if (clock.get().phase !== 'playing') {
      // Vor dem Start schon Blätter zeigen, sonst steht die Welt.
      const filled = fillPlatforms(before, viewHeight);
      if (filled !== before) world.set(filled);
      return;
    }
    const dt = Math.min(frame.timeSincePreviousFrame ?? 0, MINIGAME_FRAMEWORK.maxFrameStepMs);
    const next = advanceWorld(before, dt, readVx(), viewHeight);
    world.set(next);
    const k = width / BUDI_JUMP.worldWidth;
    const sx = next.x * k;
    const sy = height - (next.y - next.cameraY) * k;
    const landing = landingBetween(before, next);
    if (landing !== 'none') {
      scheduleOnRN(cue, 'jump');
      lastLandingMs.set(fx.now.get());
      const feet = sy + BUDI_JUMP.budiRadius * k;
      if (landing === 'spring') {
        fx.burstAt(sx, feet, { count: 14, color: 1, upward: true, speed: 0.9 });
        fx.shakeHit();
      } else {
        fx.burstAt(sx, feet, { count: 6, color: 0, upward: true, speed: 0.4, size: 0.8 });
      }
    }
    const score = scoreForHeight(next.maxY);
    if (score > reported.get()) {
      scheduleOnRN(addScore, score - reported.get());
      reported.set(score);
    }
    if (next.lightsCollected > reportedLights.get()) {
      reportedLights.set(next.lightsCollected);
      fx.burstAt(sx, sy, { count: 12, color: 2, speed: 0.7 });
      scheduleOnRN(onLights, next.lightsCollected, sx, sy - 20);
    }
    if (next.fallen && !before.fallen) {
      fx.shakeFail();
      scheduleOnRN(cue, 'fail');
      scheduleOnRN(endGame);
    }
  });

  // Lichtbonus für Budi, sobald das Framework das Rundenende meldet (minigameFinished).
  useEffect(() => listenForJumpLightBonus(() => lightsRef.current), []);

  // Extra-Leben (P29): Budi bekommt ein frisches Blatt unten im Bild.
  useEffect(() => {
    setExtraLifeHandler(() => {
      const { width, height } = size.get();
      if (width > 0) world.set(revive(world.get(), (height * BUDI_JUMP.worldWidth) / width));
    });
    return () => setExtraLifeHandler(null);
  }, [setExtraLifeHandler, size, world]);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    size.set({ width, height });
    input.onLayout(e);
  };

  return (
    <GestureDetector gesture={input.gesture}>
      <View className="flex-1 overflow-hidden" onLayout={onLayout}>
        <Canvas style={{ flex: 1 }} pointerEvents="none">
          <Group transform={shakeTransform}>
            <JumpScene world={world} size={size} now={fx.now} lastLandingMs={lastLandingMs}>
              <FxLayer state={fx.state} now={fx.now} palette={PALETTE} />
            </JumpScene>
          </Group>
        </Canvas>
        {recordY !== null && <RecordMark height={recordY} world={world} size={size} />}
        <PopupLayer popups={fx.popups} onDone={fx.removePopup} />
        <View className="absolute left-3 top-2 rounded-full bg-white px-3 py-1" pointerEvents="none">
          <Text className="font-body-bold text-sm text-ink">
            {jumpGame.lights}: {lights}
          </Text>
        </View>
        {phase === 'countdown' && (
          <View className="absolute inset-x-0 bottom-24 items-center gap-1 px-6" pointerEvents="none">
            <Text className="text-center font-body-bold text-base text-ink">
              {input.control === 'tilt' ? jumpGame.hintTilt : jumpGame.hintTap}
            </Text>
            {Platform.OS === 'web' && (
              <Text className="text-center font-body text-sm text-inkMuted">{minigameFeel.keyboardHint}</Text>
            )}
            {input.tiltUnavailable && Platform.OS !== 'web' && (
              <Text className="text-center font-body text-sm text-inkMuted">{jumpGame.tiltUnavailable}</Text>
            )}
          </View>
        )}
      </View>
    </GestureDetector>
  );
}
