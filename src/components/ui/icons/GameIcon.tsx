import { ArtCanvas } from '../ArtCanvas';
import { IconArt, type GameIconId } from './iconArt';

export type { GameIconId };

/** Gezeichnetes Icon (Skia) in Budis Stil. Rendert einmal, im Browser ohne dauerhaften WebGL-Kontext. */
export function GameIcon({ id, size }: { id: GameIconId; size: number }) {
  return (
    <ArtCanvas width={size} height={size} still>
      <IconArt id={id} />
    </ArtCanvas>
  );
}
