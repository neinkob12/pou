import '../global.css';

import { SplashScreen } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFrame } from '../src/components/frame/AppFrame';
import { OnboardingGate } from '../src/components/onboarding/OnboardingGate';
import { gameTabBarOptions } from '../src/components/ui/TabBar';
import { tabIcon } from '../src/components/ui/TabIcon';
import { tabs } from '../src/content/strings';
import { useAppFonts } from '../src/hooks/useAppFonts';
import { useNotificationScheduler } from '../src/hooks/useNotificationScheduler';
import { HIDDEN_TAB_OPTIONS } from '../src/lib/hiddenTab';
import { useSkiaReady } from '../src/lib/skiaWeb';
import { colors } from '../src/lib/theme';

SplashScreen.preventAutoHideAsync();

// Gehört P01. Alle Routen sind hier registriert; Screens ohne Tab nutzen HIDDEN_TAB_OPTIONS.
// Fehlt eine Route, den Leiter fragen, statt dieses Layout zu ändern.
const hidden = HIDDEN_TAB_OPTIONS;

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const skiaReady = useSkiaReady();
  const insets = useSafeAreaInsets();
  useNotificationScheduler();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady || !skiaReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      {/* Web am Rechner: zentrierter Handy-Rahmen (WEB-3). Nativ ohne Wirkung. */}
      <AppFrame>
        <Tabs
          backBehavior="history"
          screenOptions={{
            headerShown: false,
            // Tab-Leiste im Spiel-Look (ART-1): Kontur oben, Spielschrift, aktiver Tab auf goldener Pille.
            ...gameTabBarOptions(insets.bottom),
            // Wischen zwischen den Tabs wie in Spielen (ART-5), dazu federt jeder Screen herein (GameScreen).
            animation: 'shift',
            sceneStyle: { backgroundColor: colors.cream },
          }}
        >
          <Tabs.Screen name="index" options={{ title: tabs.room, tabBarIcon: tabIcon('budi') }} />
          <Tabs.Screen name="minigames" options={{ title: tabs.minigames, tabBarIcon: tabIcon('minigames') }} />
          <Tabs.Screen name="shop" options={{ title: tabs.shop, tabBarIcon: tabIcon('shop') }} />
          <Tabs.Screen name="album" options={{ title: tabs.album, tabBarIcon: tabIcon('album') }} />
          <Tabs.Screen name="settings" options={{ title: tabs.settings, tabBarIcon: tabIcon('settings') }} />
          <Tabs.Screen name="debug" options={hidden} />
          <Tabs.Screen name="harvest" options={hidden} />
          <Tabs.Screen name="seed-select" options={hidden} />
          <Tabs.Screen name="onboarding" options={hidden} />
        </Tabs>
        {/* Onboarding-Weiche (P26): Altersfrage, Tutorial im Zimmer, Consent-Schritt. */}
        <OnboardingGate />
        {/* Ende Onboarding-Weiche (P26) */}
      </AppFrame>
    </GestureHandlerRootView>
  );
}
