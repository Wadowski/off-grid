# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

secrets_dir=${SECRETS_DIR:-/data/secrets}
mkdir -p "$secrets_dir"
umask 077

random_secret() {
  head -c 32 /dev/urandom | base64 | tr -d '\n'
}

write_if_missing() {
  file="$secrets_dir/$1"
  if [ ! -s "$file" ]; then
    printf '%s' "$2" > "$file"
    chmod 0444 "$file"
  fi
}

write_if_missing postgres-password "$(random_secret)"
write_if_missing migrator-password "$(random_secret)"
write_if_missing app-password "$(random_secret)"
write_if_missing instance-id "$(cat /proc/sys/kernel/random/uuid)"
