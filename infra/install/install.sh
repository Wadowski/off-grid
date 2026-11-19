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

check_disk_space() {
  install_dir=${OFFGRID_INSTALL_DIR:-$DEFAULT_INSTALL_DIR}
  case "$install_dir" in
    /*) ;;
    *) fail "disk: OFFGRID_INSTALL_DIR must be an absolute path, got $install_dir" ;;
  esac
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
  trap 'rm -rf "$key_dir"' EXIT
  apt-get update -qq
  apt-get install -y -qq ca-certificates curl gnupg
  fetch_docker_key "$DOCKER_DOWNLOAD_URL/$distro/gpg" "$key_dir/docker.asc" "$DOCKER_DEB_FINGERPRINT"
  install -d -m 0755 /etc/apt/keyrings
  install -m 0644 "$key_dir/docker.asc" /etc/apt/keyrings/docker.asc
  write_docker_apt_source "$distro" "$codename"
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  start_docker_service
}

install_docker_rpm() {
  repo_path=$1
  key_dir=$(mktemp -d)
  trap 'rm -rf "$key_dir"' EXIT
  dnf install -y ca-certificates gnupg2
  fetch_docker_key "$DOCKER_DOWNLOAD_URL/$repo_path/gpg" "$key_dir/docker.asc" "$DOCKER_RPM_FINGERPRINT"
  install -m 0644 "$key_dir/docker.asc" /etc/pki/rpm-gpg/RPM-GPG-KEY-docker-ce
  rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-docker-ce
  write_docker_yum_repo "$repo_path"
  dnf install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  start_docker_service
}

install_docker_fedora() {
  install_docker_rpm fedora
}

install_docker_rhel() {
  install_docker_rpm "$os_id"
}

main() {
  umask 022
  require_root
  detect_architecture
  detect_os_family
  check_disk_space
  check_docker
  print_group_step
}

if [ "${OFFGRID_INSTALL_SOURCE_ONLY:-0}" != 1 ]; then
  main "$@"
fi
