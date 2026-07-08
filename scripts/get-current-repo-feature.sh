#!/usr/bin/env bash
#
# get-current-repo-feature.sh
#
# Detects the current git branch's feature/issue number and outputs
# a JSON object conforming to the watch script schema.
#
# Expected to run in the project directory (cwd set by the app).
#
# Output conforms to the fileviewer script schema v1:
# {
#   "watch": {                         -- watch section
#     "pattern": "<glob pattern>",     -- applied to watch file glob
#     "name": "<display name>",        -- optional: updates watch display name
#     "subfolder": "<relative path>"   -- optional: updates watch subfolder
#   }
# }
#
# Future sections (not used by this script):
#   "project": { ... }   -- project-level overrides
#   "settings": { ... }  -- global settings overrides
#
# Branch naming conventions detected:
#   feature/277-some-description  -> 277
#   fix/277-bug-title             -> 277
#   277-some-description          -> 277
#   issue-277                     -> 277

set -euo pipefail

# Get current branch name
branch=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "")

if [ -z "$branch" ] || [ "$branch" = "HEAD" ]; then
  echo '{"error": "Not on a branch (detached HEAD or not a git repo)"}'
  exit 1
fi

# Extract the first number sequence from the branch name
# Works with: feature/277-desc, fix/277, 277-desc, issue-277, etc.
number=$(echo "$branch" | grep -oE '[0-9]+' | head -1 || true)

if [ -z "$number" ]; then
  echo "{\"error\": \"No issue number found in branch: $branch\"}"
  exit 1
fi

# Output structured result
cat <<EOF
{
  "watch": {
    "pattern": "${number}*",
    "name": "Feature #${number}"
  }
}
EOF
