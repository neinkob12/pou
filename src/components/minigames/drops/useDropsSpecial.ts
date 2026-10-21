// Sonder-Ereignisse von "Tropfen fangen" (Auftrag 45): Banner für Schauer und Schutzblatt, Popups
// für goldene Tropfen und abgehaltenes Salz, jeweils mit Ton. Nur JS-Thread (aus Worklets per scheduleOnRN).

import { useCallback } from 'react';
import type { SharedValue } from 'react-native-reanimated';

import { minigameFun } from '../../../content/strings';
import { cue } from '../../../lib/audio';
import { colors, gameColors } from '../../../lib/theme';
import { tones } from '../framework/art/palette';
import type { Fx } from '../framework/fx/useFx';
import { potTop } from './dropsLogic';

const POPUP_HALF = 64;

export type DropsSpecial = 'golden' | 'shield' | 'shieldUsed' | 'shower';

export function useDropsSpecial(
  fx: Fx,
  showBanner: (text: string, color?: string) => void,
  size: SharedValue<{ width: number; height: number }>,
) {
  return useCallback(
    (kind: DropsSpecial, atX: number) => {
      const { width, height } = size.get();
      // Popups sind 120 breit: am Rand nach innen ziehen, sonst ist der Text abgeschnitten.
      const x = Math.min(Math.max(atX, POPUP_HALF), Math.max(POPUP_HALF, width - POPUP_HALF));
      const y = potTop(height) - 40;
      if (kind === 'shower') {
        showBanner(minigameFun.dropsShower, gameColors.waterDark);
      } else if (kind === 'shield') {
        cue('collect');
        showBanner(minigameFun.dropsShield, colors.plantDark);
      } else if (kind === 'shieldUsed') {
        cue('hit');
        fx.popup(x, y, minigameFun.dropsShieldUsed, tones.leaf.light, true);
      } else {
        cue('collect');
        fx.popup(x, y, minigameFun.dropsGolden, tones.gold.base, true);
      }
    },
    [fx, showBanner, size],
  );
}
