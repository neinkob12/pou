# PotPou: Fortschritt

Wird vom Chef vom Dienst (CvD) nach jedem Merge aus `docs/progress/pNN.md` zusammengeführt. Kollegen schreiben nur ihre eigene Notiz. Du kannst hier selbst Notizen ergänzen.

Aktuelle Welle: 0 (Fundament). Plan: `docs/AUFTRAEGE.md`.

## Auftragsstatus

| Auftrag | Status | PR | Handy-Test offen |
| --- | --- | --- | --- |
| P01 Projekt-Setup, CI, Gerüste | offen | | |

## Fertig

- Starter-Paket: CLAUDE.md, TECH_STACK.md, Konzept, Sessions, Asset-Liste, Design-Leitfaden, Launch-Checkliste
- `src/game/config.ts` mit allen Balancing-Werten und reservierten Abschnitten je Auftrag
- `src/game/timeEngine.ts` mit 11 grünen Tests
- Büro-Betrieb: `docs/AUFTRAEGE.md` (35 Aufträge in 6 Wellen), CI (`.github/workflows/ci.yml`), Prüfskript `scripts/check.sh`, Inhalts-Check, Progress-Notizen je Auftrag

## Offen

- P01, danach Welle 1 (P02 bis P09)

## Braucht dich (gesammelt vom CvD)

- D1 bis D3 in `docs/DESIGN_GUIDE.md` eintragen (Name, Stil, Palette). Sonst nimmt P01 die Empfehlungen.
- Nach P01: Development Build auf dem Handy installieren (Anleitung kommt in `docs/progress/p01.md`).

## Handy-Tests für dich

- Noch keine.

## Fehlende Assets

- Alle (siehe docs/ASSETS.md)

## Bekannte Bugs

- Keine

## Entscheidungen

- Zyklus ca. 10 echte Tage (TIME_SCALE 10), Turbo 9,99 € halbiert auf ca. 5 Tage
- Budi im MVP als PNG-Ebenen, Gesicht auf dem Topf (Empfehlung, siehe DESIGN_GUIDE.md D4)
- Spielstand nur lokal, kein Login
- Büro-Betrieb: Auto-Merge bei grüner CI, bis zu 8 Kollegen, ein CvD. Grün heißt: Typen, Lint, Tests, Inhalts-Check.
