// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  chmodSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCRIPT = join(ROOT, "infra", "compose", "set-latest-version.sh");
const RELEASE_JSON = (tag) => `{\n  "tag_name": "${tag}",\n  "name": "OffGrid"\n}\n`;
const FAKE_CURL = `#!/bin/sh
printf '%s\\n' "$*" > "$FAKE_CURL_ARGS"
if [ "\${FAKE_CURL_FAIL:-}" = 1 ]; then
  exit 22
fi
printf '%s' "$FAKE_CURL_BODY"
`;

const sandbox = () => {
  const directory = mkdtempSync(join(tmpdir(), "og169-latest-"));
  const binDirectory = join(directory, "bin");
  mkdirSync(binDirectory);
  const curlPath = join(binDirectory, "curl");
  writeFileSync(curlPath, FAKE_CURL);
  chmodSync(curlPath, 0o755);
  return {
    binDirectory,
    argsFile: join(directory, "curl-args.txt"),
    envFile: join(directory, "production.env"),
  };
};

const runScript = (sandboxState, { args, body = RELEASE_JSON("v1.2.3"), fail = false } = {}) =>
  spawnSync("sh", [SCRIPT, ...(args ?? ["--env-file", sandboxState.envFile])], {
    encoding: "utf8",
    env: {
      ...process.env,
      PATH: `${sandboxState.binDirectory}:${process.env.PATH}`,
      FAKE_CURL_ARGS: sandboxState.argsFile,
      FAKE_CURL_BODY: body,
      FAKE_CURL_FAIL: fail ? "1" : "",
    },
  });

const withEnvFile = (content) => {
  const state = sandbox();
  writeFileSync(state.envFile, content);
  return state;
};

describe("set-latest-version", () => {
  it("writes the concrete version of the latest release tag without the v prefix", () => {
    const state = withEnvFile("OFFGRID_WEB_PORT=8080\nOFFGRID_VERSION=\n");

    const result = runScript(state);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout, "1.2.3\n");
    assert.equal(
      readFileSync(state.envFile, "utf8"),
      "OFFGRID_WEB_PORT=8080\nOFFGRID_VERSION=1.2.3\n",
    );
  });

  it("appends the version when the env file has no OFFGRID_VERSION line", () => {
    const state = withEnvFile("OFFGRID_WEB_PORT=8080\n");

    assert.equal(runScript(state).status, 0);
    assert.equal(
      readFileSync(state.envFile, "utf8"),
      "OFFGRID_WEB_PORT=8080\nOFFGRID_VERSION=1.2.3\n",
    );
  });

  it("replaces an existing version and keeps the other lines", () => {
    const state = withEnvFile("OFFGRID_VERSION=1.0.0\nTZ=UTC\n");

    assert.equal(runScript(state, { body: RELEASE_JSON("v2.0.1") }).status, 0);
    assert.equal(readFileSync(state.envFile, "utf8"), "OFFGRID_VERSION=2.0.1\nTZ=UTC\n");
  });

  it("reads the release repository from the env file", () => {
    const state = withEnvFile("OFFGRID_RELEASE_REPOSITORY=example/fork\nOFFGRID_VERSION=\n");

    assert.equal(runScript(state).status, 0);
    assert.match(readFileSync(state.argsFile, "utf8"), /repos\/example\/fork\/releases\/latest/);
  });

  it("falls back to the default release repository", () => {
    const state = withEnvFile("OFFGRID_VERSION=\n");

    assert.equal(runScript(state).status, 0);
    assert.match(
      readFileSync(state.argsFile, "utf8"),
      /repos\/Wadowski\/off-grid\/releases\/latest/,
    );
  });

  it("rejects the latest tag name and leaves the file unchanged", () => {
    const content = "OFFGRID_VERSION=\n";
    const state = withEnvFile(content);

    const result = runScript(state, { body: RELEASE_JSON("latest") });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /not a release version/);
    assert.equal(readFileSync(state.envFile, "utf8"), content);
  });

  it("rejects a release without a tag name", () => {
    const content = "OFFGRID_VERSION=\n";
    const state = withEnvFile(content);

    const result = runScript(state, { body: "{}" });

    assert.notEqual(result.status, 0);
    assert.equal(readFileSync(state.envFile, "utf8"), content);
  });

  it("rejects a tag that is not a full version", () => {
    const content = "OFFGRID_VERSION=\n";
    const state = withEnvFile(content);

    assert.notEqual(runScript(state, { body: RELEASE_JSON("v1.2") }).status, 0);
    assert.equal(readFileSync(state.envFile, "utf8"), content);
  });

  it("fails without writing when the GitHub call fails", () => {
    const content = "OFFGRID_VERSION=\n";
    const state = withEnvFile(content);

    const result = runScript(state, { fail: true });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /could not read the latest release of Wadowski\/off-grid/);
    assert.equal(readFileSync(state.envFile, "utf8"), content);
  });

  it("rejects a release repository with extra path segments or a query without calling GitHub", () => {
    for (const repository of ["Wadowski/off-grid/extra", "Wadowski/off-grid?per_page=1"]) {
      const content = `OFFGRID_RELEASE_REPOSITORY=${repository}\nOFFGRID_VERSION=\n`;
      const state = withEnvFile(content);

      const result = runScript(state);

      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /invalid release repository/);
      assert.equal(existsSync(state.argsFile), false);
      assert.equal(readFileSync(state.envFile, "utf8"), content);
    }
  });

  it("rejects an image owner that is not a single name without calling GitHub", () => {
    const content = "OFFGRID_IMAGE_OWNER=wadowski/evil\nOFFGRID_VERSION=\n";
    const state = withEnvFile(content);

    const result = runScript(state);

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /invalid image owner/);
    assert.equal(existsSync(state.argsFile), false);
    assert.equal(readFileSync(state.envFile, "utf8"), content);
  });

  it("requires the --env-file argument", () => {
    const state = withEnvFile("OFFGRID_VERSION=\n");

    const result = runScript(state, { args: [] });

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /usage: set-latest-version.sh --env-file/);
  });
});
