// Bild und Platzhalterfarbe je Upgrade, für Shop und Raum (ohne React, damit testbar).

import type { UpgradeId } from '../../game/config';
import type { UpgradeAssetId } from '../../lib/assets';
import type { ColorName } from '../../lib/theme';

export const UPGRADE_COLORS: Record<UpgradeId, ColorName> = {
  pot: 'terracotta',
  led: 'lamp',
  fanDehumidifier: 'night',
  bioSoil: 'plantDark',
  beneficials: 'plantLight',
};

const POT_ASSETS: readonly UpgradeAssetId[] = ['u1_pot_1', 'u1_pot_2', 'u1_pot_3'];

const SINGLE_ASSETS: Record<Exclude<UpgradeId, 'pot'>, UpgradeAssetId> = {
  led: 'u2_led_on',
  fanDehumidifier: 'u6_dehumidifier',
  bioSoil: 'u4_special',
  beneficials: 'beneficials',
};

/** Asset-ID für ein Upgrade in einer Stufe. Stufe 0 zeigt das Bild der ersten Stufe (Shop-Vorschau). */
export function upgradeAssetId(id: UpgradeId, level: number): UpgradeAssetId {
  if (id === 'pot') return POT_ASSETS[Math.min(POT_ASSETS.length, Math.max(1, level)) - 1];
  return SINGLE_ASSETS[id];
}
