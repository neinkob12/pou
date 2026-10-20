import { useState } from 'react';
import { Text, View } from 'react-native';

import type { PlantStatus } from '../../game/timeEngine';
import { harvestScreen } from '../../content/strings';
import { cutPlant } from './harvestActions';
import { daysInReady } from './harvestFlow';
import { ScissorCut } from './ScissorCut';
import { TrichomeLupe } from './TrichomeLupe';

interface ReadyStepProps {
  status: PlantStatus;
  seed: number;
}

/** Phase "ready": erst die Lupe, dann die Schere. Danach wechselt der Screen ins Trocknen. */
export function ReadyStep({ status, seed }: ReadyStepProps) {
  // undefined = Lupe läuft noch, null = übersprungen.
  const [lupeScore, setLupeScore] = useState<number | null | undefined>(undefined);

  if (lupeScore === undefined) {
    return <TrichomeLupe seed={seed} readyDays={Math.floor(daysInReady(status))} onDone={setLupeScore} />;
  }
  return (
    <View className="gap-3">
      {lupeScore !== null ? (
        <Text className="text-center font-body-bold text-base text-ink">
          {harvestScreen.lupeResult(Math.round(lupeScore * 100))}
        </Text>
      ) : null}
      <ScissorCut onCut={() => cutPlant(lupeScore)} />
    </View>
  );
}
