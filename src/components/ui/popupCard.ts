import type { ViewStyle } from 'react-native';

import { gameRadii, insets, outline, shadows } from '../../lib/theme';

/** Kontur, Kante und Schatten der Popup-Karten (Modal, Fakten-Popup) im Spiel-Look (ART-1). */
export const popupCardStyle: ViewStyle = {
  borderRadius: gameRadii.modal,
  borderWidth: outline.thick,
  borderBottomWidth: outline.thick + 4,
  borderColor: outline.color,
  boxShadow: `${shadows.pop}, ${insets.highlight}`,
};

/** Größte Breite einer Popup-Karte, entspricht max-w-md. */
export const POPUP_MAX_WIDTH = 448;
