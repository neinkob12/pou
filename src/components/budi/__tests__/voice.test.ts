import { AUDIO } from '../../../game/config';
import { pickVoice, VOICE_LINES, voiceMood, voicePitch } from '../voice';

jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-haptics', () => ({
  ImpactFeedbackStyle: {},
  NotificationFeedbackType: {},
}));

const { pitchMin, pitchMax, happyFromMood, grumpyBelowMood } = AUDIO.voice;

describe('budi/voice (P30)', () => {
  it('wählt die Stimmung aus Laune und Zustand', () => {
    expect(voiceMood(happyFromMood, 'ok')).toBe('happy');
    expect(voiceMood(happyFromMood - 1, 'ok')).toBe('question');
    expect(voiceMood(grumpyBelowMood, 'ok')).toBe('question');
    expect(voiceMood(grumpyBelowMood - 1, 'ok')).toBe('grumpy');
    expect(voiceMood(100, 'stressed')).toBe('grumpy');
    expect(voiceMood(100, 'sick')).toBe('grumpy');
    expect(voiceMood(null, null)).toBe('question');
  });

  it('klingt bei guter Laune höher als bei schlechter', () => {
    expect(voicePitch(0, 0.5)).toBeCloseTo(pitchMin);
    expect(voicePitch(100, 0.5)).toBeCloseTo(pitchMax);
    expect(voicePitch(80, 0.5)).toBeGreaterThan(voicePitch(20, 0.5));
    expect(voicePitch(null, 0.5)).toBeCloseTo((pitchMin + pitchMax) / 2);
  });

  it('bleibt mit Zufall innerhalb der Grenzen', () => {
    expect(voicePitch(0, 0)).toBe(pitchMin);
    expect(voicePitch(100, 1)).toBe(pitchMax);
    expect(voicePitch(50, 1)).toBeGreaterThan(voicePitch(50, 0));
  });

  it('nimmt einen Laut der passenden Stimmung und schweigt im Koma', () => {
    const line = pickVoice(90, 'ok', () => 0.99);
    expect(line).not.toBeNull();
    expect(VOICE_LINES.happy).toContain(line?.sound);
    expect(pickVoice(10, 'ok', () => 0)?.sound).toBe(VOICE_LINES.grumpy[0]);
    expect(pickVoice(90, 'coma')).toBeNull();
  });
});
