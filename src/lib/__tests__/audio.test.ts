import { createAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { cue, resolveCue, setSoundSetting, soundSetting, SOUND_KEYS, startMusic, stopMusic } from '../audio';
import { storage } from '../storage';

jest.mock('expo-audio', () => {
  const player = () => ({
    volume: 1,
    loop: false,
    play: jest.fn(),
    pause: jest.fn(),
    remove: jest.fn(),
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

describe('lib/audio (P23)', () => {
  beforeEach(() => {
    storage.clearAll();
    stopMusic();
    jest.clearAllMocks();
  });

  it('hat ohne Einstellung Musik, Effekte und Vibration an', () => {
    expect(soundSetting('music')).toBe(true);
    expect(soundSetting('effects')).toBe(true);
    expect(soundSetting('haptics')).toBe(true);
    setSoundSetting('effects', false);
    expect(storage.getBoolean(SOUND_KEYS.effects)).toBe(false);
    expect(soundSetting('effects')).toBe(false);
    expect(soundSetting('music')).toBe(true);
  });

  it('trennt Effekte und Vibration', () => {
    expect(resolveCue('hit', { effects: true, haptics: true })).toEqual({ sound: 's5_smash_hit', haptic: 'light' });
    expect(resolveCue('hit', { effects: false, haptics: true })).toEqual({ sound: null, haptic: 'light' });
    expect(resolveCue('hit', { effects: true, haptics: false })).toEqual({ sound: 's5_smash_hit', haptic: null });
    expect(resolveCue('jump', { effects: true, haptics: true }).haptic).toBeNull();
  });

  it('bleibt still, wenn der Sound fehlt', () => {
    expect(resolveCue('coins', { effects: true, haptics: true }, {})).toEqual({ sound: null, haptic: 'success' });
  });

  it('spielt Effekt und Vibration nur, wenn eingeschaltet', () => {
    cue('ouch');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('warning');
    const player = createPlayer.mock.results[0].value;
    expect(player.play).toHaveBeenCalledTimes(1);

    setSoundSetting('effects', false);
    setSoundSetting('haptics', false);
    cue('ouch');
    expect(player.play).toHaveBeenCalledTimes(1);
    expect(Haptics.notificationAsync).toHaveBeenCalledTimes(1);
  });

  it('schaltet laufende Musik getrennt von den Effekten', () => {
    startMusic('s11_music_minigames');
    const music = createPlayer.mock.results[0].value;
    expect(music.loop).toBe(true);
    expect(music.play).toHaveBeenCalledTimes(1);

    setSoundSetting('music', false);
    expect(music.pause).toHaveBeenCalledTimes(1);
    startMusic('s11_music_minigames');
    expect(music.play).toHaveBeenCalledTimes(1);

    setSoundSetting('music', true);
    expect(music.play).toHaveBeenCalledTimes(2);
    stopMusic();
    expect(music.remove).toHaveBeenCalled();
  });
});
