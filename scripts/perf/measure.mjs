// Leistung der Web-Version messen (WEB-6). Reproduzierbar, gleiche Werte wie in docs/progress/web6.md.
//
//   npx expo export --platform web
//   node scripts/perf/measure.mjs            # alles
//   node scripts/perf/measure.mjs --load     # nur Ladezeit
//   node scripts/perf/measure.mjs --fps      # nur fps
//   Optionen: --dist <ordner> (Standard dist), --runs <n> (Standard 3), --dpr 1,3, --json <datei>
//
// Braucht Playwright mit Chromium (in der Cloud-Umgebung global installiert, sonst
// `npm i -g playwright`). Der Export wird lokal wie auf GitHub Pages ausgeliefert (serve.mjs).

import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';

import { startServer } from './serve.mjs';

function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    return createRequire(`${globalRoot}/`)('playwright');
  }
}

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const option = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const DIST = option('dist', 'dist');
const RUNS = Number(option('runs', '3'));
const JSON_OUT = option('json', null);
const doLoad = flag('load') || !flag('fps');
const doFps = flag('fps') || !flag('load');

/** Mobiles 4G wie in den Chrome-DevTools ("Fast 4G"): 9 Mbit/s runter, 1,5 hoch, 150 ms RTT. */
const NET_4G = { offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 };
const CPU_SLOW = 4;
const PHONE = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const FPS_SECONDS = 8;
/**
 * Pixeldichten für die fps-Messung. Der Container hat keine Grafikkarte (SwiftShader rechnet WebGL auf
 * der CPU), deshalb hängen die Minigame-fps hier stark an der Pixelzahl. Dichte 1 zeigt die reine
 * Rechenlast (JavaScript, Skia), Dichte 3 ein typisches Handy, bei dem jedes Pixel Software-Arbeit ist.
 */
const FPS_DPRS = option('dpr', '1,3').split(',').map(Number);

const { chromium } = loadPlaywright();
const server = await startServer(DIST);
const BASE = `http://127.0.0.1:${server.address().port}/pou`;
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

/** Spielstand eines wiederkehrenden Spielers: Altersfrage bestätigt, Samen gepflanzt, Pflanze im Wachstum. */
async function makeSave() {
  const context = await browser.newContext(PHONE);
  const page = await context.newPage();
  await page.goto(`${BASE}/`);
  await page.getByText('Ja, ich bin 18').click({ timeout: 60000 });
  await page.getByText('Einpflanzen').first().click({ timeout: 30000 });
  await page.getByText('Überspringen').first().click({ timeout: 30000 });
  await page.goto(`${BASE}/debug`);
  for (let i = 0; i < 3; i++) {
    await page.getByText('+7 Tage').first().click({ timeout: 30000 });
    await page.waitForTimeout(200);
  }
  // Im Zimmer alles wegklicken, was nach dem Vorspulen aufgeht (Wissenskarten, Feiern), damit die
  // Messung Budi sieht und nicht ein Fenster.
  await page.goto(`${BASE}/`);
  await page.waitForFunction(() => document.querySelectorAll('canvas').length > 0, null, { timeout: 60000 });
  for (let i = 0; i < 8; i++) {
    await page.waitForTimeout(1500);
    const close = page.getByText(/^(Schließen|Weiter|Super|Toll|Ok|OK)!?$/).first();
    if (!(await close.isVisible().catch(() => false))) break;
    await close.click();
  }
  if (process.env.PERF_SHOT) await page.screenshot({ path: process.env.PERF_SHOT });
  const state = await context.storageState();
  await context.close();
  return state;
}

async function cdpFor(page, { net, cpu }) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.setCacheDisabled', { cacheDisabled: false });
  if (net) await cdp.send('Network.emulateNetworkConditions', net);
  if (cpu) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  return cdp;
}

/**
 * Ein Start mit Spielstand. Kalt: neuer Kontext, leerer HTTP-Cache. Wiederbesuch: erst ein Besuch
 * ohne Drosselung, dann neu laden mit abgelaufenem HTTP-Cache (wie am nächsten Tag; ein Service
 * Worker darf antworten).
 */
async function loadOnce(state, profile) {
  const context = await browser.newContext({ ...PHONE, storageState: state });
  if (profile.repeat) {
    const first = await context.newPage();
    await first.goto(`${BASE}/`);
    await first.waitForFunction(() => document.querySelectorAll('canvas').length > 0, null, { timeout: 120000 });
    await first.waitForTimeout(3000); // Service Worker installieren und füllen lassen
    await first.close();
  }
  const page = await context.newPage();
  const cdp = await cdpFor(page, profile);
  if (profile.repeat) await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  let bytes = 0;
  cdp.on('Network.loadingFinished', (e) => (bytes += e.encodedDataLength));
  const t0 = Date.now();
  await page.goto(`${BASE}/`, { waitUntil: 'commit' });
  // Spielbar: Zimmer mit Navigation und gezeichneter Szene (Skia-Leinwand) ist da.
  await page.waitForFunction(
    () => document.body.innerText.includes('Spiele') && document.querySelectorAll('canvas').length > 0,
    null,
    { timeout: 180000, polling: 50 },
  );
  const playableWall = Date.now() - t0;
  const timing = await page.evaluate(() => {
    const paint = performance.getEntriesByName('first-contentful-paint')[0];
    return { fcp: paint ? Math.round(paint.startTime) : null, playable: Math.round(performance.now()) };
  });
  await context.close();
  return { fcp: timing.fcp, playable: timing.playable, wall: playableWall, kb: Math.round(bytes / 1024) };
}

const median = (xs) => {
  const s = xs.filter((x) => x !== null).sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};

async function measureLoad(state) {
  const profiles = [
    { name: '4G', net: NET_4G, cpu: 1 },
    { name: '4G + CPU 4x', net: NET_4G, cpu: CPU_SLOW },
    { name: '4G + CPU 4x, Wiederbesuch', net: NET_4G, cpu: CPU_SLOW, repeat: true },
  ];
  const rows = [];
  for (const profile of profiles) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await loadOnce(state, profile));
    rows.push({
      profil: profile.name,
      erste_anzeige_ms: median(runs.map((r) => r.fcp)),
      spielbar_ms: median(runs.map((r) => r.playable)),
      uebertragen_kb: median(runs.map((r) => r.kb)),
    });
  }
  return rows;
}

/** Eingaben, damit die Spiele wirklich laufen (Treffer, Bewegung), nicht nur der Countdown. */
const SCENES = [
  { name: 'Zimmer', path: '/', wait: 1500, input: 'pet' },
  { name: 'Tipp den Kreis', path: '/minigames/tap', wait: 3800, input: 'tap' },
  { name: 'Schädlinge', path: '/minigames/smash', wait: 3800, input: 'tap' },
  { name: 'Tropfen', path: '/minigames/drops', wait: 3800, input: 'keys' },
  { name: 'Budi Jump', path: '/minigames/jump', wait: 3800, input: 'keys' },
  { name: 'Quiz', path: '/minigames/quiz', wait: 3800, input: 'quiz' },
];

async function driveInput(page, kind, until) {
  const box = { x: 30, y: 180, w: 330, h: 560 };
  let i = 0;
  while (Date.now() < until) {
    i++;
    if (kind === 'tap') {
      await page.mouse.click(box.x + ((i * 97) % box.w), box.y + ((i * 211) % box.h));
      await page.waitForTimeout(250);
    } else if (kind === 'keys') {
      const key = i % 2 ? 'ArrowLeft' : 'ArrowRight';
      await page.keyboard.down(key);
      await page.waitForTimeout(400);
      await page.keyboard.up(key);
    } else if (kind === 'quiz') {
      await page.keyboard.press(String(1 + (i % 3)));
      await page.waitForTimeout(600);
      await page.keyboard.press('Enter');
    } else if (kind === 'pet') {
      await page.mouse.move(150, 560);
      await page.mouse.down();
      await page.mouse.move(250, 560, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(1200);
    }
  }
}

async function fpsOnce(state, scene, dpr) {
  const context = await browser.newContext({ ...PHONE, deviceScaleFactor: dpr, storageState: state });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(`${BASE}${scene.path}`);
  // Szene steht: Text ist da (Kopfzeile, Navigation) und CanvasKit ist geladen.
  await page.waitForFunction(() => document.body.innerText.trim().length > 20 && 'CanvasKit' in window, null, {
    timeout: 120000,
  });
  await cdpFor(page, { cpu: CPU_SLOW });
  await page.waitForTimeout(scene.wait);
  await page.evaluate(() => {
    const frames = [];
    const w = window;
    w.__perfFrames = frames;
    let last = performance.now();
    const tick = (t) => {
      frames.push(t - last);
      last = t;
      if (!w.__perfStop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  await driveInput(page, scene.input, Date.now() + FPS_SECONDS * 1000);
  const frames = await page.evaluate(() => {
    const w = window;
    w.__perfStop = true;
    return w.__perfFrames.slice(1);
  });
  if (process.env.PERF_DEBUG) {
    let at = 0;
    const slow = frames.map((f) => [Math.round((at += f)), Math.round(f)]).filter(([, f]) => f > 200);
    console.log(scene.name, dpr, 'Frames > 200 ms [ab Start, Dauer]:', JSON.stringify(slow));
    await page.screenshot({ path: `${process.env.PERF_DEBUG}-${scene.path.replace(/\W/g, '') || 'zimmer'}-${dpr}.png` });
  }
  await context.close();
  const total = frames.reduce((a, b) => a + b, 0);
  return {
    szene: scene.name,
    dichte: dpr,
    fps: Math.round((frames.length / total) * 1000 * 10) / 10,
    lange_frames: frames.filter((f) => f > 25).length,
    max_ms: Math.round(Math.max(...frames)),
    fehler: errors.length,
  };
}

const result = {};
try {
  const state = await makeSave();
  if (doLoad) {
    result.laden = await measureLoad(state);
    console.log(`\nLadezeit, kalter Cache, Median aus ${RUNS} (ms ab Navigation):`);
    console.table(result.laden);
  }
  if (doFps) {
    result.fps = [];
    for (const dpr of FPS_DPRS) for (const scene of SCENES) result.fps.push(await fpsOnce(state, scene, dpr));
    console.log(`\nfps bei ${CPU_SLOW}-facher CPU-Drosselung, ${FPS_SECONDS} s mit Eingaben (lange Frames > 25 ms):`);
    console.table(result.fps);
  }
  if (JSON_OUT) writeFileSync(JSON_OUT, JSON.stringify(result, null, 2));
} finally {
  await browser.close();
  server.close();
}
