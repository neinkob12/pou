import { Group } from '@shopify/react-native-skia';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ArtCanvas } from '../ui/ArtCanvas';

/** Ausschnitt der Budi-Leinwand in Budi-Einheiten: x, y, Breite, Höhe. */
export type BudiBox = readonly [number, number, number, number];

interface BudiCanvasProps {
  /** Kantenlänge der ganzen Budi-Leinwand in Punkten. */
  size: number;
  box: BudiBox;
  children: ReactNode;
}

/**
 * Stille Leinwand nur so groß wie ihr Inhalt, gezeichnet in Budi-Einheiten (100 × 100).
 * Im Browser rechnet CanvasKit stille Leinwände auf der CPU (WEB-6): jedes gesparte Pixel zählt,
 * wenn Budi die Mimik wechselt und mehrere Ebenen neu zeichnen.
 */
export function BudiCanvas({ size, box, children }: BudiCanvasProps) {
  const [x, y, w, h] = box;
  const k = size / 100;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: x * k, top: y * k, width: w * k, height: h * k }}>
      <ArtCanvas width={w * k} height={h * k} still>
        <Group transform={[{ scale: 100 / w }, { translateX: -x }, { translateY: -y }]}>{children}</Group>
      </ArtCanvas>
    </View>
  );
}
