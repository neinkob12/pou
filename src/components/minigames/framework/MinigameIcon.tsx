// Bild auf der Auswahl-Karte (Auftrag 40): die Hauptfigur jedes Spiels auf einem runden Feld in der
// Kartenfarbe, aus denselben Skia-Formen wie im Spiel.

import { Canvas, Circle, Group, Path, Skia } from '@shopify/react-native-skia';
import { useSharedValue } from 'react-native-reanimated';

import { colors, gameColors } from '../../../lib/theme';
import { JumpBudi } from '../jump/JumpBudi';
import { drawMiteIcon } from '../smash/smashArt';
import { StillPicture } from './art/Stage';
import type { MinigameInfo } from './catalog';
import { Bud } from './example/TapScene';

const SIZE = 72;
const C = SIZE / 2;

/** Wassertropfen in Einheitsgröße. */
const DROP = Skia.PathBuilder.Make()
  .moveTo(0, -1.35)
  .cubicTo(1.1, -0.15, 0.95, 1, 0, 1)
  .cubicTo(-0.95, 1, -1.1, -0.15, 0, -1.35)
  .close()
  .detach();
/** Fragezeichen-Bogen über Budi im Quiz. */
const QUESTION = Skia.PathBuilder.Make()
  .moveTo(-4, -6)
  .quadTo(0, -12, 4, -6)
  .quadTo(5, -3, 0, -1)
  .lineTo(0, 1)
  .detach();

function Figure({ id }: { id: MinigameInfo['id'] }) {
  const still = useSharedValue(0);
  if (id === 'tap') {
    return (
      <Group transform={[{ translateX: C }, { translateY: C }, { scale: 24 }]}>
        <Bud />
      </Group>
    );
  }
  if (id === 'drops') {
    return (
      <Group transform={[{ translateX: C }, { translateY: C + 2 }, { scale: 20 }]}>
        <Path path={DROP} color={gameColors.water} />
        <Path path={DROP} color={gameColors.waterDark} style="stroke" strokeWidth={0.08} />
        <Circle cx={-0.3} cy={-0.05} r={0.22} color={colors.white} opacity={0.7} />
      </Group>
    );
  }
  return (
    <Group transform={[{ translateX: C }, { translateY: C + 6 }, { scale: 3.4 }]}>
      <JumpBudi />
      {id === 'quiz' && (
        <Group transform={[{ translateX: 6 }, { translateY: -1 }]}>
          <Path path={QUESTION} color={colors.ink} style="stroke" strokeWidth={1} strokeCap="round" />
          <Circle cx={0} cy={3} r={0.7} color={colors.ink} />
        </Group>
      )}
    </Group>
  );
}

export function MinigameIcon({ game }: { game: MinigameInfo }) {
  return (
    <Canvas style={{ width: SIZE, height: SIZE }}>
      <Circle cx={C} cy={C} r={C} color={colors[game.color]} opacity={0.35} />
      <Figure id={game.id} />
    </Canvas>
  );
}
