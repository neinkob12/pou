import type { ReactNode } from 'react';
import { useWindowDimensions, View } from 'react-native';

import { colors, radii } from '../../lib/theme';
import { frameLayout } from './frameLayout';

const FRAME_BORDER = 10;

/**
 * Web-Version (WEB-3): Am Handy füllt das Spiel den Bildschirm, am Rechner steht es zentriert in
 * einem Handy-Rahmen vor dunkelgrünem Grund, statt in die Breite gezogen zu werden.
 */
export function AppFrame({ children }: { children: ReactNode }) {
  const { width, height } = useWindowDimensions();
  const layout = frameLayout(width, height);
  if (!layout.framed) return <View style={{ flex: 1 }}>{children}</View>;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.plantDark }}>
      <View
        style={{
          width: layout.width,
          height: layout.height,
          overflow: 'hidden',
          borderRadius: radii.lg * 2,
          borderWidth: FRAME_BORDER,
          borderColor: colors.ink,
          backgroundColor: colors.cream,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.45)',
        }}
      >
        {children}
      </View>
    </View>
  );
}
