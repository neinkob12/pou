import { notifications as texts } from '../../content/strings';
import { deliveredOnly, notificationContent, notificationsEnabled, NOTIFICATION_KEYS } from '../notifications';
import { storage } from '../storage';

const HOUR = 60 * 60 * 1000;

describe('lib/notifications', () => {
  beforeEach(() => storage.clearAll());

  it('ist ohne Einstellung eingeschaltet und lässt sich abschalten', () => {
    expect(notificationsEnabled()).toBe(true);
    storage.set(NOTIFICATION_KEYS.enabled, false);
    expect(notificationsEnabled()).toBe(false);
  });

  it('wählt Texte in Budis Stimme je Art', () => {
    const thirsty = notificationContent({ kind: 'thirsty', atMs: 0 });
    expect(texts.thirsty).toContainEqual(thirsty);
    expect(notificationContent({ kind: 'thirsty', atMs: HOUR })).not.toEqual(thirsty);
    expect(notificationContent({ kind: 'phaseChanged', atMs: 0, phase: 'flowering' }).title).toContain('Blüte');
  });

  it('behält nur zugestellte Einträge der letzten zwei Tage', () => {
    const now = 100 * HOUR;
    expect(deliveredOnly([now - 50 * HOUR, now - 2 * HOUR, now, now + HOUR], now)).toEqual([now - 2 * HOUR, now]);
  });
});
