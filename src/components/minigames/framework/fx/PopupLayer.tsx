// Punkte-Popups über dem Spielfeld (Auftrag 40): "+1", "x2", "-3". Steigen auf und verblassen.

import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { MINIGAME_FEEL } from '../../../../game/config';
import { StrokeText } from '../StrokeText';
import type { Popup } from './useFx';

/** Breite des Textfelds, damit der Text mittig über dem Treffer steht. */
const BOX = 160;

function PopupText({ popup, onDone }: { popup: Popup; onDone: (id: number) => void }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.set(
      withTiming(1, { duration: MINIGAME_FEEL.popupMs, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) scheduleOnRN(onDone, popup.id);
      }),
    );
  }, [onDone, popup.id, t]);

  const style = useAnimatedStyle(() => {
    const v = t.get();
    // Knallt mit Überschwingen auf, steigt, wackelt kurz und verblasst.
    const pop = v < 0.12 ? 0.3 + (v / 0.12) * 1.1 : v < 0.25 ? 1.4 - ((v - 0.12) / 0.13) * 0.4 : 1;
    return {
      opacity: v < 0.7 ? 1 : 1 - (v - 0.7) / 0.3,
      transform: [
        { translateY: -MINIGAME_FEEL.popupRise * v },
        { scale: pop },
        { rotate: `${Math.sin(v * 12) * 6 * (1 - v)}deg` },
      ],
    };
  });

  return (
    <Animated.View style={[styles.box, { left: popup.x - BOX / 2, top: popup.y - 20 }, style]}>
      <StrokeText size={popup.big ? 32 : 24} color={popup.color}>
        {popup.text}
      </StrokeText>
    </Animated.View>
  );
}

export function PopupLayer({ popups, onDone }: { popups: Popup[]; onDone: (id: number) => void }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {popups.map((p) => (
        <PopupText key={p.id} popup={p} onDone={onDone} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { position: 'absolute', width: BOX, alignItems: 'center' },
});
