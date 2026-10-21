import type { ViewStyle } from 'react-native';

import { colors, surface } from '../../lib/theme';

/** Kontur und Kante der Popup-Karten (Modal, Fakten-Popup), wie die Karten der Screens (WEB-5). */
export const popupCardStyle: ViewStyle = {
  borderWidth: surface.line,
  borderBottomWidth: surface.edge,
  borderColor: colors.plantDark,
  boxShadow: '0 16px 40px rgba(0, 0, 0, 0.3)',
};

/** Größte Breite einer Popup-Karte, entspricht max-w-md. */
export const POPUP_MAX_WIDTH = 448;
