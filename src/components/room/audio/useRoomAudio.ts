// Ton im Hauptraum (Auftrag P30): Raum-Musik S10 leise in Schleife, solange der Raum im Fokus ist,
// Fanfare bei Phasenwechsel, Jubel bei der Ernte. Ein Minigame ersetzt die Musik und stoppt sie
// beim Verlassen (useMinigameAudio, P23); beim nächsten Fokus startet der Raum sie wieder.

import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';

import { AUDIO } from '../../../game/config';
import { gameEvents } from '../../../game/events';
import { cue, phaseCueDue, startMusic } from '../../../lib/audio';
import { clock } from '../../../lib/clock';

function startRoomMusic() {
  startMusic('s10_music_room', AUDIO.roomMusicVolume);
}

export function useRoomAudio() {
  useFocusEffect(
    useCallback(() => {
      startRoomMusic();
      // Zurück aus dem Hintergrund: weiterspielen (im Hintergrund pausiert das System die Musik).
      const sub = AppState.addEventListener('change', (state) => {
        if (state === 'active') startRoomMusic();
      });
      return () => sub.remove();
    }, []),
  );

  useEffect(() => {
    let lastPhaseCueMs: number | null = null;
    const offPhase = gameEvents.on('phaseChanged', () => {
      const nowMs = clock.now();
      if (!phaseCueDue(lastPhaseCueMs, nowMs)) return;
      lastPhaseCueMs = nowMs;
      cue('phase');
    });
    const offHarvest = gameEvents.on('harvested', () => cue('harvest'));
    return () => {
      offPhase();
      offHarvest();
    };
  }, []);
}
