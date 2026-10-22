import { View } from 'react-native';

import { room } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { chrome, radii } from '../../lib/theme';
import { needBarValues } from './care/careLogic';
import { NeedBadge } from './hud/NeedBadge';
import { NEED_BARS } from './needBars';

/**
 * Die vier Bedürfnisse oben links als Kugeln auf einer hellen Glas-Pille (Redesign): Wasser,
 * Nährstoffe, Licht, Laune. Werte aus dem Bedürfnis-Slice (P04). Name und Prozent beim Antippen.
 */
export function NeedBars() {
  const { snapshot } = useNeeds();
  const values = needBarValues(snapshot);
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 8,
        paddingHorizontal: 7,
        paddingVertical: 6,
        borderRadius: radii.pill,
        backgroundColor: chrome.glass,
        borderWidth: 1,
        borderColor: chrome.glassLine,
        boxShadow: chrome.glassShadow,
        zIndex: 5,
      }}
    >
      {NEED_BARS.map((bar) => (
        <NeedBadge key={bar.id} bar={bar} value={values[bar.id]} label={room.needs[bar.id]} idle={snapshot === null} />
      ))}
    </View>
  );
}
