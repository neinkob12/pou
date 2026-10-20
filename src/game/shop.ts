// PotPou Shop-Upgrades: Kauf und Wirkung (reine Logik, kein React).
// Gespeichert ist nur die gekaufte Stufe je Upgrade. Die Wirkung wird daraus berechnet und von
// den Aufrufern an computeNeeds/applyCare (P04, P10), runHealthChecks (P05), den Lichtbalken
// (P11) und die Ernte (P24) weitergereicht. Die Rechnungen selbst bleiben dort.

import { UPGRADE_IDS, UPGRADES, type UpgradeId, type UpgradeLevel } from './config';
import { NEED_IDS, type NeedModifiers } from './needs';

/** Gekaufte Stufe je Upgrade. 0 = nicht gekauft, 1 = erste Stufe usw. */
export type UpgradeLevels = Record<UpgradeId, number>;

/** Zusammengefasste Wirkung aller gekauften Upgrades. 1 bzw. false = keine Wirkung. */
export interface UpgradeEffects {
  needModifiers: NeedModifiers;
  lightDecayMultiplier: number;
  yieldMultiplier: number;
  pestChanceMultiplier: number;
  hasDehumidifier: boolean;
}

export function createUpgradeLevels(): UpgradeLevels {
  const levels = {} as UpgradeLevels;
  for (const id of UPGRADE_IDS) levels[id] = 0;
  return levels;
}

export function maxLevel(id: UpgradeId): number {
  return UPGRADES[id].length;
}

/** Gekaufte Stufe; unbekannte oder kaputte Werte aus alten Spielständen gelten als 0. */
export function levelOf(levels: Partial<UpgradeLevels>, id: UpgradeId): number {
  const level = levels[id] ?? 0;
  return Number.isFinite(level) ? Math.min(maxLevel(id), Math.max(0, Math.floor(level))) : 0;
}

/** Nächste kaufbare Stufe, oder null, wenn alles gekauft ist. */
export function nextLevel(levels: Partial<UpgradeLevels>, id: UpgradeId): UpgradeLevel | null {
  return UPGRADES[id][levelOf(levels, id)] ?? null;
}

export function canBuy(levels: Partial<UpgradeLevels>, id: UpgradeId, coins: number): boolean {
  const next = nextLevel(levels, id);
  return next !== null && coins >= next.price;
}

/** Hebt das Upgrade um eine Stufe. Rückgabe: neuer Zustand, oder derselbe, wenn schon voll. */
export function buyLevel(levels: UpgradeLevels, id: UpgradeId): UpgradeLevels {
  if (nextLevel(levels, id) === null) return levels;
  return { ...levels, [id]: levelOf(levels, id) + 1 };
}

/** Wirkung aller gekauften Stufen. Mehrere Upgrades auf denselben Balken multiplizieren sich. */
export function upgradeEffects(levels: Partial<UpgradeLevels>): UpgradeEffects {
  const effects: UpgradeEffects = {
    needModifiers: {},
    lightDecayMultiplier: 1,
    yieldMultiplier: 1,
    pestChanceMultiplier: 1,
    hasDehumidifier: false,
  };
  for (const id of UPGRADE_IDS) {
    const level = levelOf(levels, id);
    if (level === 0) continue;
    const effect = UPGRADES[id][level - 1].effect;
    for (const need of NEED_IDS) {
      const factor = effect.needDecay?.[need];
      if (factor !== undefined) effects.needModifiers[need] = (effects.needModifiers[need] ?? 1) * factor;
    }
    effects.lightDecayMultiplier *= effect.lightDecay ?? 1;
    effects.yieldMultiplier *= effect.yieldMultiplier ?? 1;
    effects.pestChanceMultiplier *= effect.pestChance ?? 1;
    effects.hasDehumidifier ||= effect.dehumidifier ?? false;
  }
  return effects;
}
