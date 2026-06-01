#!/bin/bash
SOURCE_DIR=$(dirname "$0")
cd "$SOURCE_DIR"
for ATHLETE in $(ls "docs/athletes" | xargs -I{} -n 1 basename {} .json); do
  pipenv run python "fetch-athlete.py" "$ATHLETE"
  sleep 5
done
