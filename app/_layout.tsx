import '../global.css';

import { SplashScreen } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { TabIcon } from '../src/components/ui/TabIcon';
import { tabs } from '../src/content/strings';
import { useAppFonts } from '../src/hooks/useAppFonts';
import { colors, fonts } from '../src/lib/theme';

SplashScreen.preventAutoHideAsync();

// Gehört P01. Alle Routen sind hier registriert; Screens ohne Tab haben href: null.
// Fehlt eine Route, den Leiter fragen, statt dieses Layout zu ändern.
const hidden = { href: null, tabBarStyle: { display: 'none' } } as const;

export default function RootLayout() {
  const fontsReady = useAppFonts();

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  if (!fontsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Tabs
        backBehavior="history"
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.coral,
          tabBarInactiveTintColor: colors.inkMuted,
          tabBarStyle: { backgroundColor: colors.white },
          tabBarLabelStyle: { fontFamily: fonts.bodyBold },
          tabBarIcon: TabIcon,
        }}
      >
        <Tabs.Screen name="index" options={{ title: tabs.room }} />
        <Tabs.Screen name="minigames" options={{ title: tabs.minigames }} />
        <Tabs.Screen name="shop" options={{ title: tabs.shop }} />
        <Tabs.Screen name="album" options={{ title: tabs.album }} />
        <Tabs.Screen name="settings" options={{ title: tabs.settings }} />
        <Tabs.Screen name="debug" options={hidden} />
        <Tabs.Screen name="harvest" options={hidden} />
        <Tabs.Screen name="seed-select" options={hidden} />
        <Tabs.Screen name="onboarding" options={hidden} />
      </Tabs>
    </GestureHandlerRootView>
  );
}
