// Punkte-Popups über dem Spielfeld (Auftrag 40): "+1", "x2", "-3". Steigen auf und verblassen.

import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { MINIGAME_FEEL } from '../../../../game/config';
import { fonts } from '../../../../lib/theme';
import type { Popup } from './useFx';

/** Breite des Textfelds, damit der Text mittig über dem Treffer steht. */
const BOX = 120;

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
    const pop = v < 0.15 ? 0.6 + (v / 0.15) * 0.6 : 1.2 - Math.min(0.2, (v - 0.15) * 0.8);
    return {
      opacity: v < 0.7 ? 1 : 1 - (v - 0.7) / 0.3,
      transform: [{ translateY: -MINIGAME_FEEL.popupRise * v }, { scale: pop }],
    };
  });

  return (
    <Animated.View style={[styles.box, { left: popup.x - BOX / 2, top: popup.y - 20 }, style]}>
      <Text style={[styles.text, { color: popup.color, fontSize: popup.big ? 30 : 22 }]}>{popup.text}</Text>
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
  text: {
    fontFamily: fonts.headingBold,
    textShadowColor: 'rgba(43,43,43,0.35)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 2,
  },
});
