import { installCpuStillCanvas, type CanvasKitLike } from '../stillCanvas';

class FakeOffscreen {
  drawn: unknown[] = [];
  getContext(kind: string) {
    if (kind !== '2d') return null;
    return { putImageData: (data: unknown) => this.drawn.push(data) };
  }
}
class FakeHtmlCanvas {}

function makeCanvasKit() {
  const calls: string[] = [];
  const ck: CanvasKitLike = {
    GetWebGLContext: () => {
      calls.push('gl');
      return 7;
    },
    MakeWebGLContext: (handle) => {
      calls.push(`gr:${handle}`);
      return { gpu: true };
    },
    MakeOnScreenGLSurface: () => {
      calls.push('glSurface');
      return { gpuSurface: true };
    },
    MakeRenderTarget: () => {
      calls.push('renderTarget');
      return { gpuTarget: true };
    },
    MakeSurface: (width, height) => {
      calls.push(`cpu:${width}x${height}`);
      return {
        flush: () => calls.push('flush'),
        getCanvas: () => ({ readPixels: () => new Uint8Array(width * height * 4).fill(9) }),
      };
    },
    deleteContext: (handle) => calls.push(`delete:${handle}`),
    AlphaType: { Unpremul: 'unpremul' },
    ColorType: { RGBA_8888: 'rgba' },
    ColorSpace: { SRGB: 'srgb' },
  };
  return { ck, calls };
}

const options = {
  isStillTarget: (canvas: unknown) => canvas instanceof FakeOffscreen,
  makeImageData: (pixels: Uint8ClampedArray<ArrayBuffer>, width: number, height: number) =>
    ({ pixels, width, height }) as unknown as ImageData,
};

describe('installCpuStillCanvas', () => {
  it('zeichnet stille Leinwände auf einer CPU-Fläche und kopiert beim flush ins 2D-Canvas', () => {
    const { ck, calls } = makeCanvasKit();
    expect(installCpuStillCanvas(ck, options)).toBe(true);

    const target = new FakeOffscreen();
    const handle = ck.GetWebGLContext(target);
    const ctx = ck.MakeWebGLContext(handle);
    const surface = ck.MakeOnScreenGLSurface(ctx, 4, 2, ck.ColorSpace.SRGB) as { flush: () => void };
    surface.flush();

    expect(calls).toEqual(['cpu:4x2', 'flush']);
    expect(target.drawn).toHaveLength(1);
    const image = target.drawn[0] as { pixels: Uint8ClampedArray; width: number; height: number };
    expect(image.width).toBe(4);
    expect(image.height).toBe(2);
    expect(image.pixels).toHaveLength(4 * 2 * 4);

    ck.deleteContext(handle);
    expect(ck.MakeWebGLContext(handle)).toBeNull();
    expect(calls).toEqual(['cpu:4x2', 'flush']);
  });

  it('lässt bewegte Leinwände (echtes canvas-Element) auf WebGL', () => {
    const { ck, calls } = makeCanvasKit();
    installCpuStillCanvas(ck, options);
    const handle = ck.GetWebGLContext(new FakeHtmlCanvas());
    const ctx = ck.MakeWebGLContext(handle);
    ck.MakeOnScreenGLSurface(ctx, 10, 10, ck.ColorSpace.SRGB);
    ck.deleteContext(handle);
    expect(calls).toEqual(['gl', 'gr:7', 'glSurface', 'delete:7']);
  });

  it('gibt Offscreen-Render-Targets eine CPU-Fläche', () => {
    const { ck, calls } = makeCanvasKit();
    installCpuStillCanvas(ck, options);
    const ctx = ck.MakeWebGLContext(ck.GetWebGLContext(new FakeOffscreen()));
    ck.MakeRenderTarget?.(ctx, 3, 3);
    ck.MakeRenderTarget?.({ gpu: true }, 3, 3);
    expect(calls).toEqual(['cpu:3x3', 'renderTarget']);
  });

  it('installiert nur einmal und nicht ohne MakeSurface', () => {
    const { ck } = makeCanvasKit();
    expect(installCpuStillCanvas(ck, options)).toBe(true);
    expect(installCpuStillCanvas(ck, options)).toBe(false);
    const { ck: bare } = makeCanvasKit();
    (bare as { MakeSurface?: unknown }).MakeSurface = undefined;
    expect(installCpuStillCanvas(bare, options)).toBe(false);
  });
});
