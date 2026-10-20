// Partikel als Skia-Ebene (Auftrag 40). Eine Pfad-Zeichnung je Farbe, damit auch viele Partikel
// billig bleiben. Gehört in den Canvas des Spiels, über die Spielgrafik.

import { Path, Skia } from '@shopify/react-native-skia';
import { useDerivedValue, type SharedValue } from 'react-native-reanimated';

import { particleAt, type FxState } from './fxLogic';

interface FxLayerProps {
  state: SharedValue<FxState>;
  now: SharedValue<number>;
  /** Farben, auf die BurstOptions.color zeigt. */
  palette: readonly string[];
}

function ParticlePath({
  state,
  now,
  index,
  color,
}: {
  state: SharedValue<FxState>;
  now: SharedValue<number>;
  index: number;
  color: string;
}) {
  const path = useDerivedValue(() => {
    const builder = Skia.PathBuilder.Make();
    const t = now.get();
    for (const p of state.get().particles) {
      if (p.color !== index) continue;
      const { x, y, r } = particleAt(p, t);
      if (r > 0.3) builder.addCircle(x, y, r);
    }
    return builder.detach();
  });
  return <Path path={path} color={color} />;
}

export function FxLayer({ state, now, palette }: FxLayerProps) {
  return (
    <>
      {palette.map((color, i) => (
        <ParticlePath key={color} state={state} now={now} index={i} color={color} />
      ))}
    </>
  );
}
