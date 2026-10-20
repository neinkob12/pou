// Budi Jump: Budi springt automatisch von Blatt zu Blatt nach oben, gelenkt per Neigen oder Tippen.
// Physik läuft im Frame-Callback auf dem UI-Thread; React bekommt nur Punkte und das Spielende.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Text, View, type LayoutChangeEvent } from 'react-native';
import { useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { jumpGame } from '../../../content/strings';
import { BUDI_JUMP, MINIGAME_FRAMEWORK } from '../../../game/config';
import { useGameStore } from '../../../store/gameStore';
import type { MinigameSession } from '../framework/useMinigameSession';
import { JumpScene } from './JumpScene';
import { fillPlatforms } from './jumpLevel';
import { listenForJumpLightBonus } from './jumpLightBonus';
import { advanceWorld, revive, scoreForHeight } from './jumpPhysics';
import { JUMP_GAME_ID, recordHeight } from './jumpReward';
import { createWorld, type JumpWorld } from './jumpWorld';
import { RecordMark } from './RecordMark';
import { useJumpInput } from './useJumpInput';

export function JumpGame({ session }: { session: MinigameSession }) {
  const { clock, addScore, endGame, setExtraLifeHandler, phase } = session;
  const input = useJumpInput(useGameStore((s) => s.jumpControl));
  const { targetVx } = input;
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31));
  const world = useSharedValue<JumpWorld>(createWorld(seed));
  const size = useSharedValue({ width: 0, height: 0 });
  const reported = useSharedValue(0);
  const reportedLights = useSharedValue(0);
  const [lights, setLights] = useState(0);
  const lightsRef = useRef(0);
  // Rekord zu Rundenbeginn: die Marke bleibt stehen, auch wenn Budi sie überholt.
  const [recordY] = useState(() => recordHeight(useGameStore.getState().minigameHighscores[JUMP_GAME_ID] ?? 0));

  const onLights = useCallback((count: number) => {
    lightsRef.current = count;
    setLights(count);
  }, []);

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
    const next = advanceWorld(before, dt, targetVx.get(), viewHeight);
    world.set(next);
    const score = scoreForHeight(next.maxY);
    if (score > reported.get()) {
      scheduleOnRN(addScore, score - reported.get());
      reported.set(score);
    }
    if (next.lightsCollected > reportedLights.get()) {
      reportedLights.set(next.lightsCollected);
      scheduleOnRN(onLights, next.lightsCollected);
    }
    if (next.fallen && !before.fallen) scheduleOnRN(endGame);
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
    <View
      className="flex-1"
      onLayout={onLayout}
      onTouchStart={input.onTouch}
      onTouchMove={input.onTouch}
      onTouchEnd={input.onTouch}
      onTouchCancel={input.onTouch}
    >
      <JumpScene world={world} size={size} />
      {recordY !== null && <RecordMark height={recordY} world={world} size={size} />}
      <View className="absolute left-3 top-2 rounded-full bg-white px-3 py-1" pointerEvents="none">
        <Text className="font-body-bold text-sm text-ink">
          {jumpGame.lights}: {lights}
        </Text>
      </View>
      {phase === 'countdown' && (
        <View className="absolute inset-x-0 bottom-6 items-center gap-1 px-6" pointerEvents="none">
          <Text className="text-center font-body text-base text-ink">
            {input.control === 'tilt' ? jumpGame.hintTilt : jumpGame.hintTap}
          </Text>
          {input.tiltUnavailable && (
            <Text className="text-center font-body text-sm text-inkMuted">{jumpGame.tiltUnavailable}</Text>
          )}
        </View>
      )}
    </View>
  );
}
