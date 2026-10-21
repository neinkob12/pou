import { useEffect, useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { roomHud } from '../../content/strings';
import { ui } from '../../lib/assets';
import { chrome, radii, tones } from '../../lib/theme';
import { HudBar } from './hud/HudBar';
import { NEED_TONES } from './hud/hudStyle';
import { showLightSwitch } from './phase/lightCycle';
import { LightFlipDialog } from './phase/LightFlipDialog';
import { PhaseSheet } from './phase/PhaseSheet';
import { usePlantStatus } from './phase/usePlantStatus';
import { phaseText } from './phaseText';

const ICON_BOX = 34;

/** Goldener Punkt, der pulsiert, solange im Phasen-Popup etwas zu tun ist (Umschalten auf 12/12). */
function AttentionDot() {
  const reduced = useReducedMotion();
  const s = useSharedValue(1);
  useEffect(() => {
    if (reduced) return;
    s.set(withRepeat(withSequence(withTiming(1.3, { duration: 420 }), withTiming(1, { duration: 420 })), -1));
  }, [reduced, s]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          top: -4,
          right: -4,
          width: 18,
          height: 18,
          borderRadius: 9,
          borderWidth: 2,
          borderColor: chrome.glass,
          backgroundColor: tones.gold.dark,
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}
    >
      <Text className="font-heading text-xs text-white">!</Text>
    </Animated.View>
  );
}

/**
 * Phase als kompakter Chip (Redesign): Name, dünner Fortschritt und Restzeit. Antippen öffnet die
 * Details mit Lichtplan und dem Schalter auf 12/12 (P11), statt alles dauerhaft zu zeigen.
 */
export function PhaseHeader() {
  const view = usePlantStatus();
  const [sheet, setSheet] = useState(false);
  const [dialog, setDialog] = useState(false);
  const text = phaseText(view.status);
  const tone = NEED_TONES.nutrients;
  const switchReady = Boolean(view.status && showLightSwitch(view.status, view.autoflower) && view.status.canFlipLight);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${text.phaseLabel}. ${text.remaining}. ${roomHud.phaseDetails}`}
        onPress={() => view.status && setSheet(true)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          maxWidth: 220,
          paddingLeft: 5,
          paddingRight: 12,
          paddingVertical: 5,
          borderRadius: radii.pill,
          backgroundColor: chrome.glass,
          borderWidth: 1,
          borderColor: chrome.glassLine,
          boxShadow: chrome.glassShadow,
        }}
      >
        <View
          style={{
            width: ICON_BOX,
            height: ICON_BOX,
            borderRadius: ICON_BOX / 2,
            backgroundColor: tone.light,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image source={view.status ? ui.u11_nutrients : ui.ui_seed} style={{ width: 24, height: 24 }} />
        </View>
        <View style={{ flexShrink: 1, gap: 2 }}>
          <Text numberOfLines={1} className="font-heading text-[15px] leading-[18px] text-ink">
            {view.status ? text.phaseLabel : roomHud.noPlant}
          </Text>
          {view.status ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 52 }}>
                <HudBar value={text.progress} fill={tone.base} deep={tone.dark} height={8} />
              </View>
              <Text numberOfLines={1} className="font-body-bold text-[11px] text-inkMuted">
                {text.remaining}
              </Text>
            </View>
          ) : null}
        </View>
        {switchReady ? <AttentionDot /> : null}
      </Pressable>
      <PhaseSheet
        visible={sheet}
        view={view}
        switchReady={switchReady}
        onClose={() => setSheet(false)}
        onSwitch={() => {
          setSheet(false);
          setDialog(true);
        }}
      />
      <LightFlipDialog visible={dialog} debugMultiplier={view.debugMultiplier} onClose={() => setDialog(false)} />
    </>
  );
}
