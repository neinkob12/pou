import { capPixelRatio, MAX_CANVAS_PIXEL_RATIO } from '../pixelRatio';

describe('capPixelRatio', () => {
  it('deckelt hohe Pixeldichte auf das Maximum', () => {
    const screen = { devicePixelRatio: 3 };
    capPixelRatio(screen);
    expect(screen.devicePixelRatio).toBe(MAX_CANVAS_PIXEL_RATIO);
  });

  it('lässt niedrige und gleiche Dichte in Ruhe', () => {
    const low = { devicePixelRatio: 1.5 };
    const same = { devicePixelRatio: 2 };
    capPixelRatio(low);
    capPixelRatio(same);
    expect(low.devicePixelRatio).toBe(1.5);
    expect(same.devicePixelRatio).toBe(2);
  });

  it('nimmt ein eigenes Maximum', () => {
    const screen = { devicePixelRatio: 2.625 };
    capPixelRatio(screen, 1.5);
    expect(screen.devicePixelRatio).toBe(1.5);
  });

  it('wirft nicht, wenn der Wert sich nicht überschreiben lässt', () => {
    const frozen = Object.freeze({ devicePixelRatio: 3 });
    expect(() => capPixelRatio(frozen)).not.toThrow();
    expect(frozen.devicePixelRatio).toBe(3);
  });
});
