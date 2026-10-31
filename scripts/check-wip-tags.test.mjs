// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, describe, it } from "node:test";
import assert from "node:assert/strict";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "check-wip-tags.mjs");
const FEATURE = "e2e/features/family/create-family.feature";
const WIP_FEATURE = "@smoke @module:family @wip\nFeature: Create a family\n";
const DONE_FEATURE = "@smoke\nFeature: Health\n";
const OPEN_SECTION = "## Open `@wip` scenarios";
const GIT_IDENTITY = ["-c", "user.name=test", "-c", "user.email=test@example.com"];

const tempDirs = [];
after(() => {
  for (const dir of tempDirs) {
    rmSync(dir, { recursive: true, force: true });
  }
});

function git(cwd, args) {
  const result = spawnSync("git", [...GIT_IDENTITY, ...args], { cwd, encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
}

function repoWithFeature(content) {
  const dir = mkdtempSync(join(tmpdir(), "check-wip-tags-"));
  tempDirs.push(dir);
  git(dir, ["init", "-q", "-b", "main"]);
  git(dir, ["commit", "-q", "--allow-empty", "-m", "base"]);
  git(dir, ["checkout", "-q", "-b", "feature"]);
  mkdirSync(join(dir, dirname(FEATURE)), { recursive: true });
  writeFileSync(join(dir, FEATURE), content);
  git(dir, ["add", "."]);
  git(dir, ["commit", "-q", "-m", "feature"]);
  return dir;
}

function runCheck(dir, prBody) {
  return spawnSync(process.execPath, [SCRIPT], {
    cwd: dir,
    env: { ...process.env, BASE_REF: "main", PR_BODY: prBody },
    encoding: "utf8",
  });
}

describe("check-wip-tags", () => {
  it("passes when no changed feature carries @wip", () => {
    const dir = repoWithFeature(DONE_FEATURE);
    const result = runCheck(dir, "");
    assert.equal(result.status, 0, result.stderr);
  });

  it("fails a changed @wip feature that the PR body does not name", () => {
    const dir = repoWithFeature(WIP_FEATURE);
    const result = runCheck(dir, `${OPEN_SECTION}\n\nNone\n\n## How it was tested\n`);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /create-family\.feature/);
  });

  it("passes when the open-scenarios section names the file", () => {
    const dir = repoWithFeature(WIP_FEATURE);
    const body = `${OPEN_SECTION}\n\n- ${FEATURE}: waiting on the family API\n\n## How it was tested\n`;
    assert.equal(runCheck(dir, body).status, 0);
  });

  it("accepts the bare file name in the open-scenarios section", () => {
    const dir = repoWithFeature(WIP_FEATURE);
    const body = `${OPEN_SECTION}\n\n- create-family.feature, blocked\n`;
    assert.equal(runCheck(dir, body).status, 0);
  });

  it("does not accept a name that only contains the file name", () => {
    const dir = repoWithFeature(WIP_FEATURE);
    const body = `${OPEN_SECTION}\n\n- old-create-family.feature\n`;
    assert.equal(runCheck(dir, body).status, 1);
  });

  it("does not accept a mention outside the open-scenarios section", () => {
    const dir = repoWithFeature(WIP_FEATURE);
    const body = `## Summary\n\nTouches ${FEATURE}\n\n${OPEN_SECTION}\n\nNone\n`;
    assert.equal(runCheck(dir, body).status, 1);
  });

  it("ignores @wip in text that is not a tag line", () => {
    const dir = repoWithFeature("@smoke\nFeature: Health\n  Scenario: note @wip\n");
    assert.equal(runCheck(dir, "").status, 0);
  });
});
