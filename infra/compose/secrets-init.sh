# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

secrets_dir=/data/secrets
mkdir -p "$secrets_dir"

random_secret() {
  head -c 32 /dev/urandom | base64 | tr -d '\n'
}

random_uuid() {
  cat /proc/sys/kernel/random/uuid
}

ensure_secret() {
  file="$secrets_dir/$1"
  if [ ! -s "$file" ]; then
    "$2" > "$file"
    chmod 0444 "$file"
  fi
}

ensure_secret postgres-password random_secret
ensure_secret migrator-password random_secret
ensure_secret app-password random_secret
ensure_secret instance-id random_uuid
