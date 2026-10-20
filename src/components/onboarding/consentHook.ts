// Hook-Punkt für den Consent-Dialog (P26 legt ihn an, P29 füllt ihn).
// Läuft genau einmal nach dem Tutorial (auch nach Überspringen). Danach setzt die Weiche
// consentStepDone. Wirft die Funktion, wird es beim nächsten Start erneut versucht.

/** P29: hier den Google-UMP-Consent anzeigen und abwarten. Bis dahin passiert nichts. */
export async function runConsentStep(): Promise<void> {
  // Absichtlich leer, bis P29 den Consent-Dialog einbaut.
}
