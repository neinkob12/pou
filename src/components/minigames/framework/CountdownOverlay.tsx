import { Text } from 'react-native';

import { Overlay } from './Overlay';

/** Großer Start-Countdown (3, 2, 1) über dem Spielfeld. */
export function CountdownOverlay({ value }: { value: number }) {
  return (
    <Overlay card={false}>
      <Text className="font-heading text-8xl text-coral">{value}</Text>
    </Overlay>
  );
}
