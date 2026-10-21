import { Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { harvestScreen, screenUi } from '../../content/strings';
import { STRAINS, type StrainId } from '../../game/config';
import { GlowRays } from '../feedback/GlowRays';
import { Sparkles } from '../feedback/Sparkles';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

const GLOW_SIZE = 240;

/**
 * Neue Sorte freigeschaltet (ART-5): lila Karte federt nach den Münzen herein, dahinter kreisende
 * Strahlen und Funken, damit der Moment groß wirkt.
 */
export function NewStrainBanner({ id, delayMs }: { id: StrainId; delayMs: number }) {
  return (
    <Animated.View entering={ZoomIn.delay(delayMs).springify().damping(8)} style={{ width: '100%' }}>
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <GlowRays size={GLOW_SIZE} />
        <Sparkles count={16} />
        <Card tone="rare" padding={20} style={{ alignSelf: 'stretch' }}>
          <View className="items-center gap-1">
            <Badge label={screenUi.newBadge} color="lavender" light center />
            <Text className="text-center font-heading text-2xl text-ink">
              {harvestScreen.summaryNewStrain(STRAINS[id].name)}
            </Text>
          </View>
        </Card>
      </View>
    </Animated.View>
  );
}
