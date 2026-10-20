import { Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { measure, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { care as careAssets, type CareAssetId } from '../../../lib/assets';
import { care } from '../../../content/strings';
import { cue } from '../../../lib/audio';
import type { ColorName } from '../../../lib/theme';
import { AssetImage } from '../../ui/AssetImage';
import type { GameIconId } from '../../ui/icons/iconArt';
import { useCareStage } from './CareStage';
import { isInsideRect, type CareTool as CareToolId, type Rect } from './careLogic';
import { playPickupHaptic } from './haptics';
import { WaterDrops } from './WaterDrops';

const TOOL_SIZE = 64;
/** Toleranz um Budi herum, damit das Ablegen nicht pixelgenau sein muss. */
const HOVER_SLOP = 24;
const LIFT_SCALE = 0.15;
const POUR_TILT_DEG: Record<CareToolId, number> = { water: -40, fertilizeGrow: -25, fertilizeBloom: -25 };

const TOOL_LOOK: Record<CareToolId, { asset: CareAssetId; color: ColorName; art: GameIconId }> = {
  water: { asset: 'u3_watering_can', color: 'night', art: 'wateringCan' },
  fertilizeGrow: { asset: 'u4_fertilizer_grow', color: 'plantLight', art: 'fertilizerGrow' },
  fertilizeBloom: { asset: 'u4_fertilizer_bloom', color: 'lavender', art: 'fertilizerBloom' },
};

interface CareToolProps {
  tool: CareToolId;
  disabled: boolean;
  /** Über Budi losgelassen. */
  onDrop: () => void;
}

/** Werkzeug im Fach: zu Budi ziehen, über ihm loslassen. Federt danach zurück ins Fach. */
export function CareTool({ tool, disabled, onDrop }: CareToolProps) {
  const { targetRef, hovering } = useCareStage();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const lifted = useSharedValue(0);
  const over = useSharedValue(0);
  const target = useSharedValue<Rect | null>(null);

  const pan = usePanGesture({
    enabled: !disabled,
    minDistance: 4,
    onActivate: () => {
      'worklet';
      const m = measure(targetRef);
      target.value = m ? { x: m.pageX, y: m.pageY, width: m.width, height: m.height } : null;
      lifted.value = withSpring(1);
      scheduleOnRN(playPickupHaptic);
      scheduleOnRN(cue, 'pickup');
    },
    onUpdate: (e) => {
      'worklet';
      x.value = e.translationX;
      y.value = e.translationY;
      const inside = isInsideRect(e.absoluteX, e.absoluteY, target.value, HOVER_SLOP) ? 1 : 0;
      if (over.value !== inside) {
        over.value = inside;
        hovering.set(inside);
      }
    },
    onDeactivate: (e) => {
      'worklet';
      if (!e.canceled && over.value === 1) scheduleOnRN(onDrop);
    },
    onFinalize: () => {
      'worklet';
      over.value = 0;
      hovering.set(0);
      lifted.value = withSpring(0);
      x.value = withSpring(0);
      y.value = withSpring(0);
    },
  });

  const tilt = POUR_TILT_DEG[tool];
  const style = useAnimatedStyle(() => ({
    zIndex: lifted.value > 0 ? 10 : 0,
    transform: [
      { translateX: x.value },
      { translateY: y.value },
      { scale: 1 + lifted.value * LIFT_SCALE },
      { rotate: `${withTiming(over.value * tilt)}deg` },
    ],
  }));

  const look = TOOL_LOOK[tool];
  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={care.tools[tool]}
        accessibilityHint={care.dragHint}
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={() => !disabled && onDrop()}
        className={`items-center gap-1 ${disabled ? 'opacity-40' : ''}`}
        style={style}
      >
        <View>
          <AssetImage
            source={careAssets[look.asset]}
            label={care.toolPlaceholder[tool]}
            color={look.color}
            size={TOOL_SIZE}
            round
            icon={look.art}
          />
          {tool === 'water' ? <WaterDrops visible={over} /> : null}
        </View>
        <Text className="font-body-bold text-xs text-ink">{care.toolShort[tool]}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
