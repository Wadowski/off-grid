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
write_if_missing mail-encryption-key "$(random_secret)"
write_if_missing updater-token "$(random_secret)"
write_if_missing instance-id "$(cat /proc/sys/kernel/random/uuid)"

files_root=${FILES_ROOT:-/data}
for files_dir in "$files_root/files" "$files_root/files-e2e"; do
  mkdir -p "$files_dir"
  if [ "$(id -u)" = 0 ]; then
    chown 1000:1000 "$files_dir"
  fi
  chmod 0700 "$files_dir"
done
