import { useState } from 'react';
import { Text, View } from 'react-native';

import type { PlantStatus } from '../../game/timeEngine';
import { harvestScreen } from '../../content/strings';
import { Card } from '../ui/Card';
import { cutPlant } from './harvestActions';
import { HarvestSteps } from './HarvestSteps';
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
    return (
      <View className="gap-4">
        <HarvestSteps current={0} />
        <TrichomeLupe seed={seed} readyDays={Math.floor(daysInReady(status))} onDone={setLupeScore} />
      </View>
    );
  }
  return (
    <View className="gap-4">
      <HarvestSteps current={1} />
      {lupeScore !== null ? (
        <Card tone="success">
          <Text className="text-center font-body-bold text-base text-ink">
            {harvestScreen.lupeResult(Math.round(lupeScore * 100))}
          </Text>
        </Card>
      ) : null}
      <ScissorCut onCut={() => cutPlant(lupeScore)} />
    </View>
  );
}
