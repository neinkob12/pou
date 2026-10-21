// Regeln von "Tropfen fangen", ohne React. Die 'worklet'-Funktionen laufen auch im Frame-Callback
// auf dem UI-Thread (Reanimated); in Tests sind sie normale Funktionen.

import { DROPS_GAME, MINIGAME_FUN } from '../../../game/config';

/** `golden`: Bonus-Tropfen, `leaf`: Schutzblatt (Auftrag 45). */
export type DropKind = 'water' | 'fertilizer' | 'salt' | 'golden' | 'leaf';
type DropsFun = typeof MINIGAME_FUN.drops;

export interface Drop {
  id: number;
  kind: DropKind;
  x: number;
  y: number;
}

/** Spielfeld einer Runde. Der Topf steht unten, `potX` ist seine Mitte. */
export interface DropsField {
  drops: Drop[];
  potX: number;
  lives: number;
  /** Gefangene Tropfen je Art (Salz zählt als verlorenes Leben). */
  caughtWater: number;
  caughtFertilizer: number;
  /** Spielzeit (ms), zu der der nächste Tropfen fällt. */
  nextSpawnMs: number;
  nextId: number;
  /** Schutzblatt im Topf: das nächste Salz kostet kein Leben (Auftrag 45). */
  shield?: boolean;
}

/** Was in einem Frame-Schritt passiert ist, damit die Oberfläche reagieren kann. */
export interface DropsStepEvents {
  points: number;
  livesLost: number;
  /** Nur gesetzt, wenn es passiert ist (Auftrag 45): goldene Tropfen, Schutzblatt gefangen, Salz abgehalten. */
  golden?: number;
  shieldGained?: boolean;
  shieldUsed?: boolean;
}

export type DropsConfig = typeof DROPS_GAME;

export function createField(width: number, cfg: DropsConfig = DROPS_GAME): DropsField {
  'worklet';
  return {
    drops: [],
    potX: width / 2,
    lives: cfg.lives,
    caughtWater: 0,
    caughtFertilizer: 0,
    nextSpawnMs: 0,
    nextId: 1,
  };
}

/** Fallgeschwindigkeit in dp pro Sekunde, steigt mit der Spielzeit bis maxFallSpeed. */
export function fallSpeed(elapsedMs: number, cfg: DropsConfig = DROPS_GAME): number {
  'worklet';
  return Math.min(cfg.maxFallSpeed, cfg.startFallSpeed + (elapsedMs / 1000) * cfg.fallSpeedPerSecond);
}

/** Abstand bis zum nächsten Tropfen, sinkt mit der Spielzeit bis minSpawnIntervalMs. */
export function spawnInterval(elapsedMs: number, cfg: DropsConfig = DROPS_GAME): number {
  'worklet';
  return Math.max(
    cfg.minSpawnIntervalMs,
    cfg.startSpawnIntervalMs - (elapsedMs / 1000) * cfg.spawnIntervalDecreasePerSecond,
  );
}

/** Tropfenart aus einer Zufallszahl in [0, 1) nach spawnWeights. */
export function pickKind(rand: number, cfg: DropsConfig = DROPS_GAME): DropKind {
  'worklet';
  const { water, fertilizer } = cfg.spawnWeights;
  if (rand < water) return 'water';
  if (rand < water + fertilizer) return 'fertilizer';
  return 'salt';
}

/** Läuft gerade ein Regenschauer (Auftrag 45)? Kurze Fenster in festem Abstand, nicht am Anfang. */
export function inShower(elapsedMs: number, fun: DropsFun = MINIGAME_FUN.drops): boolean {
  'worklet';
  return elapsedMs >= fun.showerEveryMs && elapsedMs % fun.showerEveryMs < fun.showerMs;
}

/** Anteil Salz unter den normalen Tropfen: steigt mit der Spielzeit (Auftrag 45). */
export function saltShare(
  elapsedMs: number,
  cfg: DropsConfig = DROPS_GAME,
  fun: DropsFun = MINIGAME_FUN.drops,
): number {
  'worklet';
  const t = Math.min(1, Math.max(0, elapsedMs / fun.saltRampMs));
  return cfg.spawnWeights.salt + (fun.saltShareEnd - cfg.spawnWeights.salt) * t;
}

/**
 * Art eines neuen Tropfens mit den Sonder-Tropfen (Auftrag 45). Bei 0 genau wie `pickKind`.
 * Gold und Schutzblatt nehmen den unteren Teil der Zufallszahl, der Rest verteilt sich nach spawnWeights,
 * nur dass der Salz-Anteil mit der Zeit wächst.
 */
export function spawnKind(
  rand: number,
  elapsedMs: number,
  cfg: DropsConfig = DROPS_GAME,
  fun: DropsFun = MINIGAME_FUN.drops,
): DropKind {
  'worklet';
  const gold = elapsedMs >= fun.goldenFromMs ? fun.goldenChance : 0;
  const leaf = elapsedMs >= fun.leafFromMs ? fun.leafChance : 0;
  if (rand < gold) return 'golden';
  if (rand < gold + leaf) return 'leaf';
  const r = (rand - gold - leaf) / (1 - gold - leaf);
  const salt = saltShare(elapsedMs, cfg, fun);
  if (r >= 1 - salt) return 'salt';
  const { water, fertilizer } = cfg.spawnWeights;
  return (r / (1 - salt)) * (water + fertilizer) < water ? 'water' : 'fertilizer';
}

/** Topf folgt dem Finger, bleibt aber ganz im Feld. */
export function clampPot(x: number, width: number, cfg: DropsConfig = DROPS_GAME): number {
  'worklet';
  const half = cfg.potWidth / 2;
  if (width <= cfg.potWidth) return width / 2;
  return Math.min(width - half, Math.max(half, x));
}

/** Höhe der Topf-Öffnung (y), an der Tropfen gefangen werden. */
export function potTop(height: number, cfg: DropsConfig = DROPS_GAME): number {
  'worklet';
  return height - cfg.potBottomMargin - cfg.potHeight;
}

/** Fängt der Topf an Position `potX` einen Tropfen bei `x`? */
export function isOverPot(x: number, potX: number, cfg: DropsConfig = DROPS_GAME): boolean {
  'worklet';
  return Math.abs(x - potX) <= cfg.potWidth / 2 + cfg.dropRadius / 2;
}

/**
 * Ein Frame-Schritt: neue Tropfen, Fallen, Fangen, Verlieren. `randKind` und `randX` sind
 * Zufallszahlen in [0, 1) für einen möglichen neuen Tropfen, damit die Funktion testbar bleibt.
 */
export function stepField(
  field: DropsField,
  dtMs: number,
  elapsedMs: number,
  width: number,
  height: number,
  randKind: number,
  randX: number,
  cfg: DropsConfig = DROPS_GAME,
  fun: DropsFun = MINIGAME_FUN.drops,
): { field: DropsField; events: DropsStepEvents } {
  'worklet';
  let { nextSpawnMs, nextId, lives, caughtWater, caughtFertilizer } = field;
  let shield = field.shield === true;
  const drops: Drop[] = [];
  let points = 0;
  let livesLost = 0;
  let golden = 0;
  let shieldGained = false;
  let shieldUsed = false;

  const dy = (fallSpeed(elapsedMs, cfg) * dtMs) / 1000;
  const catchY = potTop(height, cfg);
  for (const d of field.drops) {
    const y = d.y + dy;
    const crossed = d.y < catchY && y >= catchY;
    if (crossed && isOverPot(d.x, field.potX, cfg)) {
      if (d.kind === 'salt') {
        if (shield) {
          shield = false;
          shieldUsed = true;
        } else {
          livesLost += 1;
        }
      } else if (d.kind === 'leaf') {
        shield = true;
        shieldGained = true;
      } else if (d.kind === 'golden') {
        points += fun.goldenPoints;
        golden += 1;
        caughtWater += 1;
      } else {
        points += cfg.pointsPerDrop;
        if (d.kind === 'water') caughtWater += 1;
        else caughtFertilizer += 1;
      }
      continue;
    }
    if (y - cfg.dropRadius > height) continue; // daneben, unten raus
    drops.push({ ...d, y });
  }

  if (elapsedMs >= nextSpawnMs) {
    const r = cfg.dropRadius;
    const x = r + randX * Math.max(0, width - 2 * r);
    drops.push({ id: nextId, kind: spawnKind(randKind, elapsedMs, cfg, fun), x, y: -r });
    nextId += 1;
    const gap = spawnInterval(elapsedMs, cfg);
    nextSpawnMs = elapsedMs + (inShower(elapsedMs, fun) ? gap * fun.showerSpawnFactor : gap);
  }

  lives = Math.max(0, lives - livesLost);
  return {
    field: { drops, potX: field.potX, lives, caughtWater, caughtFertilizer, nextSpawnMs, nextId, shield },
    events: {
      points,
      livesLost,
      golden: golden > 0 ? golden : undefined,
      shieldGained: shieldGained || undefined,
      shieldUsed: shieldUsed || undefined,
    },
  };
}

/** Extra-Leben: ein Leben zurück, Salz vom Feld, damit es nicht sofort wieder vorbei ist. */
export function grantExtraLife(field: DropsField): DropsField {
  'worklet';
  return { ...field, lives: field.lives + 1, drops: field.drops.filter((d) => d.kind !== 'salt') };
}

/** Balken-Zuwachs aus gefangenen Tropfen, je Balken gedeckelt auf maxBarGainPerRound. */
export function barGain(caught: number, cfg: DropsConfig = DROPS_GAME): number {
  'worklet';
  return Math.min(cfg.maxBarGainPerRound, caught * cfg.barGainPerDrop);
}

export interface DropsReward {
  water: number;
  nutrients: number;
}

/**
 * Was am Rundenende auf die Balken kommt. Wasser höchstens bis zur Überwässerungs-Grenze
 * der Phase, damit ein Minispiel Budi nie stresst; Nährstoffe höchstens bis voll.
 */
export function roundReward(
  caughtWater: number,
  caughtFertilizer: number,
  current: { water: number; nutrients: number },
  limits: { water: number; nutrients: number },
  cfg: DropsConfig = DROPS_GAME,
): DropsReward {
  // Abrunden, damit Wasserstand plus Zuwachs die Grenze auch mit Kommawerten nie überschreitet.
  const room = (limit: number, value: number) => Math.max(0, Math.floor(limit - value));
  return {
    water: Math.min(barGain(caughtWater, cfg), room(limits.water, current.water)),
    nutrients: Math.min(barGain(caughtFertilizer, cfg), room(limits.nutrients, current.nutrients)),
  };
}
