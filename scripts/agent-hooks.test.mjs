// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

import { checksEnv, pinnedNodeBin } from "../.claude/hooks/stop-checks.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const HOOKS = join(REPO, ".claude/hooks");

const ACCEPTED_ADR = [
  "# 0001. Example",
  "",
  "- **Status:** Accepted",
  "",
  "## Decision",
  "",
  "Keep it.",
  "",
].join("\n");

describe("stop-checks Node pinning", () => {
  let root;
  let nvmDir;
  const nodeBin = "versions/node/v24.22.1/bin";

  before(() => {
    root = mkdtempSync(join(tmpdir(), "og-26-nvmrc-"));
    nvmDir = mkdtempSync(join(tmpdir(), "og-26-nvm-"));
    writeFileSync(join(root, ".nvmrc"), "24.22.1\n");
    mkdirSync(join(nvmDir, nodeBin), { recursive: true });
  });

  after(() => {
    rmSync(root, { recursive: true, force: true });
    rmSync(nvmDir, { recursive: true, force: true });
  });

  it("finds the bin directory of the installed version named in .nvmrc", () => {
    assert.equal(pinnedNodeBin(root, nvmDir), join(nvmDir, nodeBin));
  });

  it("returns null when that version is not installed", () => {
    writeFileSync(join(root, ".nvmrc"), "20.14.0\n");
    assert.equal(pinnedNodeBin(root, nvmDir), null);
    writeFileSync(join(root, ".nvmrc"), "24.22.1\n");
  });

  it("puts the pinned Node first on PATH for the checks", () => {
    const env = checksEnv(root, { NVM_DIR: nvmDir, PATH: "/usr/bin" });
    assert.equal(env.PATH, `${join(nvmDir, nodeBin)}:/usr/bin`);
  });

  it("leaves the environment alone when the pinned Node is missing", () => {
    const base = { NVM_DIR: join(nvmDir, "missing"), PATH: "/usr/bin" };
    assert.equal(checksEnv(root, base), base);
  });
});

describe("agent hooks", () => {
  let project;

  before(() => {
    project = mkdtempSync(join(tmpdir(), "og-26-hooks-"));
    mkdirSync(join(project, "src"), { recursive: true });
    mkdirSync(join(project, "docs/adr"), { recursive: true });
    writeFileSync(join(project, "docs/adr/0001-example.md"), ACCEPTED_ADR);
    writeFileSync(join(project, "docs/adr/0002-draft.md"), "- **Status:** Proposed\n\nDraft.\n");
    symlinkSync(join(REPO, "node_modules"), join(project, "node_modules"));
    for (const file of ["eslint.config.js", ".prettierrc.json"]) {
      symlinkSync(join(REPO, file), join(project, file));
    }
  });

  after(() => {
    rmSync(project, { recursive: true, force: true });
  });

  const runHook = (name, input, env = {}) =>
    spawnSync(join(HOOKS, name), {
      input: JSON.stringify(input),
      encoding: "utf8",
      env: {
        ...process.env,
        OFFGRID_ALLOW_PROTECTED_EDITS: "",
        CLAUDE_PROJECT_DIR: project,
        ...env,
      },
    });

  const edit = (filePath, extra = {}) => ({
    tool_name: "Edit",
    tool_input: { file_path: filePath, old_string: "a", new_string: "b", ...extra },
  });

  describe("protect-files", () => {
    it("blocks an edit to LICENSE", () => {
      const result = runHook("protect-files.mjs", edit(join(project, "LICENSE")));
      assert.equal(result.status, 2);
      assert.match(result.stderr, /LICENSE is a protected file/);
    });

    it("allows an edit to an ordinary source file", () => {
      const result = runHook("protect-files.mjs", edit(join(project, "src/index.ts")));
      assert.equal(result.status, 0);
    });

    it("blocks a body edit to an Accepted ADR", () => {
      const result = runHook(
        "protect-files.mjs",
        edit(join(project, "docs/adr/0001-example.md"), {
          old_string: "Keep it.",
          new_string: "Drop it.",
        }),
      );
      assert.equal(result.status, 2);
      assert.match(result.stderr, /Accepted ADR/);
    });

    it("allows a status-only edit to an Accepted ADR", () => {
      const result = runHook(
        "protect-files.mjs",
        edit(join(project, "docs/adr/0001-example.md"), {
          old_string: "- **Status:** Accepted",
          new_string: "- **Status:** Superseded by 0009",
        }),
      );
      assert.equal(result.status, 0);
    });

    it("allows any edit to a Proposed ADR", () => {
      const result = runHook(
        "protect-files.mjs",
        edit(join(project, "docs/adr/0002-draft.md"), {
          old_string: "Draft.",
          new_string: "Revised.",
        }),
      );
      assert.equal(result.status, 0);
    });

    it("lets an explicitly requested change through with the override", () => {
      const result = runHook("protect-files.mjs", edit(join(project, "LICENSE")), {
        OFFGRID_ALLOW_PROTECTED_EDITS: "1",
      });
      assert.equal(result.status, 0);
    });
  });

  describe("format-file", () => {
    it("formats a changed TypeScript file with Prettier and ESLint", () => {
      const file = join(project, "src/format-me.ts");
      writeFileSync(file, "export const value   =   'text'\n");
      const result = runHook("format-file.mjs", {
        tool_name: "Write",
        tool_input: { file_path: file },
      });
      assert.equal(result.status, 0, result.stderr);
      assert.equal(readFileSync(file, "utf8"), 'export const value = "text";\n');
    });

    it("reports lint errors that remain after the fix", () => {
      const file = join(project, "src/unused.ts");
      writeFileSync(file, "const unused = 1;\nexport {};\n");
      const result = runHook("format-file.mjs", {
        tool_name: "Edit",
        tool_input: { file_path: file },
      });
      assert.equal(result.status, 2);
      assert.match(result.stderr, /eslint failed on src\/unused\.ts/);
    });
  });

  describe("stop-checks", () => {
    it("passes when every check succeeds", () => {
      const result = runHook(
        "stop-checks.mjs",
        { stop_hook_active: false },
        { OFFGRID_STOP_CHECKS: JSON.stringify([["node", ["-e", "process.exit(0)"]]]) },
      );
      assert.equal(result.status, 0);
    });

    it("blocks and reports output when a check fails", () => {
      const checks = [["node", ["-e", "console.log('boundary violation'); process.exit(1)"]]];
      const result = runHook(
        "stop-checks.mjs",
        { stop_hook_active: false },
        { OFFGRID_STOP_CHECKS: JSON.stringify(checks) },
      );
      assert.equal(result.status, 2);
      assert.match(result.stderr, /boundary violation/);
    });

    it("does not block again when a previous Stop block is already continuing", () => {
      const checks = [["node", ["-e", "process.exit(1)"]]];
      const result = runHook(
        "stop-checks.mjs",
        { stop_hook_active: true },
        { OFFGRID_STOP_CHECKS: JSON.stringify(checks) },
      );
      assert.equal(result.status, 0);
    });
  });
});
