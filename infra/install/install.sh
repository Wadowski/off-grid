#!/bin/sh
# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

DEFAULT_INSTALL_DIR=/opt/offgrid
MINIMUM_FREE_KIB=2097152
KIB_PER_GIB=1048576
SUPPORTED_SYSTEMS="RHEL, CentOS Stream, Fedora, Debian, Ubuntu"
PASTE_IN_POINTER="install Docker yourself and follow the paste-in path in infra/README.md (infra/compose/docker-compose.production.yml)"
DOCKER_DOWNLOAD_URL=https://download.docker.com/linux
DOCKER_DEB_FINGERPRINT=9DC858229FC7DD38854AE2D88D81803C0EBFCD88
DOCKER_RPM_FINGERPRINT=060A61C51B558A7F742B77AAC52FEB6B621E9F35
DEFAULT_RELEASE_REPOSITORY=Wadowski/off-grid
WAIT_TIMEOUT_SECONDS=300
RELEASE_REPOSITORY_PATTERN='^[A-Za-z0-9._-]+/[A-Za-z0-9._-]+$'
SEMVER_PATTERN='^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'

fail() {
  printf 'FAIL %s\n' "$1" >&2
  exit 1
}

info_ok() {
  printf 'ok  %s\n' "$1"
}

require_root() {
  if [ "$(id -u)" -ne 0 ]; then
    fail "root: run this script as root, for example: sudo sh install.sh"
  fi
  info_ok "root: running as root"
}

detect_architecture() {
  machine=$(uname -m)
  case "$machine" in
    x86_64) info_ok "architecture: $machine (amd64)" ;;
    aarch64 | arm64) info_ok "architecture: $machine (arm64)" ;;
    *) fail "architecture: $machine is not supported, only amd64 (x86_64) and arm64 (aarch64)" ;;
  esac
}

os_release_value() {
  sed -n "s/^$1=//p" "$os_release_file" | tail -n 1 | tr -d '"'
}

unsupported_system() {
  fail "os: $os_id is not a supported system. Supported systems: $SUPPORTED_SYSTEMS. To run the production stack here, $PASTE_IN_POINTER."
}

unsupported_debian_derivative() {
  fail "os: $os_id ($os_codename) is not a supported system: Docker publishes no repository for its release. Supported systems: $SUPPORTED_SYSTEMS. To run the production stack here, $PASTE_IN_POINTER."
}

detect_os_family() {
  os_release_file=${OFFGRID_OS_RELEASE_FILE:-/etc/os-release}
  [ -r "$os_release_file" ] || fail "os: cannot read $os_release_file"
  os_id=$(os_release_value ID)
  os_id_like=$(os_release_value ID_LIKE)
  case "$os_id" in
    debian | ubuntu) os_family=debian ;;
    fedora) os_family=fedora ;;
    rhel | centos) os_family=rhel ;;
    *)
      case " $os_id_like " in
        *" ubuntu "*) os_family=debian ;;
        *" debian "*)
          os_codename=$(os_release_value VERSION_CODENAME)
          case "$os_codename" in
            bookworm | trixie | bullseye) ;;
            *) unsupported_debian_derivative ;;
          esac
          os_family=debian
          ;;
        *) unsupported_system ;;
      esac
      ;;
  esac
  info_ok "os: $os_id is the $os_family family"
}

resolve_install_home() {
  install_dir=${OFFGRID_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}
  case "$install_dir" in
    /*) printf '%s\n' "$install_dir" ;;
    *) fail "install folder: OFFGRID_INSTALL_DIR must be an absolute path, got $install_dir" ;;
  esac
}

check_disk_space() {
  install_dir=$(resolve_install_home)
  probe_dir=$install_dir
  while [ ! -e "$probe_dir" ]; do
    probe_dir=$(dirname "$probe_dir")
  done
  available_kib=$(df -Pk "$probe_dir" | sed -n 2p | tr -s ' ' | cut -d ' ' -f 4)
  if [ "$available_kib" -lt "$MINIMUM_FREE_KIB" ]; then
    fail "disk: $probe_dir has less than 2 GB free, $install_dir needs 2 GB"
  fi
  info_ok "disk: $((available_kib / KIB_PER_GIB)) GB free in $probe_dir"
}

docker_binary_present() {
  command -v docker >/dev/null 2>&1
}

docker_is_ready() {
  docker info >/dev/null 2>&1
}

docker_compose_version() {
  docker compose version --short 2>/dev/null | sed "s/^v//"
}

compose_version_is_supported() {
  printf "%s\n" "$1" | grep -Eq "^[0-9]+\.[0-9]+" || return 1
  compose_major=$(printf "%s\n" "$1" | cut -d . -f 1)
  compose_minor=$(printf "%s\n" "$1" | cut -d . -f 2)
  [ "$compose_major" -gt 2 ] && return 0
  [ "$compose_major" -eq 2 ] && [ "$compose_minor" -ge 23 ]
}

install_docker_engine() {
  case "$os_family" in
    debian) install_docker_debian ;;
    fedora) install_docker_fedora ;;
    rhel) install_docker_rhel ;;
    *) fail "docker: no install branch for the $os_family family" ;;
  esac
  info_ok "docker: installed Docker Engine and the Compose plugin from the official Docker repository"
}

check_docker() {
  if ! docker_binary_present; then
    install_docker_engine
    return 0
  fi
  if ! docker_is_ready; then
    fail "docker: the docker command is installed but the daemon is not reachable. Start the Docker daemon and run this script again, or if this is a podman shim, $PASTE_IN_POINTER. Nothing was changed."
  fi
  compose_version=$(docker_compose_version)
  if [ -z "$compose_version" ]; then
    install_docker_engine
    return 0
  fi
  compose_version_is_supported "$compose_version" \
    || fail "docker: Compose $compose_version is older than 2.23, which the production stack needs. Upgrade the Compose plugin yourself; this script does not change an existing Docker install."
  info_ok "docker: Docker and Compose $compose_version are working, nothing to install"
}

print_group_step() {
  if [ -z "${SUDO_USER:-}" ] || [ "$SUDO_USER" = root ]; then
    return 0
  fi
  if id -nG "$SUDO_USER" | tr " " "\n" | grep -qx docker; then
    return 0
  fi
  printf "note  docker group: %s is not in the docker group. To run docker without sudo, run: sudo usermod -aG docker %s (then log in again)\n" "$SUDO_USER" "$SUDO_USER"
}

fetch_docker_key() {
  key_url=$1
  key_file=$2
  expected_fingerprint=$3
  curl -fsSL -o "$key_file" "$key_url" || fail "docker key: could not download $key_url"
  key_listing=$(gpg --show-keys --with-colons "$key_file") \
    || fail "docker key: $key_url is not a readable OpenPGP key, nothing was installed"
  key_count=$(printf '%s\n' "$key_listing" | awk -F: '$1 == "pub" { count++ } END { print count + 0 }')
  [ "$key_count" -eq 1 ] \
    || fail "docker key: $key_url holds $key_count keys, expected exactly one, nothing was installed"
  actual_fingerprint=$(printf '%s\n' "$key_listing" | awk -F: '$1 == "fpr" { print $10; exit }')
  [ "$actual_fingerprint" = "$expected_fingerprint" ] \
    || fail "docker key: fingerprint $actual_fingerprint from $key_url does not match the pinned $expected_fingerprint, nothing was installed"
}

docker_repo_distro() {
  case " $os_id $os_id_like " in
    *" ubuntu "*) printf '%s\n' ubuntu ;;
    *) printf '%s\n' debian ;;
  esac
}

debian_codename() {
  if [ "$(docker_repo_distro)" = ubuntu ]; then
    os_release_value UBUNTU_CODENAME
  else
    os_release_value VERSION_CODENAME
  fi
}

write_docker_apt_source() {
  printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.asc] %s/%s %s stable\n' \
    "$(dpkg --print-architecture)" "$DOCKER_DOWNLOAD_URL" "$1" "$2" > /etc/apt/sources.list.d/docker.list
}

write_docker_yum_repo() {
  cat > /etc/yum.repos.d/docker-ce.repo <<EOF
[docker-ce-stable]
name=Docker CE Stable
baseurl=$DOCKER_DOWNLOAD_URL/$1/\$releasever/\$basearch/stable
enabled=1
gpgcheck=1
gpgkey=file:///etc/pki/rpm-gpg/RPM-GPG-KEY-docker-ce
EOF
}

start_docker_service() {
  if [ -d /run/systemd/system ]; then
    systemctl enable --now docker
  fi
}

install_docker_debian() {
  distro=$(docker_repo_distro)
  codename=$(debian_codename)
  [ -n "$codename" ] || fail "docker: no release codename in $os_release_file for $os_id"
  key_dir=$(mktemp -d)
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  fetch_docker_key "$DOCKER_DOWNLOAD_URL/$distro/gpg" "$key_dir/docker.asc" "$DOCKER_DEB_FINGERPRINT"
  install -d -m 0755 /etc/apt/keyrings
  install -m 0644 "$key_dir/docker.asc" /etc/apt/keyrings/docker.asc
  write_docker_apt_source "$distro" "$codename"
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  start_docker_service
  rm -rf "$key_dir"
}

install_docker_rpm() {
  repo_path=$1
  key_dir=$(mktemp -d)
  dnf install -y ca-certificates gnupg2
  fetch_docker_key "$DOCKER_DOWNLOAD_URL/$repo_path/gpg" "$key_dir/docker.asc" "$DOCKER_RPM_FINGERPRINT"
  install -m 0644 "$key_dir/docker.asc" /etc/pki/rpm-gpg/RPM-GPG-KEY-docker-ce
  rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-docker-ce
  write_docker_yum_repo "$repo_path"
  dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  start_docker_service
  rm -rf "$key_dir"
}

install_docker_fedora() {
  install_docker_rpm fedora
}

install_docker_rhel() {
  install_docker_rpm "$os_id"
}

resolve_release_repository() {
  repository=${OFFGRID_RELEASE_REPOSITORY:-$DEFAULT_RELEASE_REPOSITORY}
  printf '%s\n' "$repository" | grep -Eq "$RELEASE_REPOSITORY_PATTERN" \
    || fail "release: OFFGRID_RELEASE_REPOSITORY must be owner/name, got $repository"
  printf '%s\n' "$repository"
}

is_semver() {
  printf '%s\n' "$1" | grep -Eq "$SEMVER_PATTERN"
}

check_release_version() {
  is_semver "$1" || fail "release: $2 must be X.Y.Z, got $1"
  printf '%s\n' "$1"
}

read_pinned_version() {
  env_file=$install_home/.env
  [ -f "$env_file" ] || return 0
  sed -n 's/^OFFGRID_VERSION=//p' "$env_file" | tail -n 1
}

release_download_url() {
  repository=$(resolve_release_repository)
  if [ -n "$1" ]; then
    printf 'https://github.com/%s/releases/download/v%s\n' "$repository" "$1"
  else
    printf 'https://github.com/%s/releases/latest/download\n' "$repository"
  fi
}

download_release_file() {
  curl -fsSL --proto '=https' --proto-redir '=https' --tlsv1.2 -o "$3/$2" "$1/$2" \
    || fail "release: could not download $2 from $1. Check that the release exists and has this file; nothing was installed"
}

manifest_version() {
  version=$(sed -n 's/^  "version": "\([^"]*\)".*/\1/p' "$1" | head -n 1)
  check_release_version "$version" "the release manifest version"
}

resolve_release_version() {
  staging_dir=$1
  if [ -n "${OFFGRID_VERSION:-}" ]; then
    check_release_version "${OFFGRID_VERSION#v}" OFFGRID_VERSION
    return 0
  fi
  pinned=$(read_pinned_version)
  if [ -n "$pinned" ]; then
    check_release_version "$pinned" "OFFGRID_VERSION in $install_home/.env"
    return 0
  fi
  download_release_file "$(release_download_url "")" release-manifest.json "$staging_dir"
  manifest_version "$staging_dir/release-manifest.json"
}

download_release_files() {
  base_url=$(release_download_url "$2")
  download_release_file "$base_url" docker-compose.production.yml "$1"
  download_release_file "$base_url" production.env.example "$1"
  download_release_file "$base_url" SHA256SUMS "$1"
}

verify_release_file() {
  expected=$(awk -v name="$2" '$2 == name && length($1) == 64 && $1 ~ /^[0-9a-f]+$/ { print $1 }' "$1/SHA256SUMS")
  actual=$(sha256sum "$1/$2" | cut -d ' ' -f 1)
  [ -n "$expected" ] && [ "$actual" = "$expected" ] \
    || fail "checksum: $2 is missing from SHA256SUMS or does not match it, nothing was installed"
}

verify_release_files() {
  verify_release_file "$1" docker-compose.production.yml
  verify_release_file "$1" production.env.example
}

write_pinned_env() {
  temporary=$3/env.tmp
  if grep -q '^OFFGRID_VERSION=' "$1"; then
    sed "s/^OFFGRID_VERSION=.*/OFFGRID_VERSION=$2/" "$1" > "$temporary"
  else
    { cat "$1"; printf 'OFFGRID_VERSION=%s\n' "$2"; } > "$temporary"
  fi
  mv "$temporary" "$4"
}

create_env_file_if_missing() {
  [ -e "$install_home/.env" ] && return 0
  write_pinned_env "$1/production.env.example" "$2" "$1" "$install_home/.env"
  info_ok "config: created $install_home/.env from production.env.example, pinned to $2"
}

pin_env_version() {
  write_pinned_env "$install_home/.env" "$2" "$1" "$install_home/.env"
}

compose_command() {
  compose_file=$1
  shift
  OFFGRID_VERSION=$release_version docker compose --project-name offgrid --project-directory "$install_home" \
    --env-file "$install_home/.env" -f "$compose_file" "$@"
}

pull_images() {
  compose_command "$1" pull \
    || fail "images: could not pull the Offgrid $release_version images. Check the network, and that the ghcr.io packages are public (see CONTRIBUTING.md, Cutting a release)"
}

wait_failed_message() {
  printf 'FAIL stack: Offgrid %s is not healthy after %s seconds. The stack was left as it is. Look at it with: cd %s && docker compose --project-name offgrid ps, and docker compose --project-name offgrid logs --tail 50. Run this script again once the cause is fixed.\n' \
    "$release_version" "$WAIT_TIMEOUT_SECONDS" "$install_home" >&2
  exit 1
}

start_stack() {
  compose_command "$1" up -d --wait --wait-timeout "$WAIT_TIMEOUT_SECONDS" || wait_failed_message
}

version_number() {
  major=${1%%.*}
  rest=${1#*.}
  minor=${rest%%.*}
  patch=${rest#*.}
  printf '%s\n' $((major * 1000000000000 + minor * 1000000 + patch))
}

version_order() {
  first=$(version_number "$1")
  second=$(version_number "$2")
  if [ "$first" -gt "$second" ]; then
    printf '%s\n' gt
  elif [ "$first" -eq "$second" ]; then
    printf '%s\n' eq
  else
    printf '%s\n' lt
  fi
}

installed_version() {
  container=$(compose_command "$1" ps -a -q server)
  [ -n "$container" ] || return 0
  image=$(docker inspect --format '{{.Config.Image}}' "$container")
  check_release_version "${image##*:}" "the installed server image tag"
}

adopt_release_files() {
  mv "$1/docker-compose.production.yml" "$install_home/docker-compose.production.yml"
  mv "$1/production.env.example" "$install_home/production.env.example"
}

ensure_pin() {
  if [ "$(read_pinned_version)" != "$release_version" ]; then
    pin_env_version "$1" "$release_version"
  fi
}

refuse_downgrade() {
  if [ -n "${OFFGRID_VERSION:-}" ]; then
    fail "downgrade: OFFGRID_VERSION $release_version is older than the installed Offgrid $1. Downgrades are not supported, nothing was changed"
  fi
  pin_env_version "$2" "$1"
  release_version=$1
  info_ok "stack: .env pin was older than the installed Offgrid $1, corrected it to $1. Nothing was pulled or restarted"
}

reconcile_stack() {
  installed=$(installed_version "$1/docker-compose.production.yml")
  if [ -z "$installed" ]; then
    adopt_release_files "$1"
    ensure_pin "$1"
    pull_images "$install_home/docker-compose.production.yml"
    start_stack "$install_home/docker-compose.production.yml"
    return 0
  fi
  case $(version_order "$release_version" "$installed") in
    eq)
      adopt_release_files "$1"
      ensure_pin "$1"
      start_stack "$install_home/docker-compose.production.yml"
      ;;
    gt)
      adopt_release_files "$1"
      ensure_pin "$1"
      pull_images "$install_home/docker-compose.production.yml"
      start_stack "$install_home/docker-compose.production.yml"
      ;;
    lt)
      refuse_downgrade "$installed" "$1"
      ;;
  esac
}

run_install() {
  require_command curl curl
  require_command sha256sum coreutils
  install_home=$(resolve_install_home)
  mkdir -p "$install_home"
  staging_dir=$(mktemp -d "$install_home/.install.XXXXXX")
  trap 'rm -rf "$staging_dir"' EXIT
  release_version=$(resolve_release_version "$staging_dir")
  download_release_files "$staging_dir" "$release_version"
  verify_release_files "$staging_dir"
  create_env_file_if_missing "$staging_dir" "$release_version"
  reconcile_stack "$staging_dir"
  print_next_steps
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "tools: $1 is not installed. Install the $2 package and run this script again"
}

first_non_loopback_address() {
  address=$(hostname -I 2>/dev/null | tr ' ' '\n' | grep -Ev '^(127\.|::1$)|^$' | head -n 1)
  printf '%s\n' "${address:-localhost}"
}

print_next_steps() {
  web_port=$(sed -n 's/^OFFGRID_WEB_PORT=//p' "$install_home/.env" | tail -n 1)
  info_ok "stack: Offgrid $release_version is running"
  printf 'Open Offgrid: http://%s:%s\n' "$(first_non_loopback_address)" "${web_port:-8080}"
  printf '%s\n' 'Next: open that address and create the admin account (the first account becomes the admin).'
  printf '%s\n' 'Back up: see infra/README.md, Backups'
}

main() {
  umask 022
  require_root
  detect_architecture
  detect_os_family
  check_disk_space
  check_docker
  if [ "${OFFGRID_INSTALL_PREREQUISITES_ONLY:-0}" = 1 ]; then
    return 0
  fi
  run_install
  print_group_step
}

if [ "${OFFGRID_INSTALL_SOURCE_ONLY:-0}" != 1 ]; then
  main "$@"
fi
