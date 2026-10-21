/**
 * Lädt die Galerie erst beim Rendern. So zieht ein Import des Debug-Menüs (etwa im Test
 * releaseGate) weder Reanimated noch Skia mit.
 */
export function LazyUiGallery() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- verzögertes Laden, siehe oben
  const { UiGallery } = require('./UiGallery') as typeof import('./UiGallery');
  return <UiGallery />;
}
