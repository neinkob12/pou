import { Text, View } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  measure,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { care as careAssets, type CareAssetId } from '../../../lib/assets';
import { care } from '../../../content/strings';
import { cue } from '../../../lib/audio';
import { springs, type ColorName } from '../../../lib/theme';
import { AssetImage } from '../../ui/AssetImage';
import type { GameIconId } from '../../ui/icons/iconArt';
import { hud } from '../hud/hudStyle';
import { useCareControls } from './CareStage';
import { isInsideRect, type CareTool as CareToolId, type Rect } from './careLogic';
import { playPickupHaptic } from './haptics';
import { WaterDrops } from './WaterDrops';

const TOOL_SIZE = 60;
const PEDESTAL = 68;
/** Toleranz um Budi herum, damit das Ablegen nicht pixelgenau sein muss. */
const HOVER_SLOP = 24;
const LIFT_SCALE = 0.18;
/** Neigung beim Ziehen je Geschwindigkeit (Grad pro Punkt/s) und höchstens. */
const SWING_PER_SPEED = 0.025;
const SWING_MAX_DEG = 16;
const BOB_PX = 3;
const BOB_MS = 1300;
/** Wippen im Fach als CSS-Animation: kostet kein JavaScript pro Frame (ART-4, Messung in art4.md). */
const BOB = {
  animationName: { from: { transform: [{ translateY: 0 }] }, to: { transform: [{ translateY: -BOB_PX }] } },
  animationDuration: `${BOB_MS}ms`,
  animationTimingFunction: 'ease-in-out',
  animationIterationCount: 'infinite',
  animationDirection: 'alternate',
} as const;
const POUR_TILT_DEG: Record<CareToolId, number> = { water: -40, fertilizeGrow: -25, fertilizeBloom: -25 };

const TOOL_LOOK: Record<CareToolId, { asset: CareAssetId; color: ColorName; art: GameIconId }> = {
  water: { asset: 'u3_watering_can', color: 'night', art: 'wateringCan' },
  fertilizeGrow: { asset: 'u4_fertilizer_grow', color: 'plantLight', art: 'fertilizerGrow' },
  fertilizeBloom: { asset: 'u4_fertilizer_bloom', color: 'lavender', art: 'fertilizerBloom' },
};

interface CareToolProps {
  tool: CareToolId;
  /** Lage im Fach, versetzt das Wippen. */
  index: number;
  disabled: boolean;
  /** Über Budi losgelassen. */
  onDrop: () => void;
}

/**
 * Werkzeug im Fach (Look ART-4): wippt auf seinem Sockel, staucht beim Aufnehmen und streckt sich,
 * schwingt beim Ziehen mit der Bewegung, kippt über Budi zum Gießen und federt mit Überschwingen
 * zurück ins Fach.
 */
export function CareTool({ tool, index, disabled, onDrop }: CareToolProps) {
  const { targetRef, hovering } = useCareControls();
  const reduced = useReducedMotion();
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const lifted = useSharedValue(0);
  const squash = useSharedValue(0);
  const swing = useSharedValue(0);
  const over = useSharedValue(0);
  const target = useSharedValue<Rect | null>(null);
  const bobbing = !disabled && !reduced;

  const pan = usePanGesture({
    enabled: !disabled,
    minDistance: 4,
    onActivate: () => {
      'worklet';
      const m = measure(targetRef);
      target.value = m ? { x: m.pageX, y: m.pageY, width: m.width, height: m.height } : null;
      lifted.value = withSpring(1, springs.pop);
      squash.value = withSequence(withTiming(1, { duration: 70 }), withSpring(-0.6, springs.release), withSpring(0, springs.release));
      scheduleOnRN(playPickupHaptic);
      scheduleOnRN(cue, 'pickup');
    },
    onUpdate: (e) => {
      'worklet';
      x.value = e.translationX;
      y.value = e.translationY;
      const deg = Math.max(-SWING_MAX_DEG, Math.min(SWING_MAX_DEG, e.velocityX * SWING_PER_SPEED));
      swing.value = withSpring(deg, springs.fill);
      const inside = isInsideRect(e.absoluteX, e.absoluteY, target.value, HOVER_SLOP) ? 1 : 0;
      if (over.value !== inside) {
        over.value = inside;
        hovering.set(inside);
      }
    },
    onDeactivate: (e) => {
      'worklet';
      if (!e.canceled && over.value === 1) {
        // Ausgießen: kurzer Ruck nach vorn, dann zurück ins Fach.
        squash.value = withSequence(withTiming(-0.8, { duration: 90 }), withSpring(0, springs.release));
        scheduleOnRN(onDrop);
      }
    },
    onFinalize: () => {
      'worklet';
      over.value = 0;
      hovering.set(0);
      swing.value = withSpring(0, springs.release);
      lifted.value = withSpring(0, springs.release);
      x.value = withSpring(0, springs.release);
      y.value = withSpring(0, springs.release);
    },
  });

  const tilt = POUR_TILT_DEG[tool];
  const style = useAnimatedStyle(() => {
    const s = 1 + lifted.value * LIFT_SCALE;
    return {
      transform: [
        { translateX: x.value },
        { translateY: y.value },
        { rotate: `${withTiming(over.value * tilt, { duration: 180 }) + swing.value}deg` },
        { scaleX: s * (1 + squash.value * 0.18) },
        { scaleY: s * (1 - squash.value * 0.18) },
      ],
    };
  });
  // Das Werkzeug muss beim Ziehen über allem im Fach liegen, also die äußere Hülle anheben.
  const outer = useAnimatedStyle(() => ({ zIndex: lifted.value > 0.01 ? 10 : 0 }));
  const shadow = useAnimatedStyle(() => ({ opacity: 0.25 * (1 - lifted.value) }));

  const look = TOOL_LOOK[tool];
  return (
    <Animated.View className={`items-center ${disabled ? 'opacity-50' : ''}`} style={outer}>
      <View style={{ width: PEDESTAL, height: PEDESTAL, alignItems: 'center', justifyContent: 'center' }}>
        {/* Sockel: runde Mulde im Holz */}
        <View
          style={{
            position: 'absolute',
            bottom: 2,
            width: PEDESTAL,
            height: PEDESTAL * 0.42,
            borderRadius: PEDESTAL,
            backgroundColor: hud.tray.dark,
            borderWidth: 2,
            borderColor: hud.tray.edge,
          }}
        />
        <Animated.View
          style={[{ position: 'absolute', bottom: 6, width: PEDESTAL * 0.6, height: 8, borderRadius: 8, backgroundColor: hud.outline }, shadow]}
        />
        <Animated.View style={bobbing ? [BOB, { animationDelay: `${index * 260}ms` }] : undefined}>
          <GestureDetector gesture={pan}>
            <Animated.View
              accessible
              accessibilityRole="button"
              accessibilityLabel={care.tools[tool]}
              accessibilityHint={care.dragHint}
              accessibilityState={{ disabled }}
              accessibilityActions={[{ name: 'activate' }]}
              onAccessibilityAction={() => !disabled && onDrop()}
              style={style}
            >
              <AssetImage
                source={careAssets[look.asset]}
                label={care.toolPlaceholder[tool]}
                color={look.color}
                size={TOOL_SIZE}
                round
                icon={look.art}
              />
              {tool === 'water' ? <WaterDrops visible={over} /> : null}
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      </View>
      <View className="rounded-full border-2 px-2" style={{ borderColor: hud.outline, backgroundColor: hud.pedestal.base }}>
        <Text className="font-body-bold text-[11px] text-ink">{care.toolShort[tool]}</Text>
      </View>
    </Animated.View>
  );
}
