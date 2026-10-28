// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

import { findUnsigned } from "./check-dco.mjs";

const SCRIPT = fileURLToPath(new URL("./check-dco.mjs", import.meta.url));
const AUTHOR = { name: "Test Author", email: "author@example.com" };

describe("check-dco", () => {
  let repo;
  let base;

  const git = (args) =>
    execFileSync("git", args, {
      cwd: repo,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: AUTHOR.name,
        GIT_AUTHOR_EMAIL: AUTHOR.email,
        GIT_COMMITTER_NAME: AUTHOR.name,
        GIT_COMMITTER_EMAIL: AUTHOR.email,
      },
    }).trimEnd();

  const commit = (message) => {
    git(["commit", "--allow-empty", "-m", message]);
    return git(["rev-parse", "HEAD"]);
  };

  before(() => {
    repo = mkdtempSync(join(tmpdir(), "og-18-dco-"));
    git(["init", "-q"]);
    base = commit("base");
  });

  after(() => {
    rmSync(repo, { recursive: true, force: true });
  });

  it("rejects a commit without a Signed-off-by trailer", () => {
    const unsigned = commit("feat: no sign-off");
    assert.deepEqual(
      findUnsigned(`${base}..HEAD`, (args) => git(args)),
      [unsigned],
    );
  });

  it("accepts a commit whose Signed-off-by names the author", () => {
    const signed = commit(`feat: signed off\n\nSigned-off-by: ${AUTHOR.name} <${AUTHOR.email}>`);
    assert.ok(!findUnsigned(`${base}..HEAD`, (args) => git(args)).includes(signed));
  });

  it("rejects a sign-off that names someone else", () => {
    const wrong = commit("fix: signed by someone else\n\nSigned-off-by: Other <other@example.com>");
    assert.ok(findUnsigned(`${base}..HEAD`, (args) => git(args)).includes(wrong));
  });

  it("exits non-zero from the CLI when a commit is unsigned", () => {
    const result = spawnSync(process.execPath, [SCRIPT, `${base}..HEAD`], {
      cwd: repo,
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /lack a Signed-off-by trailer/);
  });
});
