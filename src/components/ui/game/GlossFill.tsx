import { View } from 'react-native';

import { gloss, type Tone } from '../../../lib/theme';
import { gradientStyle, toneGradient } from './gradient';

interface GlossFillProps {
  tone: Tone;
  radius: number;
  /** Glanzlicht oben anzeigen (bei sehr flachen Flächen weglassen). */
  shine?: boolean;
}

/** Fläche im Spiel-Look: Verlauf von hell nach dunkel und ein weißer Glanzstreifen oben links. */
export function GlossFill({ tone, radius, shine = true }: GlossFillProps) {
  return (
    <View
      pointerEvents="none"
      style={[
        { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: radius, overflow: 'hidden' },
        gradientStyle(toneGradient(tone), tone.base),
      ]}
    >
      {shine ? (
        <View
          style={{
            position: 'absolute',
            top: '7%',
            left: '7%',
            width: '38%',
            height: '16%',
            minHeight: 3,
            maxHeight: 7,
            borderRadius: 999,
            backgroundColor: gloss.color,
            opacity: gloss.opacity,
          }}
        />
      ) : null}
    </View>
  );
}
