/// <reference types="node" />
// WEB-6: public/index.html lädt CanvasKit und die Schriften vor, mit festen Pfaden samt Metro-Hash.
// Ändert sich ein Paket (Update), ändert sich der Hash, und der Preload ginge ins Leere. Dieser Test
// merkt das und sagt, welcher Pfad neu eingetragen werden muss.

import { createHash } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..', '..');
const html = readFileSync(join(ROOT, 'public', 'index.html'), 'utf8');
const app = JSON.parse(readFileSync(join(ROOT, 'app.json'), 'utf8')) as { expo: { experiments: { baseUrl: string } } };
const base = app.expo.experiments.baseUrl;

const preloads = [...html.matchAll(/<link rel="preload" href="([^"]+)"/g)].map((m) => m[1]);

/** Erwarteter Pfad im Export: Metro hängt den MD5 des Inhalts an den Dateinamen. */
function exportedPath(modulePath: string): string {
  const file = join(ROOT, 'node_modules', modulePath);
  const hash = createHash('md5').update(readFileSync(file)).digest('hex');
  const dot = modulePath.lastIndexOf('.');
  return `${base}/assets/node_modules/${modulePath.slice(0, dot)}.${hash}${modulePath.slice(dot)}`;
}

describe('Preload in public/index.html', () => {
  it('lädt CanvasKit und vier Schriften vor', () => {
    expect(preloads.some((p) => p.includes('canvaskit.'))).toBe(true);
    expect(preloads.filter((p) => p.endsWith('.ttf'))).toHaveLength(4);
  });

  it.each(preloads)('%s passt zum installierten Paket', (href) => {
    const match = href.match(/\/assets\/node_modules\/(.+)\.[0-9a-f]{32}(\.\w+)$/);
    expect(match).not.toBeNull();
    const modulePath = `${match![1]}${match![2]}`;
    expect(existsSync(join(ROOT, 'node_modules', modulePath))).toBe(true);
    expect(href).toBe(exportedPath(modulePath));
  });

  it('liegt unter der baseUrl aus app.json, wie der Service Worker', () => {
    expect(html).toContain(`register('${base}/sw.js', { scope: '${base}/' })`);
  });
});
