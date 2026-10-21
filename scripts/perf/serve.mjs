// Statischer Server für den Web-Export (WEB-6). Bildet GitHub Pages nach: Pfad /pou/, gzip für
// Text und WebAssembly, SPA-Rückfall auf index.html, max-age 600.
// Aufruf: node scripts/perf/serve.mjs [dist] [port]

import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { gzipSync } from 'node:zlib';

const BASE = '/pou';
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.wav': 'audio/wav',
  '.svg': 'image/svg+xml',
};
const COMPRESS = new Set(['.html', '.js', '.css', '.json', '.wasm', '.ttf', '.svg', '.ico']);

export function startServer(root, port = 0) {
  const gzCache = new Map();
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? '/', 'http://x');
    if (!url.pathname.startsWith(BASE)) {
      res.writeHead(302, { location: `${BASE}/` }).end();
      return;
    }
    let rel = decodeURIComponent(url.pathname.slice(BASE.length)) || '/';
    let file = normalize(join(root, rel));
    if (!file.startsWith(normalize(root))) return void res.writeHead(403).end();
    if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
    if (!existsSync(file) && existsSync(`${file}.html`)) file = `${file}.html`;
    let status = 200;
    if (!existsSync(file)) {
      file = join(root, 'index.html');
      status = 404; // wie Pages mit 404.html
    }
    const ext = extname(file);
    const headers = {
      'content-type': TYPES[ext] ?? 'application/octet-stream',
      'cache-control': 'max-age=600',
    };
    if (COMPRESS.has(ext) && /gzip/.test(req.headers['accept-encoding'] ?? '')) {
      let body = gzCache.get(file);
      if (!body) {
        body = gzipSync(readFileSync(file), { level: 6 });
        gzCache.set(file, body);
      }
      res.writeHead(status, { ...headers, 'content-encoding': 'gzip', 'content-length': body.length });
      res.end(body);
      return;
    }
    res.writeHead(status, { ...headers, 'content-length': statSync(file).size });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const root = process.argv[2] ?? 'dist';
  const server = await startServer(root, Number(process.argv[3] ?? 8081));
  console.log(`http://127.0.0.1:${server.address().port}${BASE}/  (${root})`);
}
