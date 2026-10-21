import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useDerivedValue, useReducedMotion, withSpring } from 'react-native-reanimated';

import { chrome, gameRadii, motion, outline, shadows, type Tone } from '../../../lib/theme';
import { gradientStyle, toneGradient } from '../game/gradient';
import { TabItem } from './TabItem';
import { BAR_HEIGHT, TAB_LOOK, TILE } from './tabLook';

/**
 * Tab-Leiste im Spiel-Look: dunkle Leiste, der aktive Tab sitzt auf einer farbigen Kachel, die
 * aus der Leiste ragt und beim Wechsel mit Federung hinübergleitet. Inaktive Tabs zeigen nur das
 * Icon, der aktive dazu seinen Namen (keine abgeschnittenen Beschriftungen).
 */
export function GameTabBar({ state, descriptors, emitter, navigateToTab, insets }: BottomTabBarProps) {
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const focused = state.routes[state.index];
  const visible = state.routes.filter((r) => TAB_LOOK[r.name]);
  const activeIndex = visible.findIndex((r) => r.key === focused.key);
  const slot = visible.length > 0 ? width / visible.length : 0;

  const x = useDerivedValue(() => {
    const target = Math.max(0, activeIndex) * slot;
    return reduced ? target : withSpring(target, motion.tab);
  }, [activeIndex, slot, reduced]);
  const tileStyle = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  // Screens ohne Tab (Debug, Ernte, Samenwahl, Altersfrage) blenden die Leiste aus.
  const hidden = (descriptors[focused.key]?.options.tabBarStyle as { display?: string } | undefined)?.display === 'none';
  if (hidden) return null;

  const tone: Tone | null = activeIndex >= 0 ? TAB_LOOK[visible[activeIndex].name].tone : null;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View
      style={{
        ...gradientStyle(`linear-gradient(180deg, ${chrome.barTop} 0%, ${chrome.barBottom} 100%)`, chrome.barBottom),
        paddingBottom: insets.bottom,
        borderTopWidth: outline.regular,
        borderTopColor: chrome.barLine,
        boxShadow: '0 -4px 14px rgba(20,30,20,0.25)',
      }}
    >
      <View role="tablist" onLayout={onLayout} style={{ height: BAR_HEIGHT, flexDirection: 'row' }}>
        {tone && slot > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              {
                position: 'absolute',
                left: (slot - TILE.width) / 2,
                top: TILE.top,
                width: TILE.width,
                height: TILE.height,
                borderRadius: gameRadii.button,
                borderWidth: outline.regular,
                borderColor: outline.color,
                borderBottomWidth: outline.regular + 3,
                borderBottomColor: tone.edge,
                boxShadow: shadows.button,
                ...gradientStyle(toneGradient(tone), tone.base),
              },
              tileStyle,
            ]}
          >
            <View style={{ position: 'absolute', top: 4, left: 10, right: 10, height: 8, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.45)' }} />
          </Animated.View>
        ) : null}
        {visible.map((route) => {
          const isFocused = route.key === focused.key;
          const options = descriptors[route.key].options;
          const label = typeof options.title === 'string' ? options.title : route.name;
          const onPress = () => {
            const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigateToTab(route.key);
          };
          return <TabItem key={route.key} name={route.name} label={label} focused={isFocused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}
