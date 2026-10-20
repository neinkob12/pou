// Hook-Punkt "Extra-Leben", ohne React. P29 meldet hier die Rewarded-Ad an:
//   setExtraLifeProvider(async (gameId) => showRewardedAd());
// Solange kein Anbieter angemeldet ist, bietet das Spielende kein Extra-Leben an.

/** Liefert true, wenn der Spieler das Extra-Leben bekommt (z. B. Werbung zu Ende gesehen). */
export type ExtraLifeProvider = (gameId: string) => Promise<boolean>;

let provider: ExtraLifeProvider | null = null;

/** Meldet einen Anbieter an (null meldet ab). Rückgabe: Funktion zum Abmelden. */
export function setExtraLifeProvider(next: ExtraLifeProvider | null): () => void {
  provider = next;
  return () => {
    if (provider === next) provider = null;
  };
}

/** Darf eine Runde ein Extra-Leben anbieten? Höchstens eins pro Runde. */
export function canOfferExtraLife(gameSupportsIt: boolean, alreadyUsed: boolean): boolean {
  return gameSupportsIt && !alreadyUsed && provider !== null;
}

/** Fragt den Anbieter. Fehler oder kein Anbieter zählen als "nein". */
export async function requestExtraLife(gameId: string): Promise<boolean> {
  if (!provider) return false;
  try {
    return await provider(gameId);
  } catch {
    return false;
  }
}
