import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { radii } from '../../../lib/theme';
import { hud } from './hudStyle';

interface HudPanelProps {
  children: ReactNode;
  face?: string;
  edge?: string;
  radius?: number;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
}

/**
 * Karte im Spielstil (ART-4): dicke Kontur, dunklere Kante unten wie ein Sticker, Glanz oben.
 * Ersetzt die halb durchsichtigen weißen Kästen im Zimmer.
 */
export function HudPanel({ children, face = hud.face, edge = hud.edgeColor, radius = radii.lg, style, innerStyle }: HudPanelProps) {
  return (
    <View
      style={[
        {
          borderRadius: radius,
          borderWidth: hud.line,
          borderColor: hud.outline,
          backgroundColor: edge,
          paddingBottom: hud.edge,
        },
        style,
      ]}
    >
      <View style={[{ borderRadius: radius - hud.line, backgroundColor: face, overflow: 'hidden' }, innerStyle]}>
        <View
          pointerEvents="none"
          style={{ position: 'absolute', top: 3, left: 10, right: 10, height: 5, borderRadius: radii.pill, backgroundColor: hud.gloss }}
        />
        {children}
      </View>
    </View>
  );
}
