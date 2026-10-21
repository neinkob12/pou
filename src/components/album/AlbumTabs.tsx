import { useState, type ComponentType } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { colors, surface } from '../../lib/theme';

export interface AlbumTab {
  key: string;
  label: string;
  Component: ComponentType;
}

const FADE_MS = 180;

/** Umschaltung zwischen zwei Tabs als Schalter mit Kontur (WEB-5); der Inhalt blendet über. */
export function AlbumTabs({ tabs }: { tabs: AlbumTab[] }) {
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0];

  return (
    <View className="gap-4">
      <View
        accessibilityRole="tablist"
        className="flex-row gap-1 rounded-full bg-white p-1"
        style={{ borderWidth: surface.line, borderColor: colors.plantDark }}
      >
        {tabs.map((tab) => {
          const selected = tab.key === active?.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActiveKey(tab.key)}
              className={`min-h-10 flex-1 items-center justify-center rounded-full ${selected ? 'bg-plantDark' : 'active:bg-cream'}`}
            >
              <Text className={`font-body-bold text-base ${selected ? 'text-white' : 'text-inkMuted'}`}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {active ? (
        <Animated.View key={active.key} entering={FadeIn.duration(FADE_MS)}>
          <active.Component />
        </Animated.View>
      ) : null}
    </View>
  );
}
