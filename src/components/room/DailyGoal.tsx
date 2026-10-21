import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';

import { dailyGoals, roomHud } from '../../content/strings';
import { ui } from '../../lib/assets';
import { canClaimChest, goalTemplate } from '../../game/dailyGoals';
import { gameEvents } from '../../game/events';
import { clock } from '../../lib/clock';
import { useGameStore } from '../../store/gameStore';
import { useNow } from '../../hooks/useNow';
import { chrome, radii, tones } from '../../lib/theme';
import { DailyChest } from './DailyChest';
import { HudBar } from './hud/HudBar';
import { NEED_TONES } from './hud/hudStyle';

const SIZE = 54;
const POPOVER_WIDTH = 210;
const POPOVER_MS = 4000;

/**
 * Tagesziel im Raum (P19) als runder Knopf am Rand (Redesign): Kiste mit Zähler. Antippen zeigt das
 * Ziel in einer Sprechblase; ist es erfüllt, wackelt die Kiste und Antippen öffnet sie.
 */
export function DailyGoal() {
  const now = useNow();
  const goal = useGameStore((s) => s.dailyGoal);
  const refresh = useGameStore((s) => s.refreshDailyGoal);
  const [open, setOpen] = useState(false);

  // Tageswechsel: Das Ziel kommt aus dem Zeitstempel, useNow liest die Uhr jede Minute neu.
  useEffect(() => refresh(now), [now, refresh]);

  // Die Sprechblase räumt sich nach kurzer Zeit selbst weg.
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setOpen(false), POPOVER_MS);
    return () => clearTimeout(id);
  }, [open]);

  if (!goal) return null;
  const { target } = goalTemplate(goal.goalId);
  const label = dailyGoals.goals[goal.goalId](target);
  const claimable = canClaimChest(goal);
  const tone = NEED_TONES.mood;

  const openChest = () => {
    const s = useGameStore.getState();
    const nowMs = clock.now();
    const coins = s.claimDailyGoalChest(nowMs, s.addCoins);
    // Die Feier zeigt die Feier-Ebene (WEB-3, feedback/CelebrationLayer.tsx).
    if (coins > 0) gameEvents.emit('dailyChestOpened', { coins, atMs: nowMs });
  };

  return (
    <View style={{ alignItems: 'flex-end', zIndex: 4 }}>
      <View
        style={{
          width: SIZE,
          height: SIZE,
          borderRadius: SIZE / 2,
          backgroundColor: claimable ? tones.gold.light : chrome.glass,
          borderWidth: claimable ? 2 : 1,
          borderColor: claimable ? tones.gold.edge : chrome.glassLine,
          boxShadow: claimable ? `0 0 0 6px ${chrome.halo}, ${chrome.glassShadow}` : chrome.glassShadow,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {claimable ? (
          <DailyChest onPress={openChest} />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${dailyGoals.title}: ${goal.claimed ? dailyGoals.claimed : label}`}
            onPress={() => setOpen((o) => !o)}
            hitSlop={6}
            style={{ alignItems: 'center', justifyContent: 'center', opacity: goal.claimed ? 0.65 : 1 }}
          >
            <Image source={goal.claimed ? ui.u13_chest_open : ui.u13_chest} style={{ width: 38, height: 38 }} />
          </Pressable>
        )}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            bottom: -7,
            paddingHorizontal: 6,
            borderRadius: radii.pill,
            backgroundColor: goal.claimed ? NEED_TONES.nutrients.base : tone.base,
            borderWidth: 2,
            borderColor: chrome.glass,
          }}
        >
          <Text className="font-heading text-[11px] text-white">
            {goal.claimed ? '✓' : dailyGoals.progress(goal.progress, target)}
          </Text>
        </View>
      </View>
      {open && !claimable ? (
        <Animated.View
          entering={ZoomIn.springify().damping(13)}
          exiting={FadeOut.duration(140)}
          style={{
            position: 'absolute',
            top: SIZE + 12,
            right: 0,
            width: POPOVER_WIDTH,
            padding: 12,
            gap: 6,
            borderRadius: 18,
            backgroundColor: chrome.glass,
            borderWidth: 1,
            borderColor: chrome.glassLine,
            boxShadow: chrome.glassShadow,
            transformOrigin: 'top right',
          }}
        >
          <Pressable accessibilityRole="button" accessibilityLabel={roomHud.goalOpen} onPress={() => setOpen(false)} style={{ gap: 6 }}>
            <View className="self-start rounded-full px-2" style={{ backgroundColor: tone.base }}>
              <Text className="font-heading text-[11px] text-white">{dailyGoals.title}</Text>
            </View>
            <Text className="font-body-bold text-sm leading-5 text-ink">{goal.claimed ? dailyGoals.claimed : label}</Text>
            {goal.claimed ? null : (
              <>
                <HudBar value={goal.progress / target} fill={tone.base} deep={tone.dark} height={10} accessibilityLabel={label} />
                <Text className="font-body text-[11px] text-inkMuted">{roomHud.goalReward}</Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      ) : null}
    </View>
  );
}
