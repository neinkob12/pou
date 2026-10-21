import { Text, View } from 'react-native';

import { DRYING_TURNS } from '../../game/config';
import type { PlantStatus } from '../../game/timeEngine';
import { harvestScreen } from '../../content/strings';
import { harvest as harvestAssets } from '../../lib/assets';
import { formatRemaining } from '../room/phaseText';
import { AssetImage } from '../ui/AssetImage';
import { Bar } from '../ui/Bar';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { collectHarvest, turnDryingNow } from './harvestActions';
import { canTurn, type HarvestSession } from './harvestFlow';
import { HarvestSteps } from './HarvestSteps';

interface DryingViewProps {
  status: PlantStatus;
  session: HarvestSession | null;
}

/** Trockenraum: Fortschritt, Wenden je Abschnitt, nach dem Trocknen Einsammeln. */
export function DryingView({ status, session }: DryingViewProps) {
  const finished = status.phase === 'done';
  const turnable = !finished && session !== null && canTurn(session, status.phaseProgress);

  return (
    <View className="gap-4">
      <HarvestSteps current={finished ? 3 : 2} />
      <Card>
        <View className="items-center gap-3">
          <Text className="font-heading text-2xl text-ink">{harvestScreen.dryingTitle}</Text>
          <Text className="text-center font-body text-base text-ink">{harvestScreen.dryingIntro}</Text>
          <View className="items-center gap-2">
            <AssetImage
              source={harvestAssets.h3_drying_room}
              label={harvestScreen.dryingRoom}
              color="night"
              size={260}
              height={80}
            />
            <AssetImage
              source={harvestAssets.b7_drying}
              label={harvestScreen.dryingBranches}
              color="plantLight"
              size={200}
              height={120}
            />
          </View>
          <View className="w-full gap-1">
            <Bar
              value={finished ? 1 : status.phaseProgress}
              color="plantLight"
              accessibilityLabel={harvestScreen.dryingTitle}
            />
            <Text className="text-center font-body text-sm text-inkMuted">
              {finished ? harvestScreen.dryingDone : formatRemaining(status)}
            </Text>
            {session ? (
              <Text className="text-center font-body text-sm text-inkMuted">
                {harvestScreen.dryingTurns(session.dryingTurns.length, DRYING_TURNS.windows)}
              </Text>
            ) : null}
          </View>
          <View className="w-full gap-2">
            {finished ? (
              <Button label={harvestScreen.collect} onPress={() => collectHarvest()} />
            ) : (
              <Button
                label={turnable ? harvestScreen.dryingTurn : harvestScreen.dryingTurned}
                disabled={!turnable}
                onPress={() => turnDryingNow()}
              />
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}
