import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { dailyGoals } from '../../content/strings';
import { canClaimChest, goalTemplate } from '../../game/dailyGoals';
import { clock } from '../../lib/clock';
import { useGameStore } from '../../store/gameStore';
import { Bar } from '../ui/Bar';
import { Modal } from '../ui/Modal';
import { Placeholder } from '../ui/Placeholder';
import { useNow } from './useNow';

/** Tagesziel im Raum (P19): ein Ziel pro Tag mit Fortschritt und Belohnungskiste. */
export function DailyGoal() {
  const now = useNow();
  const goal = useGameStore((s) => s.dailyGoal);
  const refresh = useGameStore((s) => s.refreshDailyGoal);
  const [chestCoins, setChestCoins] = useState<number | null>(null);

  // Tageswechsel: Das Ziel kommt aus dem Zeitstempel, useNow liest die Uhr jede Minute neu.
  useEffect(() => refresh(now), [now, refresh]);

  if (!goal) return null;
  const { target } = goalTemplate(goal.goalId);
  const label = dailyGoals.goals[goal.goalId](target);
  const claimable = canClaimChest(goal);

  const openChest = () => {
    const s = useGameStore.getState();
    const coins = s.claimDailyGoalChest(clock.now(), s.addCoins);
    if (coins > 0) setChestCoins(coins);
  };

  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-white/80 px-4 py-2">
      <View className="flex-1 gap-1">
        <View className="flex-row items-baseline justify-between">
          <Text className="font-body-bold text-sm text-inkMuted">{dailyGoals.title}</Text>
          <Text className="font-body text-sm text-inkMuted">{dailyGoals.progress(goal.progress, target)}</Text>
        </View>
        <Text className="font-body-bold text-base text-ink">{goal.claimed ? dailyGoals.claimed : label}</Text>
        <Bar value={goal.progress / target} color="lavender" accessibilityLabel={label} />
      </View>
      {claimable ? (
        <Pressable accessibilityRole="button" accessibilityLabel={dailyGoals.openChest} onPress={openChest}>
          <Placeholder label={dailyGoals.chestPlaceholder} color="lamp" width={56} height={48} />
        </Pressable>
      ) : null}
      <Modal visible={chestCoins !== null} title={dailyGoals.chestTitle} onClose={() => setChestCoins(null)}>
        <Text className="font-body-bold text-lg text-ink">{dailyGoals.chestReward(chestCoins ?? 0)}</Text>
      </Modal>
    </View>
  );
}
