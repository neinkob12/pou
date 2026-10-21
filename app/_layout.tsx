import '../global.css';

import { SplashScreen } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AppFrame } from '../src/components/frame/AppFrame';
import { OnboardingGate } from '../src/components/onboarding/OnboardingGate';
import { tabIcon } from '../src/components/ui/TabIcon';
import { tabs } from '../src/content/strings';
import { useAppFonts } from '../src/hooks/useAppFonts';
import { useNotificationScheduler } from '../src/hooks/useNotificationScheduler';
import { HIDDEN_TAB_OPTIONS } from '../src/lib/hiddenTab';
import { useSkiaReady } from '../src/lib/skiaWeb';
import { colors, fonts, surface } from '../src/lib/theme';

SplashScreen.preventAutoHideAsync();

// Gehört P01. Alle Routen sind hier registriert; Screens ohne Tab nutzen HIDDEN_TAB_OPTIONS.
// Fehlt eine Route, den Leiter fragen, statt dieses Layout zu ändern.
const hidden = HIDDEN_TAB_OPTIONS;

export default function RootLayout() {
  const fontsReady = useAppFonts();
  const skiaReady = useSkiaReady();
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
            tabBarActiveTintColor: colors.coral,
            tabBarInactiveTintColor: colors.inkMuted,
            // Tab-Leiste im Stil der Zimmer-Navigation (WEB-5): Kontur oben, gezeichnete Icons.
            tabBarStyle: {
              backgroundColor: colors.white,
              borderTopWidth: surface.line,
              borderTopColor: colors.plantDark,
              paddingTop: 6,
            },
            tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
            animation: 'fade',
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
