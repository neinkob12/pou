#!/usr/bin/env bash
# Harte App-Store-Regel (Apple 1.4.3, Google Play): keine Konsumdarstellung.
# Sucht in src/ und app/ nach verbotenen Wörtern (Liste in scripts/forbidden-words.txt).
set -uo pipefail
cd "$(dirname "$0")/.."

dirs=""
for d in src app; do
  [ -d "$d" ] && dirs="$dirs $d"
done
[ -z "$dirs" ] && { echo "Inhaltsprüfung: keine Quellordner, ok."; exit 0; }

# shellcheck disable=SC2086
hits=$(grep -rniwE --include='*.ts' --include='*.tsx' --include='*.json' -f scripts/forbidden-words.txt $dirs || true)

if [ -n "$hits" ]; then
  echo "Inhaltsprüfung FEHLGESCHLAGEN. Konsum-Bezug gefunden (siehe CLAUDE.md, Feste Regeln):"
  echo "$hits"
  exit 1
fi
echo "Inhaltsprüfung ok."
