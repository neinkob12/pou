// Web (Auftrag PWEB): Skia-Szenen laufen auf CanvasKit. Das WebAssembly-Modul muss geladen sein,
// bevor ein Modul mit Skia-Zeichnungen ausgewertet wird. app/_layout.tsx wartet deshalb darauf.
// Die .wasm-Datei bündelt Metro als Asset (metro.config.js), damit sie unter der baseUrl liegt.

import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { useEffect, useState } from 'react';

import { capPixelRatio } from '../perf/pixelRatio';
import { installCpuStillCanvas, type CanvasKitLike } from '../perf/stillCanvas';

// eslint-disable-next-line @typescript-eslint/no-require-imports -- Metro-Asset, kein JS-Modul
const wasmAsset: unknown = require('canvaskit-wasm/bin/full/canvaskit.wasm');

function wasmUri(): string {
  if (typeof wasmAsset === 'string') return wasmAsset;
  if (wasmAsset && typeof wasmAsset === 'object' && 'uri' in wasmAsset) return String(wasmAsset.uri);
  return `${process.env.EXPO_BASE_URL ?? ''}/canvaskit.wasm`;
}

// WEB-6: Skia-Leinwände höchstens mit Pixeldichte 2 (siehe src/perf/pixelRatio.ts).
if (typeof window !== 'undefined') capPixelRatio(window);

let loaded = false;
const loading = LoadSkiaWeb({ locateFile: () => wasmUri() }).then(() => {
  // WEB-6: stille Leinwände (Budi, Zimmer, Icons) auf der CPU statt je ein WebGL-Kontext.
  const ck = (globalThis as { CanvasKit?: CanvasKitLike }).CanvasKit;
  if (ck && typeof OffscreenCanvas !== 'undefined') {
    installCpuStillCanvas(ck, {
      isStillTarget: (canvas) => canvas instanceof OffscreenCanvas,
      makeImageData: (pixels, width, height) => new ImageData(pixels, width, height),
    });
  }
  loaded = true;
});

export function useSkiaReady(): boolean {
  const [ready, setReady] = useState(loaded);
  useEffect(() => {
    if (ready) return;
    let active = true;
    loading
      .then(() => active && setReady(true))
      .catch((error: unknown) => console.warn('[skia] CanvasKit konnte nicht laden.', error));
    return () => {
      active = false;
    };
  }, [ready]);
  return ready;
}
