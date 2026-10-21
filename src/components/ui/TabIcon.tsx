import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { gameRadii, outline, springs, tones } from '../../lib/theme';
import { BudiAvatar } from '../feedback/BudiAvatar';
import { gradientStyle, toneGradient } from './game/gradient';
import type { GameIconId } from './icons/GameIcon';

const ICON_SIZE = 24;
const PILL_WIDTH = 52;
const PILL_HEIGHT = 32;
/** Der aktive Tab hüpft etwas größer und höher. */
const FOCUS_SCALE = 1.12;
const FOCUS_LIFT = -3;

type TabIconId = GameIconId | 'budi';

interface TabIconProps {
  focused: boolean;
}

/**
 * Icon für die Tab-Leiste (ART-1): gezeichnete Icons, der aktive Tab sitzt auf einer Pille in
 * Gold mit Kontur und federt beim Wechsel hoch. Budi-Tab zeigt Budis Kopf.
 */
export function tabIcon(id: TabIconId) {
  function Icon({ focused }: TabIconProps) {
    // Erst beim Rendern laden: app/_layout.tsx importiert diese Datei, bevor CanvasKit im Browser
    // bereit ist, und ein Skia-Modul darf vorher nicht ausgewertet werden (src/lib/skiaWeb.web.ts).
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- verzögertes Laden, siehe oben
    const { GameIcon } = require('./icons/GameIcon') as typeof import('./icons/GameIcon');
    const lift = useSharedValue(focused ? 1 : 0);

    useEffect(() => {
      lift.set(withSpring(focused ? 1 : 0, springs.release));
    }, [focused, lift]);

    const style = useAnimatedStyle(() => ({
      transform: [{ translateY: FOCUS_LIFT * lift.value }, { scale: 1 + (FOCUS_SCALE - 1) * lift.value }],
    }));

    return (
      <Animated.View style={style}>
        <View
          style={[
            {
              width: PILL_WIDTH,
              height: PILL_HEIGHT,
              borderRadius: gameRadii.pill,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: focused ? outline.thin : 0,
              borderColor: outline.color,
            },
            focused ? gradientStyle(toneGradient(tones.gold), tones.gold.base) : null,
          ]}
        >
          {id === 'budi' ? <BudiAvatar size={ICON_SIZE - 2} /> : <GameIcon id={id} size={ICON_SIZE} />}
        </View>
      </Animated.View>
    );
  }
  return Icon;
}
