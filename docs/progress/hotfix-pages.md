# Hotfix: Web-Version baseUrl /pou (Auftrag a37)

Branch: `claude/auftrag-hotfix-pages-baseurl` · PR: siehe Auftrag a37 · Kollege: Session a37

Das Repo heißt jetzt `neinkob12/pou`, Pages liegt damit unter https://neinkob12.github.io/pou/. Der Web-Build zeigte noch auf `/pou-`.

## Fertig

- `app.json`: `experiments.baseUrl` von `/pou-` auf `/pou`.
- `.github/workflows/pages.yml`: nur Kommentar (URL) und Schrittname (`baseUrl /pou`), vom CvD freigegeben. `ci.yml` unverändert.
- `docs/progress/pweb.md`: URL und `/pou-`-Erwähnungen auf `/pou`.

## Geprüft

- `npx expo export --platform web` baut. `dist/index.html` verweist auf `/pou/_expo/static/...` (CSS, JS) und `/pou/favicon.ico`.
- `dist` lokal unter `/pou/` ausgeliefert, mit Playwright (Chromium, 390 x 844) geöffnet: Altersfrage erscheint, CanvasKit-WASM wird von `/pou/assets/...` geladen, keine Antwort mit Status 400 oder höher, keine Seitenfehler.
- `bash scripts/check.sh` grün.

## Offen

- Erster echter Pages-Lauf erst nach dem Merge prüfbar.

## Fehlende Assets

- Keine.

## Bekannte Bugs

- Keine neuen.

## Handy-Test (3 bis 5 Punkte für den Chef)

1. Nach dem Merge den Workflow "Pages" abwarten (ca. 3 Minuten), dann https://neinkob12.github.io/pou/ öffnen: Altersfrage erscheint.
2. "Ja" tippen: Zimmer mit Tutorial, Budi ist zu sehen.
3. Ein Spiel (Schädlinge klatschen) öffnen: Skia zeichnet, also ist das WASM da.

## Entscheidungen

- Keine. Speicher-Schlüssel (`potpou-...`) bleiben, der Spielstand hängt am Ursprung `neinkob12.github.io`, nicht am Pfad.

## Gefunden, nicht gemacht

- Keine.
