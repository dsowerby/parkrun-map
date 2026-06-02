#!/bin/bash
set -e

SOURCE_DIR=$(dirname "$0")
cd "$SOURCE_DIR"

echo "Installing pipenv..."
brew install pipenv

echo "Installing dependencies..."
pipenv install

echo "Installing Playwright browsers..."
pipenv run playwright install chromium

echo "Done. Run ./fetch-athletes.sh to start."
