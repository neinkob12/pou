import { useState, type ComponentType } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useDerivedValue, useReducedMotion, withSpring } from 'react-native-reanimated';

import { chrome, colors, motion, radii } from '../../lib/theme';

export interface AlbumTab {
  key: string;
  label: string;
  Component: ComponentType;
}

const FADE_MS = 180;
const PAD = 4;

/**
 * Umschaltung zwischen zwei Tabs (Redesign): helle Glas-Schiene, darauf gleitet eine weiße Pille
 * mit Federung zum gewählten Tab. Der Inhalt blendet über.
 */
export function AlbumTabs({ tabs }: { tabs: AlbumTab[] }) {
  const reduced = useReducedMotion();
  const [activeKey, setActiveKey] = useState(tabs[0]?.key);
  const [width, setWidth] = useState(0);
  const active = tabs.find((t) => t.key === activeKey) ?? tabs[0];
  const index = Math.max(0, tabs.findIndex((t) => t.key === active?.key));
  const slot = tabs.length > 0 ? (width - PAD * 2) / tabs.length : 0;

  const x = useDerivedValue(() => (reduced ? index * slot : withSpring(index * slot, motion.tab)), [index, slot, reduced]);
  const pill = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  return (
    <View className="gap-4">
      <View
        accessibilityRole="tablist"
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        style={{
          flexDirection: 'row',
          padding: PAD,
          borderRadius: radii.pill,
          backgroundColor: 'rgba(255,255,255,0.55)',
          borderWidth: 1,
          borderColor: chrome.glassLine,
        }}
      >
        {slot > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                top: PAD,
                bottom: PAD,
                left: PAD,
                width: slot,
                borderRadius: radii.pill,
                backgroundColor: colors.white,
                boxShadow: chrome.glassShadow,
              },
              pill,
            ]}
          />
        ) : null}
        {tabs.map((tab) => {
          const selected = tab.key === active?.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              onPress={() => setActiveKey(tab.key)}
              style={{ minHeight: 40, flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text className={`font-heading text-base ${selected ? 'text-plantDark' : 'text-inkMuted'}`}>{tab.label}</Text>
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
