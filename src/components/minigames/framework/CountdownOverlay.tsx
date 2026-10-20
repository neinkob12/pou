import { useEffect, useRef, useState } from 'react';
import { Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { minigameFeel } from '../../../content/strings';
import { MINIGAME_FEEL } from '../../../game/config';
import { Overlay } from './Overlay';
import type { MinigamePhase } from './session';

/** Zahl oder "Los!" springt beim Wechsel auf und setzt sich weich (Auftrag 40). */
function PopText({ text, colorClass }: { text: string; colorClass: string }) {
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);
  useEffect(() => {
    scale.set(withSequence(withTiming(1.25, { duration: 120 }), withSpring(1, { damping: 9, stiffness: 220 })));
    opacity.set(withTiming(1, { duration: 90 }));
  }, [text, opacity, scale]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get(), transform: [{ scale: scale.get() }] }));
  return (
    <Animated.View style={style}>
      <Text className={`font-heading text-8xl ${colorClass}`}>{text}</Text>
    </Animated.View>
  );
}

/** Großer Start-Countdown (3, 2, 1) über dem Spielfeld. */
export function CountdownOverlay({ value }: { value: number }) {
  return (
    <Overlay card={false}>
      <PopText key={value} text={String(value)} colorClass="text-coral" />
    </Overlay>
  );
}

/** "Los!" kurz nach dem Countdown. Zeigt sich einmal je Runde. */
export function GoFlash({ phase }: { phase: MinigamePhase }) {
  const [visible, setVisible] = useState(false);
  const shown = useRef(false);
  useEffect(() => {
    if (phase !== 'playing' || shown.current) return;
    shown.current = true;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), MINIGAME_FEEL.goFlashMs);
    return () => clearTimeout(timer);
  }, [phase]);
  if (!visible) return null;
  return (
    <Overlay card={false} passThrough>
      <PopText text={minigameFeel.go} colorClass="text-plantDark" />
    </Overlay>
  );
}
