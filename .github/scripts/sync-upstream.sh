#!/usr/bin/env bash
set -euo pipefail

upstream_ref=${1:-upstream/main}
if git merge-base --is-ancestor "$upstream_ref" HEAD; then
  echo 'changed=false' >> "$GITHUB_OUTPUT"
  echo 'Already up to date with upstream.' >> "$GITHUB_STEP_SUMMARY"
  exit 0
fi

# Keep account-specific resources and the fork's automation under local control.
# Remaining conflicts require review and must not reach production.
git merge --no-commit --no-ff "$upstream_ref" || true
if ! git rev-parse --verify -q MERGE_HEAD >/dev/null; then
  echo 'Unable to prepare an upstream merge.' >&2
  exit 1
fi
git restore --source=HEAD --staged --worktree -- wrangler.toml .github
conflicts=$(git diff --name-only --diff-filter=U)
if [ -n "$conflicts" ]; then
  printf 'Upstream merge needs review:\n%s\n' "$conflicts" >&2
  git merge --abort
  exit 1
fi

git commit -m "Sync upstream $(git rev-parse --short "$upstream_ref")"
echo 'changed=true' >> "$GITHUB_OUTPUT"
echo 'Merged upstream; retained wrangler.toml and .github configuration.' >> "$GITHUB_STEP_SUMMARY"
