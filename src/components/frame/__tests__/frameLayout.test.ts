import { FRAME_FROM_WIDTH, FRAME_MARGIN, FRAME_MAX_HEIGHT, FRAME_WIDTH, frameLayout } from '../frameLayout';

describe('frameLayout', () => {
  it('nutzt am Handy die volle Fläche', () => {
    expect(frameLayout(390, 844)).toEqual({ framed: false, width: 390, height: 844 });
  });

  it('zeigt am Rechner einen zentrierten Rahmen in Handybreite', () => {
    expect(frameLayout(1280, 800)).toEqual({ framed: true, width: FRAME_WIDTH, height: 800 - 2 * FRAME_MARGIN });
  });

  it('begrenzt die Höhe auf hohen Bildschirmen', () => {
    expect(frameLayout(1920, 2000).height).toBe(FRAME_MAX_HEIGHT);
  });

  it('schaltet genau an der Grenze um', () => {
    expect(frameLayout(FRAME_FROM_WIDTH - 1, 800).framed).toBe(false);
    expect(frameLayout(FRAME_FROM_WIDTH, 800).framed).toBe(true);
  });

  it('wird bei winzigen Fenstern nie negativ', () => {
    expect(frameLayout(800, 10).height).toBe(0);
  });
});
