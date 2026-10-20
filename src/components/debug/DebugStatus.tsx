import { Text } from 'react-native';

import { debug, phaseLabels } from '../../content/strings';
import { formatClock } from '../../game/debug';
import { computeNeeds, NEED_IDS, NO_MODIFIERS } from '../../game/needs';
import { getPlantStatus } from '../../game/timeEngine';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import { SettingsSection } from '../settings/SettingsSection';
import { FAST_REFRESH_MS, useNow } from '../../hooks/useNow';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <Text className="font-body text-base text-ink">
      <Text className="font-body-bold">{label}: </Text>
      {value}
    </Text>
  );
}

/** Phase, Alter, Restzeit, Münzen, Turbo und Balken der aktuellen Pflanze. */
export function DebugStatus() {
  const now = useNow(FAST_REFRESH_MS);
  const plant = useGameStore((s) => s.plant);
  const coins = useGameStore((s) => s.coins);
  const turbo = useGameStore((s) => s.turbo);
  const needs = useGameStore((s) => s.needs);
  const multiplier = useGameStore(selectDebugMultiplier);
  const status = plant ? getPlantStatus(plant, now, multiplier) : null;
  const bars = computeNeeds(needs, now, NO_MODIFIERS, status?.phase ?? 'germination');
  const barsText = NEED_IDS.map((id) => `${debug.needLabels[id]} ${Math.round(bars[id])}`).join(' · ');

  return (
    <SettingsSection title={debug.statusTitle}>
      {status ? (
        <>
          <Row label={debug.phaseLabel} value={phaseLabels[status.phase]} />
          <Row label={debug.ageLabel} value={`${status.ageDays.toFixed(1)} ${debug.ageUnit}`} />
          <Row
            label={debug.remainingLabel}
            value={status.realMsUntilPhaseEnd === null ? debug.remainingOpen : formatClock(status.realMsUntilPhaseEnd)}
          />
        </>
      ) : (
        <Text className="font-body text-base text-inkMuted">{debug.noPlant}</Text>
      )}
      <Row label={debug.coinsLabel} value={String(coins)} />
      <Row label={debug.turboLabel} value={turbo ? debug.on : debug.off} />
      <Row label={debug.barsLabel} value={barsText} />
    </SettingsSection>
  );
}
