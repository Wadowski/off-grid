#!/bin/sh
# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

DEFAULT_REPOSITORY=Wadowski/off-grid
DEFAULT_IMAGE_OWNER=wadowski
REPOSITORY_PATTERN='^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$'
OWNER_PATTERN='^[A-Za-z0-9._-]+$'
SEMVER_PATTERN='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'

fail() {
  printf '%s\n' "set-latest-version: $1" >&2
  exit 1
}

parse_arguments() {
  env_file=""
  while [ $# -gt 0 ]; do
    case "$1" in
      --env-file)
        [ $# -ge 2 ] || fail "--env-file needs a path"
        env_file=$2
        shift 2
        ;;
      *)
        fail "unknown argument: $1"
        ;;
    esac
  done
  [ -n "$env_file" ] || fail "usage: set-latest-version.sh --env-file <path>"
  [ -f "$env_file" ] || fail "env file not found: $env_file"
}

configured_repository() {
  repository=$(sed -n 's/^OFFGRID_RELEASE_REPOSITORY=//p' "$env_file" | tail -n 1)
  printf '%s\n' "${repository:-$DEFAULT_REPOSITORY}"
}

configured_image_owner() {
  owner=$(sed -n 's/^OFFGRID_IMAGE_OWNER=//p' "$env_file" | tail -n 1)
  printf '%s\n' "${owner:-$DEFAULT_IMAGE_OWNER}"
}

validate_configuration() {
  printf '%s\n' "$1" | grep -Eq "$REPOSITORY_PATTERN" \
    || fail "invalid release repository: $1"
  printf '%s\n' "$2" | grep -Eq "$OWNER_PATTERN" \
    || fail "invalid image owner: $2"
}

latest_tag() {
  repository=$1
  release_json=$(curl -fsSL "https://api.github.com/repos/$repository/releases/latest") \
    || fail "could not read the latest release of $repository"
  printf '%s\n' "$release_json" | sed -n 's/.*"tag_name": *"\([^"]*\)".*/\1/p' | head -n 1
}

version_from_tag() {
  version=${1#v}
  printf '%s\n' "$version" | grep -Eq "$SEMVER_PATTERN" \
    || fail "the latest tag '$1' is not a release version"
  printf '%s\n' "$version"
}

write_version() {
  version=$1
  temporary=$(mktemp "$env_file.XXXXXX")
  trap 'rm -f "$temporary"' EXIT
  if grep -q '^OFFGRID_VERSION=' "$env_file"; then
    sed "s/^OFFGRID_VERSION=.*/OFFGRID_VERSION=$version/" "$env_file" > "$temporary"
  else
    cat "$env_file" > "$temporary"
    printf 'OFFGRID_VERSION=%s\n' "$version" >> "$temporary"
  fi
  mv "$temporary" "$env_file"
}

main() {
  parse_arguments "$@"
  command -v curl > /dev/null 2>&1 || fail "curl is required on this host"
  repository=$(configured_repository)
  owner=$(configured_image_owner)
  validate_configuration "$repository" "$owner"
  tag=$(latest_tag "$repository")
  [ -n "$tag" ] || fail "the latest release of $repository has no tag"
  version=$(version_from_tag "$tag")
  write_version "$version"
  printf '%s\n' "$version"
}

main "$@"
