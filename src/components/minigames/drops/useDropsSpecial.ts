// Sonder-Ereignisse von "Tropfen fangen" (Auftrag 45): Banner für Schauer und Schutzblatt, Popups
// für goldene Tropfen und abgehaltenes Salz, jeweils mit Ton. Nur JS-Thread (aus Worklets per scheduleOnRN).

import { useCallback } from 'react';
import type { SharedValue } from 'react-native-reanimated';

import { minigameFun } from '../../../content/strings';
import { cue } from '../../../lib/audio';
import { colors, funColors, gameColors } from '../../../lib/theme';
import type { Fx } from '../framework/fx/useFx';
import { potTop } from './dropsLogic';

export type DropsSpecial = 'golden' | 'shield' | 'shieldUsed' | 'shower';

export function useDropsSpecial(
  fx: Fx,
  showBanner: (text: string, color?: string) => void,
  size: SharedValue<{ width: number; height: number }>,
) {
  return useCallback(
    (kind: DropsSpecial, x: number) => {
      const y = potTop(size.get().height) - 40;
      if (kind === 'shower') {
        showBanner(minigameFun.dropsShower, gameColors.waterDark);
      } else if (kind === 'shield') {
        cue('collect');
        showBanner(minigameFun.dropsShield, colors.plantDark);
      } else if (kind === 'shieldUsed') {
        cue('hit');
        fx.popup(x, y, minigameFun.dropsShieldUsed, colors.plantDark, true);
      } else {
        cue('collect');
        fx.popup(x, y, minigameFun.dropsGolden, funColors.goldDeep, true);
      }
    },
    [fx, showBanner, size],
  );
}
