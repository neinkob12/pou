import { View } from 'react-native';

import { radii, surface } from '../../lib/theme';
import { BudiAvatar } from '../feedback/BudiAvatar';
import type { GameIconId } from './icons/GameIcon';

const ICON_SIZE = 22;
const PILL_WIDTH = 48;
const PILL_HEIGHT = 28;

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
    // Erst beim Rendern laden: app/_layout.tsx importiert diese Datei, bevor CanvasKit im Browser
    // bereit ist, und ein Skia-Modul darf vorher nicht ausgewertet werden (src/lib/skiaWeb.web.ts).
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- verzögertes Laden, siehe oben
    const { GameIcon } = require('./icons/GameIcon') as typeof import('./icons/GameIcon');
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
