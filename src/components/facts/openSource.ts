import { Linking } from 'react-native';

/** Öffnet den Quellenlink einer Karte im Browser. Fehler (kein Browser) werden nur geloggt. */
export function openSource(url: string) {
  Linking.openURL(url).catch((error: unknown) => {
    console.warn('[facts] Quelle ließ sich nicht öffnen.', url, error);
  });
}
