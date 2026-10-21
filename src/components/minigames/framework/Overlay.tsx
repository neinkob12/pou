// Ebene über dem Spielfeld (Auftrag 51 im Spiel-Look): Abdunkeln blendet weich ein, die Karte federt
// mit Überschwingen auf, hat eine dicke Kontur, einen Glanzstreifen und einen weichen Schatten.

import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { gameRadii, outline, shadows, springs, spacing, tones } from '../../../lib/theme';
import { GlossFill } from '../../ui/game/GlossFill';

interface OverlayProps {
  children: ReactNode;
  /** Abgedunkelter Hintergrund mit Karte (Pause, Spielende) oder nur zentriert (Countdown). */
  card?: boolean;
  /** Berührungen gehen durch aufs Spielfeld (z. B. "Los!", während das Spiel schon läuft). */
  passThrough?: boolean;
}

function Card({ children }: { children: ReactNode }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(withSpring(1, springs.pop));
  }, [t]);
  const dim = useAnimatedStyle(() => ({ opacity: Math.min(1, t.get()) }));
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: 0.6 + 0.4 * t.get() }, { translateY: (1 - t.get()) * 40 }] }));
  return (
    <>
      <Animated.View style={[StyleSheet.absoluteFill, styles.dim, dim]} />
      <Animated.View style={[styles.card, pop]}>
        <GlossFill tone={tones.cream} radius={gameRadii.modal - outline.thick} />
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </>
  );
}

/** Liegt über dem Spielfeld und fängt alle Berührungen ab. */
export function Overlay({ children, card = true, passThrough = false }: OverlayProps) {
  return (
    <View pointerEvents={passThrough ? 'none' : 'auto'} style={styles.wrap}>
      {card ? <Card>{children}</Card> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  dim: { backgroundColor: 'rgba(30,20,50,0.55)' },
  card: {
    width: '100%',
    maxWidth: 384,
    borderRadius: gameRadii.modal,
    borderWidth: outline.thick,
    borderColor: outline.color,
    backgroundColor: tones.cream.base,
    boxShadow: shadows.pop,
  },
  content: { gap: spacing.md - 4, padding: spacing.lg },
});
