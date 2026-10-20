// Ob Debug-Menü, Zeitraffer und Entwickler-Links verfügbar sind.
// Nativ nur im Entwicklungs-Build (__DEV__). Die Web-Version (Auftrag PWEB) ist ein Testbau
// für den Chef und zeigt sie immer, damit sich Phasen und Ernte im Browser prüfen lassen.
// Funktion statt Konstante, damit __DEV__ erst beim Aufruf gelesen wird (Tests setzen es um).

import { Platform } from 'react-native';

export function devToolsEnabled(): boolean {
  return __DEV__ || Platform.OS === 'web';
}
