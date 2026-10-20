// Spielfeld von "Tropfen fangen" mit Skia. Tropfen je Art als ein Pfad, damit auch viele
// Tropfen nur drei Zeichenaufrufe kosten. Alles läuft über Shared Values auf dem UI-Thread.
// Platzhalter-Grafik (M5 bis M8 fehlen): Wasser dunkelblauer Kreis, Dünger grüner Kreis,
// Salz weißes Quadrat mit Rand, Topf terrakotta.

import { Canvas, Path, RoundedRect, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { DROPS_GAME } from '../../../game/config';
import { colors } from '../../../lib/theme';
import { potTop, type DropKind, type DropsField } from './dropsLogic';

interface DropsCanvasProps {
  field: SharedValue<DropsField>;
  size: SharedValue<{ width: number; height: number }>;
}

const SALT_STROKE = 2;
/** Dünger-Kugel etwas kleiner als der Wassertropfen, damit man sie auseinanderhält. */
const FERTILIZER_SCALE = 0.85;

function useKindPath(field: SharedValue<DropsField>, kind: DropKind) {
  return useDerivedValue(() => {
    const builder = Skia.PathBuilder.Make();
    const r = DROPS_GAME.dropRadius;
    for (const d of field.get().drops) {
      if (d.kind !== kind) continue;
      if (kind === 'salt') builder.addRect(Skia.XYWHRect(d.x - r, d.y - r, 2 * r, 2 * r));
      else builder.addCircle(d.x, d.y, kind === 'fertilizer' ? r * FERTILIZER_SCALE : r);
    }
    return builder.detach();
  });
}

export function DropsCanvas({ field, size }: DropsCanvasProps) {
  const water = useKindPath(field, 'water');
  const fertilizer = useKindPath(field, 'fertilizer');
  const salt = useKindPath(field, 'salt');
  const potX = useDerivedValue(() => field.get().potX - DROPS_GAME.potWidth / 2);
  const potY = useDerivedValue(() => potTop(size.get().height));

  return (
    <Canvas style={{ flex: 1 }} pointerEvents="none">
      <Path path={water} color={colors.night} />
      <Path path={fertilizer} color={colors.plantLight} />
      <Path path={salt} color={colors.white} />
      <Path path={salt} color={colors.ink} style="stroke" strokeWidth={SALT_STROKE} />
      <RoundedRect
        x={potX}
        y={potY}
        width={DROPS_GAME.potWidth}
        height={DROPS_GAME.potHeight}
        r={DROPS_GAME.potHeight / 4}
        color={colors.terracotta}
      />
    </Canvas>
  );
}
