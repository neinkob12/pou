import type { ReactNode } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

/** Abstand zwischen zwei Karten beim Hereinkommen. */
const STAGGER_MS = 60;
/** Ab hier kommen alle weiteren gleichzeitig, damit lange Listen nicht trödeln. */
const MAX_STAGGER = 6;

interface AppearProps {
  children: ReactNode;
  /** Position in der Liste: spätere Karten kommen etwas später. */
  index?: number;
}

/**
 * Karte gleitet beim Öffnen des Screens leicht von unten herein (WEB-5). Layout nur per style,
 * NativeWind-Klassen bleiben innen (Reanimated-Views im Web).
 */
export function Appear({ children, index = 0 }: AppearProps) {
  const delay = Math.min(index, MAX_STAGGER) * STAGGER_MS;
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify().damping(16)} style={{ width: '100%' }}>
      {children}
    </Animated.View>
  );
}
