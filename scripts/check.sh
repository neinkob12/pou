#!/usr/bin/env bash
# Einziger Prüfbefehl für Kollegen, CvD und CI. Grün hier = mergebar.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -f package.json ]; then
  echo "Noch kein Expo-Projekt (package.json fehlt). Nur Inhaltsprüfung."
  bash scripts/check-content.sh
  exit 0
fi

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

npm run typecheck
npm run lint
npm test -- --ci
bash scripts/check-content.sh
