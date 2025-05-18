#!/usr/bin/env bash
set -euo pipefail

# Make sure actions.txt and pages.txt exist:
if [[ ! -f actions.txt ]]; then
  echo "Error: actions.txt not found" >&2
  exit 1
fi
if [[ ! -f pages.txt ]]; then
  echo "Error: pages.txt not found" >&2
  exit 1
fi

# Ensure paperclips.txt exists:
if [[ ! -f paperclips.txt ]]; then
  echo "Error: paperclips.txt not found in $(pwd)" >&2
  exit 1
fi

echo generating pages from paperclips.txt paragraphs ...

# Use awk to split on blank lines (RS="") and emit each paragraph terminated by a NUL (\0)
# Then in the while-loop, read each paragraph into "$paragraph"
awk 'BEGIN { RS=""; ORS="\0" } { print }' paperclips.txt |
while IFS= read -r -d '' paragraph; do
  # Compute sha256 of the raw paragraph text, take first 16 hex chars:
  hash=$(printf '%s' "$paragraph" | sha256sum | cut -c1-16)
  out="page-${hash}.md"

  # Write the markdown header and then the paragraph itself:
  {
    printf "# PAPERCLIPS\n\n"
    printf "%s\n" "$paragraph"
  } > "$out"
done

echo adding choices ...

# prepare index.md
cp index.org index.md
# Loop over every *.md file in the cwd
for pagefile in *.md; do
  # 1) Pick two distinct random actions from actions.txt
  #    (shuf -n2 guarantees two different lines if there are ≥2 lines)
  mapfile -t rand_actions < <(shuf -n 2 actions.txt)
  action1="${rand_actions[0]}"
  action2="${rand_actions[1]}"

  # 2) Choose which of the two gets the "Don't " prefix (50/50 chance)
  if (( RANDOM % 2 == 0 )); then
    target="$action1"
    other="$action2"
  else
    target="$action2"
    other="$action1"
  fi

  # 3) Lowercase the first letter of $target, then prefix with "Don't "
  first_char="${target:0:1}"
  rest_chars="${target:1}"
  lower_first="$(printf '%s' "$first_char" | tr '[:upper:]' '[:lower:]')"
  prefixed="Don't ${lower_first}${rest_chars}"

  # 4) Decide ordering of the two displayed choices
  #    If $target was action1, then prefixed goes first, otherwise other goes first.
  if [[ "$target" == "$action1" ]]; then
    choiceA="$prefixed"
    choiceB="$action2"
  else
    choiceA="$action1"
    choiceB="$prefixed"
  fi

  # 5) Pick two random pages (with possible duplicates) from pages.txt
  mapfile -t rand_pages < <(shuf -n 2 pages.txt)
  link1="${rand_pages[0]}"
  link2="${rand_pages[1]}"

  # 6) Append the combined line to the current pagefile
  printf "\n## [%s](%s) / [%s](%s)\n" \
    "$choiceA" "$link1" \
    "$choiceB" "$link2" \
    >> "$pagefile"
done

echo done.
