import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, type SharedValue } from 'react-native-reanimated';

import { springs } from '../../../lib/theme';
import { hud } from '../hud/hudStyle';

const WIDTH = 230;
const HEIGHT = 56;

/** Leuchtender Ring unter Budi, solange ein Werkzeug über ihm schwebt (ART-4): "hier loslassen". */
export function HoverGlow({ hovering }: { hovering: SharedValue<number> }) {
  const style = useAnimatedStyle(() => {
    const on = withSpring(hovering.value, springs.pop);
    return { opacity: on, transform: [{ scaleX: 0.7 + on * 0.3 }, { scaleY: 0.7 + on * 0.3 }] };
  });
  return <Animated.View pointerEvents="none" style={[styles.ring, style]} />;
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: -HEIGHT / 2 + 6,
    width: WIDTH,
    height: HEIGHT,
    borderRadius: WIDTH,
    borderWidth: 4,
    borderColor: hud.ringHoverEdge,
    backgroundColor: hud.ringHover,
  },
});
