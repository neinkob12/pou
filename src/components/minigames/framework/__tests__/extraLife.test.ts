import { canOfferExtraLife, requestExtraLife, setExtraLifeProvider } from '../extraLife';

afterEach(() => setExtraLifeProvider(null));

describe('Extra-Leben (Hook-Punkt für P29)', () => {
  it('ohne Anbieter kein Angebot und immer "nein"', async () => {
    expect(canOfferExtraLife(true, false)).toBe(false);
    await expect(requestExtraLife('drops')).resolves.toBe(false);
  });

  it('mit Anbieter: höchstens einmal pro Runde und nur, wenn das Spiel es kann', () => {
    setExtraLifeProvider(async () => true);
    expect(canOfferExtraLife(true, false)).toBe(true);
    expect(canOfferExtraLife(true, true)).toBe(false);
    expect(canOfferExtraLife(false, false)).toBe(false);
  });

  it('gibt die Antwort des Anbieters weiter, Fehler zählen als "nein"', async () => {
    const provider = jest.fn(async () => true);
    setExtraLifeProvider(provider);
    await expect(requestExtraLife('drops')).resolves.toBe(true);
    expect(provider).toHaveBeenCalledWith('drops');

    setExtraLifeProvider(async () => {
      throw new Error('Werbung nicht geladen');
    });
    await expect(requestExtraLife('drops')).resolves.toBe(false);
  });

  it('Abmelden entfernt nur den eigenen Anbieter', () => {
    const offA = setExtraLifeProvider(async () => true);
    setExtraLifeProvider(async () => false);
    offA();
    expect(canOfferExtraLife(true, false)).toBe(true);
  });
});
