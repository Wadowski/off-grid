// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { chmodSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";

import { checkAgentConfig, parseFrontmatter } from "./check-agent-config.mjs";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SETTINGS = {
  hooks: {
    PreToolUse: [
      {
        matcher: "Edit|Write",
        hooks: [{ type: "command", command: '"$CLAUDE_PROJECT_DIR"/.claude/hooks/guard.mjs' }],
      },
    ],
  },
};

// Writes a small, valid agent configuration under `root`.
function writeValidFixture(root) {
  const write = (relPath, content) => {
    mkdirSync(dirname(join(root, relPath)), { recursive: true });
    writeFileSync(join(root, relPath), content);
  };
  write(".claude/settings.json", JSON.stringify(SETTINGS));
  write(".claude/hooks/guard.mjs", "#!/usr/bin/env node\n");
  chmodSync(join(root, ".claude/hooks/guard.mjs"), 0o755);
  write(".claude/rules/source.md", '---\npaths:\n  - "src/**"\n---\n\n# Rules\n');
  mkdirSync(join(root, ".claude/agents"), { recursive: true });
  write(
    ".claude/skills/review/SKILL.md",
    "---\nname: review\ndescription: Review a change.\n---\n",
  );
  write("src/index.ts", "export {};\n");
}

describe("parseFrontmatter", () => {
  it("reads scalar fields and a paths list", () => {
    const fields = parseFrontmatter('---\nname: a\npaths:\n  - "x/**"\n  - y/*.ts\n---\nbody');
    assert.deepEqual(fields, { name: "a", paths: ["x/**", "y/*.ts"] });
  });

  it("returns null without frontmatter", () => {
    assert.equal(parseFrontmatter("# no frontmatter"), null);
  });
});

describe("checkAgentConfig", () => {
  let root;

  before(() => {
    root = mkdtempSync(join(tmpdir(), "og-26-config-"));
  });

  after(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("accepts a valid configuration", async () => {
    const fixture = mkdtempSync(join(root, "valid-"));
    writeValidFixture(fixture);
    assert.deepEqual(await checkAgentConfig(fixture), { errors: [], warnings: [] });
  });

  it("reports a hook script that is not executable", async () => {
    const fixture = mkdtempSync(join(root, "mode-"));
    writeValidFixture(fixture);
    chmodSync(join(fixture, ".claude/hooks/guard.mjs"), 0o644);
    const { errors } = await checkAgentConfig(fixture);
    assert.deepEqual(errors, ["hook script .claude/hooks/guard.mjs is not executable"]);
  });

  it("reports a hook script that does not exist", async () => {
    const fixture = mkdtempSync(join(root, "missing-"));
    writeValidFixture(fixture);
    writeFileSync(
      join(fixture, ".claude/settings.json"),
      JSON.stringify({
        hooks: { Stop: [{ hooks: [{ type: "command", command: ".claude/hooks/gone.mjs" }] }] },
      }),
    );
    const { errors } = await checkAgentConfig(fixture);
    assert.deepEqual(errors, ["hook script .claude/hooks/gone.mjs does not exist"]);
  });

  it("reports settings.json that is not valid JSON", async () => {
    const fixture = mkdtempSync(join(root, "json-"));
    writeValidFixture(fixture);
    writeFileSync(join(fixture, ".claude/settings.json"), "{ not json");
    const { errors } = await checkAgentConfig(fixture);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /not valid JSON/);
  });

  it("reports a rule without a paths list", async () => {
    const fixture = mkdtempSync(join(root, "rule-"));
    writeValidFixture(fixture);
    writeFileSync(join(fixture, ".claude/rules/source.md"), "# Rules without frontmatter\n");
    const { errors } = await checkAgentConfig(fixture);
    assert.deepEqual(errors, [
      ".claude/rules/source.md needs frontmatter with a non-empty paths list",
    ]);
  });

  it("warns, without failing, on a paths glob that matches nothing yet", async () => {
    const fixture = mkdtempSync(join(root, "glob-"));
    writeValidFixture(fixture);
    writeFileSync(
      join(fixture, ".claude/rules/source.md"),
      '---\npaths:\n  - "modules/*/src/events/**"\n---\n',
    );
    const { errors, warnings } = await checkAgentConfig(fixture);
    assert.deepEqual(errors, []);
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /matches no file yet/);
  });

  it("reports a skill whose name does not match its folder, and a missing description", async () => {
    const fixture = mkdtempSync(join(root, "skill-"));
    writeValidFixture(fixture);
    writeFileSync(join(fixture, ".claude/skills/review/SKILL.md"), "---\nname: reviews\n---\n");
    const { errors } = await checkAgentConfig(fixture);
    assert.deepEqual(errors, [
      '.claude/skills/review/SKILL.md name must be "review"',
      ".claude/skills/review/SKILL.md needs a description",
    ]);
  });

  it("reports an agent whose name does not match its file, and a missing description or tools list", async () => {
    const fixture = mkdtempSync(join(root, "agent-meta-"));
    writeValidFixture(fixture);
    writeFileSync(join(fixture, ".claude/agents/reviewer.md"), "---\nname: other\n---\n");
    const { errors } = await checkAgentConfig(fixture);
    assert.deepEqual(errors, [
      ".claude/agents/reviewer.md name must match the file name",
      ".claude/agents/reviewer.md needs a description",
      ".claude/agents/reviewer.md needs a tools list",
    ]);
  });

  it("reports a review agent that is given write or network tools", async () => {
    const fixture = mkdtempSync(join(root, "agent-tools-"));
    writeValidFixture(fixture);
    writeFileSync(
      join(fixture, ".claude/agents/reviewer.md"),
      "---\nname: reviewer\ndescription: Reviews.\ntools: Read, Grep, Edit, WebFetch\n---\n",
    );
    const { errors } = await checkAgentConfig(fixture);
    assert.deepEqual(errors, [
      ".claude/agents/reviewer.md must not use the Edit tool",
      ".claude/agents/reviewer.md must not use the WebFetch tool",
    ]);
  });

  it("accepts a read-only review agent", async () => {
    const fixture = mkdtempSync(join(root, "agent-ok-"));
    writeValidFixture(fixture);
    writeFileSync(
      join(fixture, ".claude/agents/reviewer.md"),
      "---\nname: reviewer\ndescription: Reviews.\ntools: Read, Grep, Glob, Bash\n---\n",
    );
    assert.deepEqual(await checkAgentConfig(fixture), { errors: [], warnings: [] });
  });

  it("passes on this repository", async () => {
    const { errors } = await checkAgentConfig(REPO);
    assert.deepEqual(errors, []);
  });
});
