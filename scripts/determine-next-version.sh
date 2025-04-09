#!/bin/bash
# Currently not possible natively by semantic release https://github.com/semantic-release/semantic-release/issues/1647

TMP_DIR=$(mktemp -d)
OUTPUT_FILE="$TMP_DIR/output.log"

yarn semantic-release --dry-run 1> "$OUTPUT_FILE"
export NEXT_VERSION=$(grep 'Release note for version' "$OUTPUT_FILE" | sed -E 's/.*version ([0-9]+\.[0-9]+\.[0-9]+).*/\1/' | xargs)

if [ -n "$GITHUB_OUTPUT" ]; then 
    echo "next-version=$NEXT_VERSION" >> "$GITHUB_OUTPUT"
fi
echo "next-version=$NEXT_VERSION"

rm -rf "$TMP_DIR"