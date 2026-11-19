#!/bin/sh
# SPDX-FileCopyrightText: 2026 Dominik Wadowski
# SPDX-License-Identifier: FSL-1.1-ALv2

set -eu

DEFAULT_INSTALL_DIR=/opt/offgrid
MINIMUM_FREE_KIB=2097152
KIB_PER_GIB=1048576
SUPPORTED_SYSTEMS="RHEL, CentOS Stream, Fedora, Debian, Ubuntu"
PASTE_IN_POINTER="install Docker yourself and follow the paste-in path in infra/README.md (infra/compose/docker-compose.production.yml)"

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
        *" debian "* | *" ubuntu "*) os_family=debian ;;
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

main() {
  require_root
  detect_architecture
  detect_os_family
  check_disk_space
}

if [ "${OFFGRID_INSTALL_SOURCE_ONLY:-0}" != 1 ]; then
  main "$@"
fi
