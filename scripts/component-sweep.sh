#!/usr/bin/env bash
#
# component-sweep.sh — exhaustive variant / state / usage discovery for ONE component.
#
# The deterministic half of the "never miss a variant" methodology (the other half is the
# agent fan-out prompt in design-system/components/component-sweep.md). It mines how a
# component is ACTUALLY used across the whole product so no variant, size, state, prop-value,
# consumer-class, slot, or sibling slips through.
#
# Usage:
#   design-system/scripts/component-sweep.sh <TagName> [--src DIR] [--source FILE] [--out FILE]
#
# Examples:
#   design-system/scripts/component-sweep.sh MButton
#   design-system/scripts/component-sweep.sh FlotoDrawer --source src/components/_base-drawer.vue
#   design-system/scripts/component-sweep.sh MTooltip --out /tmp/tooltip-sweep.md
#
# Output: a Markdown report to stdout (or --out). Read it, then feed the gaps to the agent sweep.

set -euo pipefail

TAG="${1:?usage: component-sweep.sh <TagName> [--src DIR] [--source FILE] [--out FILE]}"; shift || true
SRC="src"
SOURCE=""
OUT=""
while [ $# -gt 0 ]; do
  case "$1" in
    --src) SRC="$2"; shift 2;;
    --source) SOURCE="$2"; shift 2;;
    --out) OUT="$2"; shift 2;;
    *) echo "unknown arg: $1" >&2; exit 1;;
  esac
done

# Resolve to the UI root (this script lives in design-system/scripts/).
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
[ -d "$SRC" ] || { echo "src dir '$SRC' not found under $ROOT" >&2; exit 1; }

# Files that actually use the tag — the working set for every section below.
# (portable array read — macOS ships bash 3.2 with no `mapfile`)
FILES=()
while IFS= read -r f; do [ -n "$f" ] && FILES+=("$f"); done < <(grep -rlE "<$TAG\b" "$SRC" 2>/dev/null || true)

emit() { if [ -n "$OUT" ]; then cat >> "$OUT"; else cat; fi; }
[ -n "$OUT" ] && : > "$OUT"

{
echo "# Component sweep — \`<$TAG>\`"
echo
echo "_Run: \`design-system/scripts/component-sweep.sh $TAG\` · src: \`$SRC\`_"
echo

# 1) USAGE TOTALS ------------------------------------------------------------
total=$(grep -rohE "<$TAG\b" "$SRC" 2>/dev/null | wc -l | tr -d ' ')
nfiles=${#FILES[@]}
echo "## 1 · Usage"
echo
echo "- **$total** occurrences across **$nfiles** files."
echo

# 2) BY MODULE (where it's used) --------------------------------------------
echo "## 2 · Where used (by module)"
echo
echo '```text'
printf '%s\n' "${FILES[@]}" | sed -E "s#^$SRC/modules/([^/]+)/.*#modules/\1#; s#^$SRC/components/.*#components (shared)#; s#^$SRC/([^/]+)/.*#\1#" \
  | sort | uniq -c | sort -rn
echo '```'
echo

if [ "$nfiles" -eq 0 ]; then echo "_No usages found — check the tag name._"; exit 0; fi

# 3) PROP-VALUE DISTRIBUTIONS (the variant discovery) -----------------------
# For every <Tag ...> (multi-line aware), pull every  name="value" / :name="value" pair and
# tally the VALUES per prop. Variants live in the values (width="96%", mode="tags", ...).
echo "## 3 · Prop-value distributions (every distinct value = a candidate variant)"
echo
TAG="$TAG" perl -0777 -ne '
  my $t = $ENV{TAG};
  while (/<\Q$t\E\b((?:[^>"\x27]|"[^"]*"|\x27[^\x27]*\x27)*?)\/?>/gs) {
    my $a = $1;
    while ($a =~ /(?<![\@\w.-])(:|v-bind:)?([A-Za-z][\w-]*)\s*=\s*"([^"]*)"/g) {
      my ($name,$val) = ($2,$3);
      next if $name =~ /^(v-|key$|ref$|class$|style$|slot)/;   # handled elsewhere
      $val =~ s/\s+/ /g; $val = substr($val,0,40);
      print "$name\t$val\n";
    }
  }
' "${FILES[@]}" 2>/dev/null \
| sort | uniq -c | sort -k2,2 -k1,1nr \
| awk '
  { cnt=$1; rest=$0; sub(/^ *[0-9]+ /, "", rest);
    n=split(rest, p, "\t"); prop=p[1]; val=p[2];
    if (val=="") val="(empty)";
    if (prop!=last){ if(last!="") print ""; printf "**%s**\n", prop; last=prop }
    printf "  - `%s` × %s\n", val, cnt }
'
echo

# 4) BOOLEAN / FLAG PROPS (states & modifiers with no =) --------------------
echo "## 4 · Boolean / flag props (states & modifiers)"
echo
echo '```text'
TAG="$TAG" perl -0777 -ne '
  my $t = $ENV{TAG};
  while (/<\Q$t\E\b((?:[^>"\x27]|"[^"]*"|\x27[^\x27]*\x27)*?)\/?>/gs) {
    my $a = $1;
    # tokens that are bare attrs (boolean) — not name=, not @, not v-, not :
    for my $tok ($a =~ /(?:^|\s)([a-z][a-z0-9-]*)(?=\s|$)/g) {
      next if $tok =~ /^(v-|slot)/;
      print "$tok\n";
    }
  }
' "${FILES[@]}" 2>/dev/null | sort | uniq -c | sort -rn | head -30
echo '```'
echo

# 5) CONSUMER-APPLIED CLASSES (often the REAL variant API, e.g. Tag) ---------
echo "## 5 · Consumer-applied classes (the class-based variant API)"
echo
echo '```text'
TAG="$TAG" perl -0777 -ne '
  my $t = $ENV{TAG};
  while (/<\Q$t\E\b((?:[^>"\x27]|"[^"]*"|\x27[^\x27]*\x27)*?)\/?>/gs) {
    my $a = $1;
    while ($a =~ /(?<!:)\bclass\s*=\s*"([^"]*)"/g) { print "$_\n" for split /\s+/, $1 }
    while ($a =~ /overlay-class-name\s*=\s*"([^"]*)"/g) { print "overlay:$_\n" for split /\s+/, $1 }
  }
' "${FILES[@]}" 2>/dev/null \
| grep -vE '^(mr-|ml-|mt-|mb-|mx-|my-|px-|py-|p-|m-|pl-|pr-|pt-|pb-|flex|w-|h-|text-|font-|items-|justify-|gap-|cursor-|rounded|inline|block|min-|max-|self-|absolute|relative|truncate|overflow-|border|hidden|grid|space-|leading|align|whitespace|opacity|z-|top-|left-|right-|bottom-|shadow|bg-|w$|h$)' \
| grep . | sort | uniq -c | sort -rn | head -30
echo '```'
echo

# 6) SLOTS used by consumers -------------------------------------------------
echo "## 6 · Slots used"
echo
echo '```text'
TAG="$TAG" perl -0777 -ne '
  my $t = $ENV{TAG};
  while (/<\Q$t\E\b.*?<\/\Q$t\E>/gs) {
    my $blk = $&;
    while ($blk =~ /(?:v-slot:|#|slot=")([\w-]+)/g) { print "$1\n" }
  }
' "${FILES[@]}" 2>/dev/null | sort | uniq -c | sort -rn | head -20
echo '```'
echo

# 7) EVENTS bound by consumers ----------------------------------------------
echo "## 7 · Events bound"
echo
echo '```text'
TAG="$TAG" perl -0777 -ne '
  my $t = $ENV{TAG};
  while (/<\Q$t\E\b((?:[^>"\x27]|"[^"]*"|\x27[^\x27]*\x27)*?)\/?>/gs) {
    my $a = $1;
    while ($a =~ /(?:\@|v-on:)([\w.-]+)/g) { (my $e=$1) =~ s/\..*//; print "$e\n" }
  }
' "${FILES[@]}" 2>/dev/null | sort | uniq -c | sort -rn | head -20
echo '```'
echo

# 8) FAMILY / RELATED FILES (siblings, app composites, the concept) ---------
# Strip the M/Floto prefix to a concept, then find every .vue named around it.
concept=$(echo "$TAG" | sed -E 's/^(M|Floto|Base|A)//' | sed -E 's/([a-z])([A-Z])/\1-\2/g' | tr '[:upper:]' '[:lower:]')
echo "## 8 · Family / related files (concept: \`$concept\`)"
echo
echo '```text'
find "$SRC" -iname "*${concept}*.vue" 2>/dev/null | sed "s#^$SRC/##" | sort | head -40
echo '```'
echo "_App composites + siblings around the concept — check each is a variant of, or distinct from, \`<$TAG>\`._"
echo

# 9) SOURCE API (if the component source is given) --------------------------
if [ -n "$SOURCE" ] && [ -f "$SOURCE" ]; then
  echo "## 9 · Declared API — \`$SOURCE\`"
  echo
  echo "**Props:**"; echo '```text'
  perl -0777 -ne 'if (/props:\s*\{(.*?)\n\s*\},?\n/s){ my $p=$1; while($p=~/^\s{4}([\w]+):\s*\{([^}]*)\}/mg){ my($n,$b)=($1,$2); my($d)=$b=~/default:\s*([^,\n]+)/; print "  $n".($d?" (default $d)":"")."\n" } }' "$SOURCE" 2>/dev/null | head -40
  echo '```'
  echo "**Slots declared:**"; echo '```text'
  grep -oE "<slot[^>]*name=\"[^\"]+\"" "$SOURCE" 2>/dev/null | grep -oE "name=\"[^\"]+\"" | sort -u
  grep -oE "v-slot:[\w-]+|\\\$scopedSlots\.[\w]+|\\\$slots\.[\w]+" "$SOURCE" 2>/dev/null | sort -u | head
  echo '```'
  echo "**Events emitted:**"; echo '```text'
  grep -oE "\\\$emit\('[\w:-]+'" "$SOURCE" 2>/dev/null | grep -oE "'[\w:-]+'" | sort -u | head -20
  echo '```'
  echo
fi

echo "---"
echo "_Next: feed §3 (prop values), §5 (classes), §8 (related files) into the agent fan-out"
echo "(see \`design-system/components/component-sweep.md\`) to catch app-specific variants, alternate"
echo "render mechanisms, and per-module usage the greps can't classify._"
} | emit

[ -n "$OUT" ] && echo "→ wrote $OUT" >&2 || true
