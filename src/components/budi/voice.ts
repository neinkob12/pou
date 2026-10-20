// Budi-Stimme (Auftrag P30): kurze Kauderwelsch-Laute (S9) ohne echte Wörter, beim Streicheln
// und später bei Sprüchen. Welche Laute und wie hoch, folgt aus der Laune, die der Store schon
// führt (computeCareView wie im Raum), nicht aus einer eigenen Rechnung.
// Grenzen und Tonhöhen stehen in AUDIO.voice (config.ts).

import { AUDIO } from '../../game/config';
import type { Condition } from '../../game/needs';
import type { SoundId } from '../../lib/assets';
import { playVoice } from '../../lib/audio';
import { clock } from '../../lib/clock';
import { useGameStore } from '../../store/gameStore';
import { selectDebugMultiplier } from '../../store/slices/debug';
import { selectUpgradeEffects } from '../../store/slices/shop';
import { computeCareView } from '../room/care/careLogic';

export type VoiceMood = 'happy' | 'question' | 'grumpy';

export const VOICE_LINES: Record<VoiceMood, readonly SoundId[]> = {
  happy: ['s9_voice_happy_1', 's9_voice_happy_2', 's9_voice_happy_3'],
  question: ['s9_voice_question_1', 's9_voice_question_2'],
  grumpy: ['s9_voice_grumpy_1', 's9_voice_grumpy_2'],
};

/** Zustände, in denen Budi grummelt, egal wie die Laune steht. */
const GRUMPY_CONDITIONS: readonly Condition[] = ['stressed', 'sick'];

/** Laune 0 bis 100 und Zustand zur Stimmung der Laute. Ohne Pflanze: neutral fragend. */
export function voiceMood(mood: number | null, condition: Condition | null): VoiceMood {
  if (condition !== null && GRUMPY_CONDITIONS.includes(condition)) return 'grumpy';
  if (mood === null) return 'question';
  if (mood < AUDIO.voice.grumpyBelowMood) return 'grumpy';
  if (mood >= AUDIO.voice.happyFromMood) return 'happy';
  return 'question';
}

/** Tonhöhe (Abspielrate) aus der Laune, `random` 0 bis 1 für die kleine Abweichung. */
export function voicePitch(mood: number | null, random: number): number {
  const { pitchMin, pitchMax, pitchJitter } = AUDIO.voice;
  const share = Math.min(Math.max((mood ?? 50) / 100, 0), 1);
  const pitch = pitchMin + (pitchMax - pitchMin) * share + pitchJitter * (random * 2 - 1);
  return Math.min(Math.max(pitch, pitchMin), pitchMax);
}

/** Welcher Laut mit welcher Tonhöhe. Im Koma schweigt Budi. */
export function pickVoice(
  mood: number | null,
  condition: Condition | null,
  random: () => number = Math.random,
): { sound: SoundId; rate: number } | null {
  if (condition === 'coma') return null;
  const lines = VOICE_LINES[voiceMood(mood, condition)];
  const sound = lines[Math.min(Math.floor(random() * lines.length), lines.length - 1)];
  return { sound, rate: voicePitch(mood, random()) };
}

/** Budi sagt etwas, passend zur aktuellen Laune aus dem Store. */
export function budiSpeak(): void {
  const state = useGameStore.getState();
  const view = computeCareView(
    state.plant,
    state.needs,
    clock.now(),
    selectDebugMultiplier(state),
    selectUpgradeEffects(state).needModifiers,
  );
  const line = pickVoice(view.snapshot?.mood ?? null, view.condition);
  if (line) playVoice(line.sound, line.rate);
}
