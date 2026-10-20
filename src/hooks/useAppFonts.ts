// Einzelne Schnitte importieren, damit nicht alle Gewichte im Bundle landen.
import { Fredoka_600SemiBold } from '@expo-google-fonts/fredoka/600SemiBold';
import { Fredoka_700Bold } from '@expo-google-fonts/fredoka/700Bold';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { useFonts } from 'expo-font';

import { fonts } from '../lib/theme';

/** Lädt die Schriften aus theme.ts. Rückgabe: fertig (geladen oder Fehler, dann Systemschrift). */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    [fonts.heading]: Fredoka_600SemiBold,
    [fonts.headingBold]: Fredoka_700Bold,
    [fonts.body]: Nunito_400Regular,
    [fonts.bodyBold]: Nunito_700Bold,
  });
  return loaded || error != null;
}
