#!/usr/bin/env bash
set -euo pipefail

commit_msg=${1:-"auto: update"}

echo "[1/4] Committing application code"
git add .
git commit -m "$commit_msg"
git push origin main

echo "[2/4] Building apps"
npm run build

echo "[3/4] Syncing dist -> pages"
rm -rf pages/*
rsync -av dist/market/ pages/
rsync -av dist/seller/ pages/seller/

echo "[4/4] Publishing gh-pages"
cd pages
git add .
git commit -m "deploy $(date +%F)"
git push origin gh-pages
