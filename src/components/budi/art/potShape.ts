// Umriss von Budis Topf (ART-3), ohne Skia, damit testbar. Budi-Leinwand 100 × 100. Der Rand bleibt,
// wo Accessoires und Schädlinge ihn erwarten (y 57 bis 68), der Bauch wölbt sich darunter.

/** Topfbauch. Auch die Maske für "blass" im Gesicht (FaceExtras). */
export const POT_BODY =
  'M22 67 L78 67 C81.5 67 83.6 72 82.6 79 C81.6 87.5 78 96.5 70 96.8 L30 96.8 C22 96.5 18.4 87.5 17.4 79 C16.4 72 18.5 67 22 67 Z';
export const POT_RIM = { x: 15, y: 57.5, width: 70, height: 10.2, r: 5.1 } as const;
