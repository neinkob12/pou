# Claude Code Instructions: PotPou

PotPou ist ein Pou-artiges Handyspiel (iOS + Android): Der Spieler pflegt eine Cannabispflanze mit Gesicht ("Budi") in Echtzeit vom Samen bis zur Ernte. Das vollständige Konzept steht in `docs/KONZEPT.md`.

## Vor jeder Session

1. Lies `TECH_STACK.md`. Halte dich daran.
2. Lies `docs/AUFTRAEGE.md`: Arbeitsregeln, geteilte Dateien und den Eintrag deines Auftrags (PNN). Der Session-Prompt aus `docs/SESSIONS.md` ist die fachliche Vorlage, die Reihenfolge und der Dateibesitz kommen aus `AUFTRAEGE.md`. Arbeite nicht an anderen Aufträgen vor.
3. Lies `docs/PROGRESS.md`, um zu wissen, was schon steht.

## Arbeiten im Büro (mehrere Sessions parallel)

- Ein Auftrag, ein Branch (`claude/auftrag-{nr}-{name}`), ein PR. Nichts außerhalb des Auftrags.
- Ändere nur Dateien, die dein Auftrag besitzt. Geteilte Dateien (`config.ts`, Store-Slices, `assets.ts`, `strings.ts`, `RoomScreen.tsx`, `settings.tsx`) nur nach der Tabelle in `docs/AUFTRAEGE.md`: eigener Abschnitt, eigene Slice-Datei, eine Einhängezeile.
- Vor `review`: `git fetch origin main && git merge origin/main`, Konflikte lösen, `bash scripts/check.sh` grün. Grün in der CI heißt Auto-Merge, es gibt keinen zweiten Blick. Pushe also nur, was du selbst geprüft hast.
- Schreib `docs/progress/pNN.md` nach `docs/progress/VORLAGE.md`. `docs/PROGRESS.md` pflegt nur der Chef vom Dienst.
- Blockiert oder unklar: `auftrag blockieren` mit Grund und dem CvD melden. Nicht raten.
- Nie: Tests löschen oder überspringen, `.github/` oder `scripts/` ändern, Force-Push, neue Pakete ohne Nennung im Auftrag.

## Feste Regeln des Spiels (nicht ändern ohne Rückfrage)

- Alle Balancing-Werte (Phasendauern, Abfallraten, Preise, Sorten) leben ausschließlich in `src/game/config.ts`, jeder Auftrag in seinem markierten Abschnitt. Keine Magic Numbers in Komponenten.
- Zeit wird nie per Timer hochgezählt. Der Pflanzenzustand wird immer aus Zeitstempeln berechnet (`src/game/timeEngine.ts`). Die App muss nach Tagen im Hintergrund korrekt weiterlaufen.
- `TIME_SCALE = 10` (1 echter Tag = 10 Pflanzentage), mit Turbo-Kauf `20`.
- Spiellogik ist reines TypeScript ohne React-Import (`src/game/`), damit sie testbar bleibt. Jede neue Logikfunktion bekommt einen Test.
- Inhalt: Keine Darstellung von Konsum, Rauchen, High-Sein, Dosierung oder echtem Verkauf. Budi ist eine Pflanze. Das ist eine harte App-Store-Anforderung (Apple 1.4.3, Google Play Marijuana Policy). `scripts/check-content.sh` prüft das in der CI, ersetzt aber nicht dein Mitdenken.
- Keine echten Sortennamen, keine echten Marken, kein Material aus dem Spiel "Pou".

## Code-Konventionen

- TypeScript strict. Keine `any` ohne Kommentar, warum.
- Geteilte Logik in `src/lib/` (technisch) oder `src/game/` (Spielregeln). Keine `/utils`- oder `/services`-Ordner.
- Route-Dateien in `app/` nur für Komposition. Logik gehört in Hooks oder `src/game/`.
- Kleine Komponenten. Wird eine Datei länger als ca. 200 Zeilen, aufteilen.
- Assets nur über `src/lib/assets.ts` referenzieren, nie direkt mit Pfad in Komponenten.
- Sichtbare Texte nur in `src/content/strings.ts`.
- Fehlt ein Asset, nutze einen klar erkennbaren Platzhalter (farbige Form + Text) und trage es in deiner Progress-Notiz unter "Fehlende Assets" ein.

## Am Ende jeder Session

- Schreib `docs/progress/pNN.md`: was fertig ist, was offen ist, fehlende Assets, bekannte Bugs, 3 bis 5 Punkte für den Handy-Test.
- Merge `origin/main`, `bash scripts/check.sh` grün, PR öffnen, `review` melden.

## Kommunikation

- Antworte auf Deutsch.
- Sei direkt. Widersprich, wenn etwas keinen Sinn ergibt.
- Benutze keine Gedankenstriche (em dashes).
- Bei Unklarheit: eine konkrete Rückfrage an den CvD statt raten.
- Neue Libraries nur, wenn der Auftrag sie nennt, und mit Begründung in `TECH_STACK.md`. Größere Architekturwechsel vorher ankündigen.
- Ich habe ADHS: Halte Zusammenfassungen kurz, mit klaren nächsten Schritten.
