// Skia braucht im Web erst CanvasKit (WebAssembly), siehe skiaWeb.web.ts.
// Auf Android und iOS ist Skia nativ und sofort bereit.

export function useSkiaReady(): boolean {
  return true;
}
