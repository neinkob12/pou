import type { ReactNode } from 'react';
import { View } from 'react-native';

import { gradientStyle } from '../ui/game/gradient';

const STAGE = 76;

/** Runde, warm beleuchtete Bühne hinter Shop-Bildern (Redesign): hebt das Bild von der Karte ab. */
export function ItemStage({ children, glow = '#FFE7B0' }: { children: ReactNode; glow?: string }) {
  return (
    <View
      style={[
        { width: STAGE, height: STAGE, borderRadius: STAGE / 2, alignItems: 'center', justifyContent: 'center' },
        gradientStyle(`radial-gradient(circle at 50% 40%, #FFFFFF 0%, ${glow} 70%, #F3D9A8 100%)`, glow),
      ]}
    >
      {children}
    </View>
  );
}
