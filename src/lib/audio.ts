// Sounds, Musik und Haptik (Auftrag P23, P30 erweitert um Raum, Pflege und Budi-Stimme).
// Spiele rufen nur `cue(...)` und `useMinigameAudio(...)`; welche Datei und welche Vibration dazu
// gehört, steht in CUES. Musik, Effekte und Vibration sind getrennt schaltbar (Einstellungen,
// SoundSection) und werden als Geräte-Einstellung in MMKV gespeichert, nicht im Spielstand.
// Fehlt ein Sound in assets.ts, bleibt der Cue still (Platzhalter), die Vibration kommt trotzdem.

import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';

import { AUDIO } from '../game/config';
import type { CareActionId } from '../game/events';
import { sounds, type SoundId } from './assets';
import { safeSet, storage } from './storage';

export const SOUND_KEYS = {
  music: 'sound.music',
  effects: 'sound.effects',
  haptics: 'sound.haptics',
} as const;

export type SoundSetting = keyof typeof SOUND_KEYS;

/** Lautstärke 0 bis 1. Musik leiser, damit Effekte durchkommen. */
export const VOLUME = { music: 0.35, effects: 0.9 } as const;

export type HapticKind = 'selection' | 'light' | 'medium' | 'success' | 'warning' | 'error';

/** Ereignisse in den Spielen. Neue Ereignisse hier ergänzen, nicht in den Spielen Dateien wählen. */
export const CUES = {
  /** Schädling getroffen (Smash). */
  hit: { sound: 's5_smash_hit', haptic: 'light' },
  /** Tropfen im Topf (Tropfen-Fang). */
  catch: { sound: 's3_tap', haptic: 'selection' },
  /** Budi springt von einem Blatt ab (Jump). Ohne Vibration, das wäre bei jedem Sprung zu viel. */
  jump: { sound: 's6_jump', haptic: null },
  /** Lichtpunkt eingesammelt (Jump). */
  collect: { sound: 's4_coins', haptic: 'selection' },
  /** Fehler: Marienkäfer getroffen, Salz gefangen. */
  ouch: { sound: 's12_ouch', haptic: 'warning' },
  /** Runde verloren (Budi gefallen, letztes Leben weg). */
  fail: { sound: 's12_ouch', haptic: 'error' },
  /** Rundenende mit Münzen. */
  coins: { sound: 's4_coins', haptic: 'success' },
  // Raum (P30). Pflege-Cues ohne Vibration: die kommt schon aus room/care/haptics.ts (P10).
  /** Gegossen. */
  water: { sound: 's1_water', haptic: null },
  /** Gedüngt (Wachstum oder Blüte). */
  feed: { sound: 's2_feed', haptic: null },
  /** Pflege hat nicht gewirkt oder Budi gestresst (zu viel Wasser, falscher Dünger, nachts geweckt). */
  careFail: { sound: 's12_ouch', haptic: null },
  /** Werkzeug aus dem Fach genommen. */
  pickup: { sound: 's3_tap', haptic: null },
  /** Knopf in einem Minigame-Overlay. */
  tap: { sound: 's3_tap', haptic: 'selection' },
  /** Neue Wachstumsphase. */
  phase: { sound: 's7_phase_change', haptic: 'success' },
  /** Geerntet. */
  harvest: { sound: 's8_harvest', haptic: 'success' },
} as const satisfies Record<string, { sound: SoundId | null; haptic: HapticKind | null }>;

export type CueId = keyof typeof CUES;

/**
 * Welcher Cue zu einer Pflege gehört. Streicheln hat keinen: dann spricht Budi (budi/voice.ts).
 * Rein, damit testbar.
 */
export function careCue(type: CareActionId, feedback: 'success' | 'warning' | 'error'): CueId | null {
  if (feedback !== 'success') return 'careFail';
  if (type === 'water') return 'water';
  if (type === 'pet') return null;
  return 'feed';
}

/** Sound zur Pflege (Aufruf in room/care/CareStage.tsx). */
export function playCareCue(type: CareActionId, feedback: 'success' | 'warning' | 'error') {
  const id = careCue(type, feedback);
  if (id) cue(id);
}

/** Fanfare jetzt? Nicht, wenn die letzte kürzer als AUDIO.phaseCueGapMs her ist (mehrere Wechsel auf einmal). */
export function phaseCueDue(lastMs: number | null, nowMs: number): boolean {
  return lastMs === null || nowMs - lastMs >= AUDIO.phaseCueGapMs;
}

/** Ohne Eintrag ist alles an. */
export function soundSetting(key: SoundSetting): boolean {
  return storage.getBoolean(SOUND_KEYS[key]) ?? true;
}

/** Was ein Cue bei den aktuellen Einstellungen auslöst. Rein, damit testbar. */
export function resolveCue(
  id: CueId,
  settings: { effects: boolean; haptics: boolean },
  available: Partial<Record<SoundId, unknown>> = sounds,
): { sound: SoundId | null; haptic: HapticKind | null } {
  const { sound, haptic } = CUES[id];
  return {
    sound: settings.effects && sound !== null && available[sound] !== undefined ? sound : null,
    haptic: settings.haptics ? haptic : null,
  };
}

let modeSet = false;
const players: Partial<Record<SoundId, AudioPlayer>> = {};
let music: { id: SoundId; player: AudioPlayer } | null = null;

/** Stummschalter des Handys respektieren, andere Apps (Podcast, Musik) weiterlaufen lassen. */
function ensureAudioMode() {
  if (modeSet) return;
  modeSet = true;
  setAudioModeAsync({
    playsInSilentMode: false,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
    allowsRecording: false,
  }).catch(() => undefined);
}

function playerFor(id: SoundId): AudioPlayer | null {
  const source = sounds[id];
  if (source === undefined) return null;
  ensureAudioMode();
  const existing = players[id];
  if (existing) return existing;
  try {
    const player = createAudioPlayer(source);
    player.volume = VOLUME.effects;
    players[id] = player;
    return player;
  } catch {
    // Kein Audio (z. B. Simulator ohne Ausgabe): still weiter, das Spiel darf nie daran hängen.
    return null;
  }
}

function vibrate(kind: HapticKind) {
  const run = {
    selection: () => Haptics.selectionAsync(),
    light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
    warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  }[kind];
  run().catch(() => undefined);
}

/** Spielt Sound und Vibration zu einem Ereignis, je nach Einstellungen. */
export function cue(id: CueId) {
  const { sound, haptic } = resolveCue(id, { effects: soundSetting('effects'), haptics: soundSetting('haptics') });
  if (haptic) vibrate(haptic);
  if (!sound) return;
  const player = playerFor(sound);
  if (!player) return;
  player.seekTo(0).catch(() => undefined);
  player.play();
}

/**
 * Ein Laut von Budi (S9) mit eigener Tonhöhe. Zählt als Effekt (Schalter "Effekte").
 * `rate` 1 = Original; ohne Tonhöhen-Korrektur klingt schneller auch höher.
 */
export function playVoice(id: SoundId, rate: number) {
  if (!soundSetting('effects')) return;
  const player = playerFor(id);
  if (!player) return;
  player.shouldCorrectPitch = false;
  player.setPlaybackRate(rate);
  player.seekTo(0).catch(() => undefined);
  player.play();
}

/** Startet eine Musik in Schleife (ersetzt die laufende). Spielt erst, wenn Musik an ist. */
export function startMusic(id: SoundId, volume: number = VOLUME.music) {
  if (music?.id !== id) {
    stopMusic();
    const source = sounds[id];
    if (source === undefined) return;
    ensureAudioMode();
    try {
      const player = createAudioPlayer(source);
      player.loop = true;
      player.volume = volume;
      music = { id, player };
    } catch {
      return;
    }
  }
  if (soundSetting('music')) music?.player.play();
}

export function pauseMusic() {
  music?.player.pause();
}

export function stopMusic() {
  if (!music) return;
  music.player.pause();
  music.player.remove();
  music = null;
}

/** Schalter aus den Einstellungen. Musik reagiert sofort. */
export function setSoundSetting(key: SoundSetting, enabled: boolean) {
  safeSet(SOUND_KEYS[key], enabled);
  if (key !== 'music' || !music) return;
  if (enabled) music.player.play();
  else music.player.pause();
}

/**
 * Ton für eine Minigame-Runde: Musik (S11) läuft in Countdown und Spiel, pausiert in der Pause
 * und endet mit der Runde. Gibt es am Ende Münzen, klimpert es einmal.
 */
export function useMinigameAudio(phase: string, roundCoins: number | null) {
  const running = phase === 'countdown' || phase === 'playing';
  useEffect(() => {
    if (running) startMusic('s11_music_minigames');
    else pauseMusic();
  }, [running]);
  useEffect(() => {
    if (roundCoins !== null && roundCoins > 0) cue('coins');
  }, [roundCoins]);
  useEffect(() => stopMusic, []);
}
