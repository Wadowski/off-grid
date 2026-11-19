// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const SCRIPT = fileURLToPath(new URL("../infra/install/install.sh", import.meta.url));
const FIXTURES = fileURLToPath(new URL("./fixtures/os-release/", import.meta.url));
const GIB_IN_KIB = 1024 * 1024;

const OS_FAMILIES = {
  "debian-12": "debian",
  "ubuntu-24.04": "debian",
  "linuxmint-22": "debian",
  "fedora-41": "fedora",
  "rhel-9": "rhel",
  "centos-9": "rhel",
};
const UNSUPPORTED_FIXTURES = ["rocky-9", "alma-9", "alpine-3", "arch"];

function withWorkspace(run) {
  const root = mkdtempSync(join(tmpdir(), "offgrid-install-"));
  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeStubs(root, stubs) {
  const binDir = join(root, "bin");
  mkdirSync(binDir, { recursive: true });
  for (const [name, body] of Object.entries(stubs)) {
    const path = join(binDir, name);
    writeFileSync(path, `#!/bin/sh\n${body}\n`);
    chmodSync(path, 0o755);
  }
  return binDir;
}

function callFunction(name, { args = [], env = {}, stubs = {}, root, prelude = ":" } = {}) {
  const run = (workspace) => {
    const binDir = writeStubs(workspace, stubs);
    return spawnSync("sh", ["-c", `. "$1"; shift; ${prelude}; "$@"`, "sh", SCRIPT, name, ...args], {
      encoding: "utf8",
      env: {
        ...process.env,
        ...env,
        OFFGRID_INSTALL_SOURCE_ONLY: "1",
        PATH: `${binDir}:${process.env.PATH}`,
      },
    });
  };
  return root ? run(root) : withWorkspace(run);
}

function runScript(env, stubs = {}) {
  return withWorkspace((root) => {
    const binDir = writeStubs(root, stubs);
    return spawnSync("sh", [SCRIPT], {
      encoding: "utf8",
      env: { ...process.env, ...env, PATH: `${binDir}:${process.env.PATH}` },
    });
  });
}

function stubUid(uid) {
  return { id: `[ "$1" = -u ] && echo ${uid}` };
}

function stubArchitecture(machine) {
  return { uname: `echo ${machine}` };
}

function stubDiskAvailableKib(kib) {
  return {
    df: [
      "for probe; do :; done",
      "printf 'Filesystem 1024-blocks Used Available Capacity Mounted on\\n'",
      `printf '/dev/test 1 1 ${kib} 1%% %s\\n' "$probe"`,
    ].join("\n"),
  };
}

test("refuses to run without root and suggests sudo", () => {
  const result = callFunction("require_root", { stubs: stubUid(1000) });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /sudo/);
});

test("accepts root and prints one check line", () => {
  const result = callFunction("require_root", { stubs: stubUid(0) });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim().split("\n").length, 1);
  assert.match(result.stdout, /^ok {2}root: /);
});

for (const [fixture, family] of Object.entries(OS_FAMILIES)) {
  test(`maps ${fixture} to the ${family} family`, () => {
    const result = callFunction("detect_os_family", {
      env: { OFFGRID_OS_RELEASE_FILE: join(FIXTURES, fixture) },
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim().split("\n").length, 1);
    assert.match(result.stdout, new RegExp(`^ok {2}os: .* ${family} family$`, "m"));
  });
}

for (const fixture of UNSUPPORTED_FIXTURES) {
  test(`rejects ${fixture} with the supported list and the paste-in pointer`, () => {
    const result = callFunction("detect_os_family", {
      env: { OFFGRID_OS_RELEASE_FILE: join(FIXTURES, fixture) },
    });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Supported systems: .*RHEL.*CentOS.*Fedora.*Debian.*Ubuntu/);
    assert.match(result.stderr, /docker-compose\.production\.yml/);
  });
}

test("reads os-release values without executing the file", () => {
  withWorkspace((root) => {
    const marker = join(root, "executed");
    const osRelease = join(root, "os-release");
    writeFileSync(osRelease, `ID=debian\nTOUCH=$(touch ${marker})\n`);

    const result = callFunction("detect_os_family", {
      root,
      env: { OFFGRID_OS_RELEASE_FILE: osRelease },
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(spawnSync("test", ["-e", marker]).status, 1, "os-release content was executed");
  });
});

for (const [machine, label] of [
  ["x86_64", "amd64"],
  ["aarch64", "arm64"],
]) {
  test(`accepts ${machine} as ${label}`, () => {
    const result = callFunction("detect_architecture", { stubs: stubArchitecture(machine) });

    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /^ok {2}architecture: /);
  });
}

for (const machine of ["armv7l", "riscv64", "i686"]) {
  test(`rejects unsupported architecture ${machine}`, () => {
    const result = callFunction("detect_architecture", { stubs: stubArchitecture(machine) });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /architecture/);
  });
}

test("rejects an install directory with less than 2 GB free", () => {
  const result = callFunction("check_disk_space", {
    env: { OFFGRID_INSTALL_DIR: "/opt/offgrid" },
    stubs: stubDiskAvailableKib(GIB_IN_KIB),
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /disk: .*2 GB/);
});

test("accepts an install directory with 3 GB free and prints one check line", () => {
  const result = callFunction("check_disk_space", {
    env: { OFFGRID_INSTALL_DIR: "/opt/offgrid" },
    stubs: stubDiskAvailableKib(3 * GIB_IN_KIB),
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim().split("\n").length, 1);
  assert.match(result.stdout, /^ok {2}disk: /);
});

test("checks the nearest existing parent when the install directory does not exist yet", () => {
  withWorkspace((root) => {
    const missing = join(root, "not", "yet", "created");

    const result = callFunction("check_disk_space", {
      root,
      env: { OFFGRID_INSTALL_DIR: missing },
      stubs: stubDiskAvailableKib(3 * GIB_IN_KIB),
    });

    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes(root), result.stdout);
    assert.ok(!result.stdout.includes(missing), result.stdout);
  });
});

test("rejects a relative OFFGRID_INSTALL_DIR", () => {
  const result = callFunction("check_disk_space", {
    env: { OFFGRID_INSTALL_DIR: "relative/offgrid" },
    stubs: stubDiskAvailableKib(3 * GIB_IN_KIB),
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /absolute path/);
});

const INSTALL_MARKER = "INSTALL_BRANCH_CHOSEN";
const installStub = `install_docker_debian() { printf '%s\\n' ${INSTALL_MARKER}; }`;

function stubDocker({ info = 0, compose = "2.27.0" } = {}) {
  const composeBody =
    compose === null ? "exit 1" : `echo ${compose}`;
  return {
    docker: [
      'case "$1" in',
      `  info) exit ${info} ;;`,
      `  compose) ${composeBody} ;;`,
      "esac",
    ].join("\n"),
  };
}

test("reports Docker and Compose as working and installs nothing", () => {
  const result = callFunction("check_docker", {
    prelude: `os_family=debian; ${installStub}`,
    stubs: stubDocker(),
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim().split("\n").length, 1);
  assert.match(result.stdout, /^ok {2}docker: .*nothing to install/);
  assert.ok(!result.stdout.includes(INSTALL_MARKER));
});

for (const [label, stubs] of [
  ["the daemon is not reachable", stubDocker({ info: 1 })],
  ["the Compose plugin is missing", stubDocker({ compose: null })],
]) {
  test(`runs the install branch when ${label}`, () => {
    const result = callFunction("check_docker", {
      prelude: `os_family=debian; ${installStub}`,
      stubs,
    });

    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.includes(INSTALL_MARKER), result.stdout);
  });
}

test("fails without changing an install when Compose is older than 2.23", () => {
  const result = callFunction("check_docker", {
    prelude: `os_family=debian; ${installStub}`,
    stubs: stubDocker({ compose: "2.22.1" }),
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /2\.22\.1.*2\.23/);
  assert.ok(!result.stdout.includes(INSTALL_MARKER));
});

for (const [version, supported] of [
  ["2.23.0", true],
  ["v2.23.0", true],
  ["2.27.0", true],
  ["3.0.0", true],
  ["10.1.0", true],
  ["2.22.9", false],
  ["1.29.2", false],
]) {
  test(`compose ${version} supported: ${supported}`, () => {
    const result = callFunction("compose_version_is_supported", { args: [version.replace(/^v/, "")] });

    assert.equal(result.status === 0, supported, result.stderr);
  });
}

test("prints the usermod step for a sudo user outside the docker group", () => {
  const result = callFunction("print_group_step", {
    env: { SUDO_USER: "alice" },
    stubs: { id: 'echo "alice users wheel"', usermod: "touch \"$OFFGRID_TEST_MARKER\"" },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /usermod -aG docker alice/);
});

test("never runs usermod itself", () => {
  withWorkspace((root) => {
    const marker = join(root, "usermod-ran");
    const result = callFunction("print_group_step", {
      root,
      env: { SUDO_USER: "alice", OFFGRID_TEST_MARKER: marker },
      stubs: { id: 'echo "alice users"', usermod: `touch "${marker}"` },
    });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(spawnSync("test", ["-e", marker]).status, 1, "usermod was invoked");
  });
});

test("prints nothing when the sudo user is already in the docker group", () => {
  const result = callFunction("print_group_step", {
    env: { SUDO_USER: "alice" },
    stubs: { id: 'echo "alice users docker"' },
  });

  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout, "");
});

for (const sudoUser of [undefined, "root"]) {
  test(`prints nothing when SUDO_USER is ${sudoUser ?? "unset"}`, () => {
    const env = sudoUser === undefined ? {} : { SUDO_USER: sudoUser };
    const result = callFunction("print_group_step", { env, stubs: { id: 'echo "users"' } });

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "");
  });
}
