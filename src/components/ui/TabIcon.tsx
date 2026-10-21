import { View } from 'react-native';

import { radii, surface } from '../../lib/theme';
import { BudiAvatar } from '../feedback/BudiAvatar';
import { GameIcon, type GameIconId } from './icons/GameIcon';

const ICON_SIZE = 26;
const PILL_WIDTH = 52;
const PILL_HEIGHT = 32;

type TabIconId = GameIconId | 'budi';

interface TabIconProps {
  focused: boolean;
}

/**
 * Icon für die Tab-Leiste (WEB-5): die gezeichneten Icons aus dem Zimmer, der aktive Tab bekommt
 * eine koralle Pille dahinter. Budi-Tab zeigt Budis Kopf.
 */
export function tabIcon(id: TabIconId) {
  function Icon({ focused }: TabIconProps) {
    return (
      <View
        style={{
          width: PILL_WIDTH,
          height: PILL_HEIGHT,
          borderRadius: radii.pill,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: focused ? surface.coralSoft : 'transparent',
        }}
      >
        {id === 'budi' ? <BudiAvatar size={ICON_SIZE - 2} /> : <GameIcon id={id} size={ICON_SIZE} />}
      </View>
    );
  }
  return Icon;
}
