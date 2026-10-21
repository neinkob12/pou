import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { dailyGoals } from '../../content/strings';
import { canClaimChest, goalTemplate } from '../../game/dailyGoals';
import { gameEvents } from '../../game/events';
import { clock } from '../../lib/clock';
import { useGameStore } from '../../store/gameStore';
import { useNow } from '../../hooks/useNow';
import { DailyChest } from './DailyChest';
import { HudBar } from './hud/HudBar';
import { HudPanel } from './hud/HudPanel';
import { NEED_TONES } from './hud/hudStyle';

/** Tagesziel im Raum (P19): ein Ziel pro Tag mit Fortschritt und Belohnungskiste. */
export function DailyGoal() {
  const now = useNow();
  const goal = useGameStore((s) => s.dailyGoal);
  const refresh = useGameStore((s) => s.refreshDailyGoal);

  // Tageswechsel: Das Ziel kommt aus dem Zeitstempel, useNow liest die Uhr jede Minute neu.
  useEffect(() => refresh(now), [now, refresh]);

  if (!goal) return null;
  const { target } = goalTemplate(goal.goalId);
  const label = dailyGoals.goals[goal.goalId](target);
  const claimable = canClaimChest(goal);

  const openChest = () => {
    const s = useGameStore.getState();
    const nowMs = clock.now();
    const coins = s.claimDailyGoalChest(nowMs, s.addCoins);
    // Die Feier zeigt die Feier-Ebene (WEB-3, feedback/CelebrationLayer.tsx).
    if (coins > 0) gameEvents.emit('dailyChestOpened', { coins, atMs: nowMs });
  };

  const tone = NEED_TONES.mood;
  return (
    <HudPanel innerStyle={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 8 }}>
      <View className="flex-1 gap-1">
        <View className="flex-row items-center justify-between">
          <Text className="font-body-bold text-xs uppercase text-inkMuted">{dailyGoals.title}</Text>
          <Text className="font-heading text-sm text-ink">{dailyGoals.progress(goal.progress, target)}</Text>
        </View>
        <Text numberOfLines={1} className="font-body-bold text-sm text-ink">
          {goal.claimed ? dailyGoals.claimed : label}
        </Text>
        <HudBar value={goal.progress / target} fill={tone.fill} deep={tone.deep} height={12} accessibilityLabel={label} />
      </View>
      {claimable ? <DailyChest onPress={openChest} /> : null}
    </HudPanel>
  );
}
