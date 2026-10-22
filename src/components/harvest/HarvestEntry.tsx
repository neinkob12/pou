import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { harvestScreen } from '../../content/strings';
import { chrome } from '../../lib/theme';
import { Button } from '../ui/Button';
import type { HarvestStep } from './harvestFlow';

const LABEL: Partial<Record<HarvestStep, string>> = {
  ready: harvestScreen.entryReady,
  drying: harvestScreen.entryDrying,
  done: harvestScreen.entryDone,
  summary: harvestScreen.entrySummary,
  empty: harvestScreen.entryEmpty,
};

/** Schritte, in denen es im Zimmer nichts zu pflegen gibt: der Knopf ersetzt dann die Werkzeuge. */
export const ENTRY_REPLACES_TOOLS: readonly HarvestStep[] = ['empty', 'drying', 'done', 'summary'];

export function harvestEntryLabel(step: HarvestStep): string | null {
  return LABEL[step] ?? null;
}

/**
 * Großer Handlungsknopf im Zimmer (Redesign): führt zur Ernte (ab "ready") oder bei leerem Topf zur
 * Samenauswahl. Atmet sanft und trägt einen goldenen Lichthof, damit er der klare nächste Schritt ist.
 */
export function HarvestEntry({ step }: { step: HarvestStep }) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const pulse = useSharedValue(0);
  const label = LABEL[step];

  useEffect(() => {
    if (reduced || !label) return;
    pulse.set(withRepeat(withSequence(withTiming(1, { duration: 700 }), withTiming(0, { duration: 700 })), -1));
    return () => cancelAnimation(pulse);
  }, [reduced, label, pulse]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.04 }] }));
  const halo = useAnimatedStyle(() => ({ opacity: 0.35 + pulse.value * 0.45, transform: [{ scale: 1 + pulse.value * 0.08 }] }));

  if (!label) return null;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[{ position: 'absolute', left: -14, right: -14, top: -10, bottom: -10, borderRadius: 40, backgroundColor: chrome.halo }, halo]}
      />
      <Animated.View style={style}>
        <Button
          label={label}
          size="lg"
          variant={step === 'ready' ? 'gold' : 'primary'}
          onPress={() => router.push(step === 'empty' ? '/seed-select' : '/harvest')}
        />
      </Animated.View>
    </View>
  );
}
