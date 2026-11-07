#!/bin/sh
# Mirrors the repo source into the project folder (Google Drive) without build output or dependencies (R-2026-24).
set -e
DEST="$HOME/Library/CloudStorage/GoogleDrive-zezeatolye@gmail.com/Drive'ım/Claude/Convy/05-build/site/"
rsync -a --delete --exclude node_modules --exclude dist --exclude .astro --exclude public/engines --exclude test-results --exclude .draft-dist --exclude .git ./ "$DEST"
echo "mirrored to $DEST"
