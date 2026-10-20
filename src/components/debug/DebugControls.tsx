import { useState, type ReactNode } from 'react';
import { Text, View } from 'react-native';

import { debug } from '../../content/strings';
import { DEBUG_OPTIONS } from '../../game/debug';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import { SettingsSection } from '../settings/SettingsSection';
import { DebugButton } from './DebugButton';
import { useDebugActions } from './useDebugActions';

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <SettingsSection title={title}>
      {hint ? <Text className="font-body text-sm text-inkMuted">{hint}</Text> : null}
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </SettingsSection>
  );
}

/** Alle Knöpfe des Debug-Menüs. */
export function DebugControls() {
  const actions = useDebugActions();
  const multiplier = useGameStore(selectDebugMultiplier);
  const hasPlant = useGameStore((s) => s.plant !== null);
  const turbo = useGameStore((s) => s.turbo);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <>
      <Group title={debug.speedTitle} hint={debug.speedHint}>
        {DEBUG_OPTIONS.multipliers.map((m) => (
          <DebugButton key={m} label={`x${m}`} active={m === multiplier} onPress={() => actions.setMultiplier(m)} />
        ))}
      </Group>
      <Group title={debug.skipTitle}>
        {DEBUG_OPTIONS.skipPlantDays.map((d) => (
          <DebugButton key={d} label={`+${d} ${debug.skipUnit}`} disabled={!hasPlant} onPress={() => actions.skipDays(d)} />
        ))}
      </Group>
      <Group title={debug.plantTitle}>
        <DebugButton label={debug.plantSeed} onPress={actions.plantSeed} />
        <DebugButton label={debug.flipLight} disabled={!hasPlant} onPress={actions.flipLight} />
        <DebugButton label={debug.harvest} disabled={!hasPlant} onPress={actions.harvest} />
        <DebugButton label={turbo ? debug.turboOff : debug.turboOn} onPress={() => actions.setTurbo(!turbo)} />
      </Group>
      <Group title={debug.coinsTitle}>
        {DEBUG_OPTIONS.coinGifts.map((c) => (
          <DebugButton key={c} label={`+${c}`} onPress={() => actions.giveCoins(c)} />
        ))}
      </Group>
      <Group title={debug.pendingTitle} hint={debug.pendingHint}>
        <DebugButton label={debug.setBars} disabled />
        <DebugButton label={debug.unlockStrains} disabled />
      </Group>
      <Group title={debug.resetTitle}>
        <DebugButton
          label={confirmReset ? debug.resetConfirm : debug.reset}
          active={confirmReset}
          onPress={() => {
            if (confirmReset) actions.reset();
            setConfirmReset(!confirmReset);
          }}
        />
      </Group>
    </>
  );
}
