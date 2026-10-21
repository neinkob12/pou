// Web-Leistung (WEB-6): stille Skia-Leinwände ohne eigenen WebGL-Kontext.
//
// Skia-Web zeichnet eine Leinwand mit `__destroyWebGLContextAfterRender` (ArtCanvas `still`: Budi,
// Zimmer, Icons) bei jedem Neuzeichnen so: neue OffscreenCanvas, neuer WebGL-Kontext, neuer
// GrContext, Shader übersetzen, zeichnen, ins 2D-Canvas kopieren, alles wieder wegwerfen. Gemessen
// im Zimmer: 38 solche Kontexte beim Start, jeder kostet auf einem schwachen Handy 50 bis 300 ms.
//
// Hier bekommt dieser Weg statt WebGL eine CPU-Fläche von CanvasKit (MakeSurface). Skia rechnet die
// Pixel dann in WebAssembly, ohne Kontext und ohne Shader, und `flush` schreibt sie ins 2D-Canvas der
// OffscreenCanvas, das Skia danach wie bisher auf die Seite kopiert. Bewegte Leinwände (Minigames,
// echte <canvas>-Elemente) bleiben auf WebGL. Geht unterwegs etwas schief, fällt jeder Schritt auf
// den Originalweg zurück.

/** Was von CanvasKit gebraucht wird (Teilmenge, damit der Test mit Attrappen auskommt). */
export interface CanvasKitLike {
  GetWebGLContext: (canvas: unknown, attrs?: unknown) => number;
  MakeWebGLContext: (handle: number) => unknown;
  MakeOnScreenGLSurface: (ctx: unknown, width: number, height: number, colorSpace: unknown) => unknown;
  MakeSurface: (width: number, height: number) => SurfaceLike | null;
  MakeRenderTarget?: (ctx: unknown, width: number, height: number) => unknown;
  deleteContext: (handle: number) => void;
  AlphaType: { Unpremul: unknown };
  ColorType: { RGBA_8888: unknown };
  ColorSpace: { SRGB: unknown };
}

interface SurfaceLike {
  flush: () => void;
  getCanvas: () => { readPixels: (x: number, y: number, info: object) => Uint8Array | null };
}

interface Context2DLike {
  putImageData: (data: ImageData, x: number, y: number) => void;
}

/** Kennzeichen für die CPU-Variante. Echte Handles von CanvasKit sind kleine positive Zahlen. */
const FAKE_HANDLE_BASE = -1_000_000;

interface CpuContext {
  cpu: true;
  ctx2d: Context2DLike;
  releaseResourcesAndAbandonContext: () => void;
  delete: () => void;
}

function isCpuContext(value: unknown): value is CpuContext {
  return typeof value === 'object' && value !== null && (value as { cpu?: unknown }).cpu === true;
}

export interface InstallOptions {
  /** Nur Ziele dieser Klasse laufen über die CPU (im Browser: OffscreenCanvas). */
  isStillTarget: (canvas: unknown) => boolean;
  makeImageData: (pixels: Uint8ClampedArray<ArrayBuffer>, width: number, height: number) => ImageData;
}

/** Biegt den Weg der stillen Leinwände auf CPU-Flächen um. Gibt false zurück, wenn es nicht geht. */
export function installCpuStillCanvas(ck: CanvasKitLike, options: InstallOptions): boolean {
  if (typeof ck.MakeSurface !== 'function' || (ck as { __cpuStill?: boolean }).__cpuStill) return false;
  const original = {
    GetWebGLContext: ck.GetWebGLContext.bind(ck),
    MakeWebGLContext: ck.MakeWebGLContext.bind(ck),
    MakeOnScreenGLSurface: ck.MakeOnScreenGLSurface.bind(ck),
    deleteContext: ck.deleteContext.bind(ck),
    MakeRenderTarget: ck.MakeRenderTarget?.bind(ck),
  };
  const contexts = new Map<number, CpuContext>();
  let next = FAKE_HANDLE_BASE;

  ck.GetWebGLContext = function getWebGLContext(canvas, attrs) {
    if (options.isStillTarget(canvas)) {
      const ctx2d = (canvas as { getContext: (kind: string) => Context2DLike | null }).getContext('2d');
      if (ctx2d) {
        const handle = next--;
        contexts.set(handle, {
          cpu: true,
          ctx2d,
          releaseResourcesAndAbandonContext: () => undefined,
          delete: () => undefined,
        });
        return handle;
      }
    }
    return original.GetWebGLContext(canvas, attrs);
  };

  ck.MakeWebGLContext = function makeWebGLContext(handle) {
    if (handle <= FAKE_HANDLE_BASE) return contexts.get(handle) ?? null;
    return original.MakeWebGLContext(handle);
  };

  ck.deleteContext = function deleteContext(handle) {
    if (handle <= FAKE_HANDLE_BASE) {
      contexts.delete(handle);
      return;
    }
    original.deleteContext(handle);
  };

  ck.MakeOnScreenGLSurface = function makeOnScreenGLSurface(ctx, width, height, colorSpace) {
    if (!isCpuContext(ctx)) return original.MakeOnScreenGLSurface(ctx, width, height, colorSpace);
    const surface = ck.MakeSurface(width, height);
    if (!surface) return null;
    const flush = surface.flush.bind(surface);
    surface.flush = () => {
      flush();
      const pixels = surface.getCanvas().readPixels(0, 0, {
        width,
        height,
        colorType: ck.ColorType.RGBA_8888,
        alphaType: ck.AlphaType.Unpremul,
        colorSpace: ck.ColorSpace.SRGB,
      });
      if (!pixels) return;
      // readPixels liefert eine Kopie mit eigenem (nicht geteiltem) ArrayBuffer.
      const clamped = new Uint8ClampedArray(pixels.buffer as ArrayBuffer, pixels.byteOffset, pixels.byteLength);
      ctx.ctx2d.putImageData(options.makeImageData(clamped, width, height), 0, 0);
    };
    return surface;
  };

  // Skia.Surface.MakeOffscreen nimmt auch eine OffscreenCanvas: dort reicht eine CPU-Fläche ohne Kopie.
  if (original.MakeRenderTarget) {
    const makeRenderTarget = original.MakeRenderTarget;
    ck.MakeRenderTarget = function cpuRenderTarget(ctx, width, height) {
      return isCpuContext(ctx) ? ck.MakeSurface(width, height) : makeRenderTarget(ctx, width, height);
    };
  }

  (ck as { __cpuStill?: boolean }).__cpuStill = true;
  return true;
}
