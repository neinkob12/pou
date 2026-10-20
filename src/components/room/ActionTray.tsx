import { View } from 'react-native';

import type { CareActionId } from '../../game/events';
import { room } from '../../content/strings';
import { Button } from '../ui/Button';

const ACTIONS: readonly CareActionId[] = ['water', 'fertilize', 'pet'];

// Slot. Später P10: Aktionen über applyCare, Wisch-Gesten, Haptik. Bis dahin ohne Funktion.
/** Pflege-Aktionen unter Budi. */
export function ActionTray() {
  return (
    <View className="flex-row justify-center gap-3 px-4">
      {ACTIONS.map((action) => (
        <Button key={action} label={room.actions[action]} variant="secondary" disabled />
      ))}
    </View>
  );
}
