// Optionen für Routen ohne eigenen Tab (debug, harvest, seed-select, onboarding) in app/_layout.tsx.
// Nicht `href: null`: expo-router 58 macht daraus `hidden: true` und leitet einen fokussierten
// versteckten Tab sofort auf den Start-Tab um. Die Routen wären dann nicht erreichbar, und die
// Onboarding-Weiche liefe beim Erststart in eine Endlosschleife (React-Fehler #185).

export const HIDDEN_TAB_OPTIONS = {
  tabBarButton: () => null,
  tabBarItemStyle: { display: 'none' },
  tabBarStyle: { display: 'none' },
} as const;
