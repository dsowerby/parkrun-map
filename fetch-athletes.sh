#!/bin/bash

SOURCE_DIR=$(dirname "$0")

for ATHLETE in $(ls "$SOURCE_DIR/docs/athletes" | xargs -I{} -n 1 basename {} .json); do
  "$SOURCE_DIR/fetch-athlete.py" "$ATHLETE"
  sleep 5
done