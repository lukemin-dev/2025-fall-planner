#!/usr/bin/env bash
# Bootstrap labels and milestones for this repo.
# Preview: bash bootstrap.sh
# Apply:   bash bootstrap.sh --apply
set -euo pipefail

apply_flag=""
if [[ "${1:-}" == "--apply" ]]; then
  apply_flag="--apply"
fi

node scripts/validate-config.mjs
node scripts/sync-labels.mjs ${apply_flag}
node scripts/sync-milestones.mjs ${apply_flag}

if [[ -z "$apply_flag" ]]; then
  echo "미리보기 완료. 실제 반영하려면: bash bootstrap.sh --apply"
else
  echo "완료. 주간 이슈 생성은 예: node scripts/create-weekly-issues.mjs --week W1 --apply"
fi
