import { fonts, outline, shadows, tones } from '../../lib/theme';

/** Höhe der Tab-Leiste ohne Sicherheitsabstand unten. */
export const TAB_BAR_HEIGHT = 66;

/**
 * Tab-Leiste im Spiel-Look (ART-1) als screenOptions für expo-router Tabs: cremefarbene Leiste
 * mit dicker Kontur oben und Schatten, Beschriftung in Spielschrift. Einhängen in app/_layout.tsx:
 * `screenOptions={{ headerShown: false, ...gameTabBarOptions(insets.bottom) }}`.
 */
export function gameTabBarOptions(bottomInset: number) {
  return {
    tabBarActiveTintColor: tones.coral.edge,
    tabBarInactiveTintColor: tones.stone.text,
    tabBarStyle: {
      backgroundColor: tones.cream.base,
      borderTopWidth: outline.regular,
      borderTopColor: outline.color,
      boxShadow: shadows.card,
      height: TAB_BAR_HEIGHT + bottomInset,
      paddingTop: 6,
      paddingBottom: bottomInset + 6,
    },
    tabBarLabelStyle: { fontFamily: fonts.headingBold, fontSize: 11 },
  } as const;
}
