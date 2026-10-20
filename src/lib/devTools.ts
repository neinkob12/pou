// Ob Debug-Menü, Zeitraffer und Entwickler-Links verfügbar sind.
// Nativ nur im Entwicklungs-Build (__DEV__). Die Web-Version (Auftrag PWEB) ist ein Testbau
// für den Chef und zeigt sie immer, damit sich Phasen und Ernte im Browser prüfen lassen.

import { Platform } from 'react-native';

export const DEV_TOOLS: boolean = __DEV__ || Platform.OS === 'web';
