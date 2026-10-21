import { useEffect } from 'react';
import { Image, Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

import { ui } from '../../../lib/assets';
import { chrome, colors, motion, springs, textShadow, typography } from '../../../lib/theme';
import { BudiAvatar } from '../../feedback/BudiAvatar';
import { ICON_SIZE, TAB_LOOK, tabIconPose } from './tabLook';

function playTap() {
  // lib/audio erst beim Tippen laden, wie in usePressSpring: kein Audio-Modul beim Import.
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- verzögertes Laden, siehe oben
  const { cue } = require('../../../lib/audio') as typeof import('../../../lib/audio');
  cue('tap');
}

interface TabItemProps {
  name: string;
  label: string;
  focused: boolean;
  onPress: () => void;
}

/** Ein Tab: Icon, das beim Aktivieren in die Kachel springt, Name erscheint darunter. */
export function TabItem({ name, label, focused, onPress }: TabItemProps) {
  const reduced = useReducedMotion();
  const look = TAB_LOOK[name];
  const p = useSharedValue(focused ? 1 : 0);
  const bump = useSharedValue(1);

  useEffect(() => {
    p.set(reduced ? (focused ? 1 : 0) : withSpring(focused ? 1 : 0, motion.tab));
    if (focused && !reduced) bump.set(withSequence(withTiming(1.18, { duration: 90 }), withSpring(1, springs.release)));
  }, [focused, reduced, p, bump]);

  const iconStyle = useAnimatedStyle(() => {
    const pose = tabIconPose(p.value);
    return {
      opacity: chrome.idleOpacity + (1 - chrome.idleOpacity) * p.value,
      transform: [{ translateY: pose.translateY }, { scale: pose.scale * bump.value }],
    };
  });
  const labelStyle = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateY: 8 - 20 * p.value }, { scale: 0.7 + 0.3 * p.value }] }));

  return (
    <Pressable
      role="tab"
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: focused }}
      onPress={() => {
        if (!focused) playTap();
        onPress();
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View style={[{ width: ICON_SIZE + 6, height: ICON_SIZE + 6, alignItems: 'center', justifyContent: 'center' }, iconStyle]}>
        {look.icon === 'budi' ? (
          <BudiAvatar size={ICON_SIZE - 2} />
        ) : (
          <Image source={ui[look.icon]} accessibilityIgnoresInvertColors style={{ width: ICON_SIZE, height: ICON_SIZE }} />
        )}
      </Animated.View>
      <View style={{ height: 14 }}>
        <Animated.Text
          numberOfLines={1}
          style={[
            typography.small,
            {
              fontFamily: typography.button.fontFamily,
              fontSize: 12,
              color: colors.white,
              textShadowColor: textShadow.color,
              textShadowOffset: textShadow.offset,
              textShadowRadius: textShadow.radius,
            },
            labelStyle,
          ]}
        >
          {label}
        </Animated.Text>
      </View>
    </Pressable>
  );
}
