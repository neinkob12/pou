import { View } from 'react-native';

import { room } from '../../content/strings';
import { useNeeds } from '../../hooks/useNeeds';
import { needBarValues } from './care/careLogic';
import { HudPanel } from './hud/HudPanel';
import { NeedBadge } from './hud/NeedBadge';
import { NEED_BARS } from './needBars';

/** Die vier Bedürfnisse oben: Wasser, Nährstoffe, Licht, Laune. Werte aus dem Bedürfnis-Slice (P04). */
export function NeedBars() {
  const { snapshot } = useNeeds();
  const values = needBarValues(snapshot);
  return (
    <HudPanel style={{ flex: 1 }} innerStyle={{ flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 6 }}>
      {NEED_BARS.map((bar) => (
        <NeedBadge key={bar.id} bar={bar} value={values[bar.id]} label={room.needs[bar.id]} />
      ))}
    </HudPanel>
  );
}
