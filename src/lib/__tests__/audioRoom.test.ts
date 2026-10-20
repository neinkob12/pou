import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { AUDIO } from '../../game/config';
import { careCue, phaseCueDue, playCareCue, playVoice, resolveCue, setSoundSetting, startMusic, stopMusic } from '../audio';
import { storage } from '../storage';

jest.mock('expo-audio', () => {
  const player = () => ({
    volume: 1,
    loop: false,
    shouldCorrectPitch: true,
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
    setPlaybackRate: jest.fn(),
    seekTo: jest.fn(() => Promise.resolve()),
  });
  return {
    createAudioPlayer: jest.fn(player),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
  };
});

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
  impactAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

const createPlayer = createAudioPlayer as jest.Mock;

describe('lib/audio, Raum (P30)', () => {
  beforeEach(() => {
    storage.clearAll();
    stopMusic();
    jest.clearAllMocks();
  });

  it('ordnet Pflege-Aktionen ihren Sounds zu', () => {
    expect(careCue('water', 'success')).toBe('water');
    expect(careCue('fertilizeGrow', 'success')).toBe('feed');
    expect(careCue('fertilizeBloom', 'success')).toBe('feed');
    expect(careCue('pet', 'success')).toBeNull();
    expect(careCue('water', 'warning')).toBe('careFail');
    expect(careCue('pet', 'error')).toBe('careFail');
  });

  it('vibriert bei Pflege nicht doppelt (Haptik kommt aus care/haptics.ts)', () => {
    for (const id of ['water', 'feed', 'careFail', 'pickup'] as const) {
      expect(resolveCue(id, { effects: true, haptics: true }).haptic).toBeNull();
    }
    playCareCue('water', 'success');
    expect(Haptics.notificationAsync).not.toHaveBeenCalled();
    expect(createPlayer.mock.results[0].value.play).toHaveBeenCalledTimes(1);
  });

  it('spielt die Fanfare bei mehreren Wechseln auf einmal nur einmal', () => {
    expect(phaseCueDue(null, 1000)).toBe(true);
    expect(phaseCueDue(1000, 1000)).toBe(false);
    expect(phaseCueDue(1000, 1000 + AUDIO.phaseCueGapMs - 1)).toBe(false);
    expect(phaseCueDue(1000, 1000 + AUDIO.phaseCueGapMs)).toBe(true);
  });

  it('startet die Raum-Musik leise', () => {
    startMusic('s10_music_room', AUDIO.roomMusicVolume);
    const music = createPlayer.mock.results[0].value;
    expect(music.volume).toBe(AUDIO.roomMusicVolume);
    expect(music.loop).toBe(true);
    expect(music.play).toHaveBeenCalledTimes(1);
  });

  it('spielt die Stimme mit Tonhöhe, aber nicht bei ausgeschalteten Effekten', () => {
    playVoice('s9_voice_happy_1', 1.2);
    const player = createPlayer.mock.results[0].value;
    expect(player.shouldCorrectPitch).toBe(false);
    expect(player.setPlaybackRate).toHaveBeenCalledWith(1.2);
    expect(player.play).toHaveBeenCalledTimes(1);

    setSoundSetting('effects', false);
    playVoice('s9_voice_happy_1', 1.2);
    expect(player.play).toHaveBeenCalledTimes(1);
  });
});
