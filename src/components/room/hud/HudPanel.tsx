import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { gameRadii, shadows, tones, type Tone } from '../../../lib/theme';
import { GlossFill } from '../../ui/game/GlossFill';
import { hud } from './hudStyle';

interface HudPanelProps {
  children: ReactNode;
  tone?: Tone;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}

/**
 * Leiste im Spielstil (ART-4): dicke Kontur, Kante unten wie ein Sticker, Verlauf mit Glanz,
 * weicher Schatten. Ersetzt die halb durchsichtigen weißen Kästen im Zimmer.
 */
export function HudPanel({ children, tone = tones.cream, radius = gameRadii.card, style, innerStyle }: HudPanelProps) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: hud.line,
          borderColor: hud.outline,
          backgroundColor: tone.edge,
          paddingBottom: hud.edge,
          boxShadow: shadows.card,
        },
        style,
      ]}
    >
      <View style={[{ borderRadius: radius - hud.line }, innerStyle]}>
        <GlossFill tone={tone} radius={radius - hud.line} />
        {children}
      </View>
    </View>
  );
}
