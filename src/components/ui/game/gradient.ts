import { Platform, type ViewStyle } from 'react-native';

import type { Tone } from '../../../lib/theme';

/** CSS-Verlauf eines Farbtons: hell oben, Fläche in der Mitte, dunkler Saum unten. */
export function toneGradient(tone: Tone): string {
  return `linear-gradient(180deg, ${tone.light} 0%, ${tone.base} 48%, ${tone.base} 68%, ${tone.dark} 100%)`;
}

/**
 * Verlauf als Style. Nativ (neue Architektur) heißt die Eigenschaft experimental_backgroundImage,
 * im Web reicht react-native-web sie als CSS backgroundImage durch. Fläche in `base` als Rückfall.
 */
export function gradientStyle(css: string, fallback: string): ViewStyle {
  const key = Platform.OS === 'web' ? 'backgroundImage' : 'experimental_backgroundImage';
  // Der Schlüssel wird zur Laufzeit gewählt, deshalb die Typumwandlung.
  return { backgroundColor: fallback, [key]: css } as ViewStyle;
}
