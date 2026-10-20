// Typisierter Event-Bus ohne React. Spätere Aufträge hängen sich hier an (on) oder melden
// etwas (emit), ohne fremde Dateien zu ändern.
// Büro-Regel: Ereignisse nur ergänzen, nie umbenennen. Fehlt eins, als neuen Eintrag in
// GameEvents hinzufügen.

import type { PhaseId, StrainId } from './config';

/** Pflege-Aktionen. P04 ergänzt hier weitere, falls nötig. */
export type CareActionId = 'water' | 'fertilize' | 'pet';

export interface GameEvents {
  phaseChanged: { from: PhaseId; to: PhaseId; atMs: number };
  careAction: { action: CareActionId; atMs: number };
  harvested: { strainId: StrainId; yieldUnits: number; stars: number; atMs: number };
  minigameFinished: { gameId: string; score: number; coins: number; atMs: number };
  purchaseCompleted: { productId: string; atMs: number };
}

export type GameEventName = keyof GameEvents;
export type GameEventListener<K extends GameEventName> = (payload: GameEvents[K]) => void;

export interface EventBus<E> {
  /** Meldet einen Listener an. Rückgabe: Funktion zum Abmelden. */
  on<K extends keyof E>(name: K, listener: (payload: E[K]) => void): () => void;
  off<K extends keyof E>(name: K, listener: (payload: E[K]) => void): void;
  emit<K extends keyof E>(name: K, payload: E[K]): void;
  /** Entfernt alle Listener (für Tests). */
  clear(): void;
}

export function createEventBus<E>(): EventBus<E> {
  const listeners = new Map<keyof E, Set<(payload: never) => void>>();

  const off: EventBus<E>['off'] = (name, listener) => {
    listeners.get(name)?.delete(listener as (payload: never) => void);
  };

  return {
    on(name, listener) {
      let set = listeners.get(name);
      if (!set) {
        set = new Set();
        listeners.set(name, set);
      }
      set.add(listener as (payload: never) => void);
      return () => off(name, listener);
    },
    off,
    emit(name, payload) {
      // Kopie, damit Listener sich beim Aufruf selbst abmelden dürfen.
      const set = listeners.get(name);
      if (!set) return;
      for (const listener of [...set]) {
        (listener as (p: typeof payload) => void)(payload);
      }
    },
    clear() {
      listeners.clear();
    },
  };
}

/** Der eine Bus des Spiels. */
export const gameEvents = createEventBus<GameEvents>();
