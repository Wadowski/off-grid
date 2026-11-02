#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// PreToolUse hook for Edit and Write. Blocks changes to files that guard the
// repository (licence, secret scanning, boundaries, CI, agent guardrails) and
// to Accepted ADRs, unless the user has asked for that change.
//
// Set OFFGRID_ALLOW_PROTECTED_EDITS=1 for the session when the user has asked
// for the change. Exit code 2 blocks the tool call and shows the message to
// the agent.

import { existsSync, readFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const PROTECTED_FILES = new Set([
  ".gitleaks.toml",
  "LICENSE",
  "NOTICE",
  "CODEOWNERS",
  ".github/CODEOWNERS",
  ".claude/settings.json",
]);

const PROTECTED_PREFIXES = [".claude/hooks/"];

const ADR_PATH = /^docs\/adr\/\d{4}-[^/]+\.md$/;
const STATUS_LINE = /\*\*Status:\*\*/;

export function protectedReason(relPath) {
  if (PROTECTED_FILES.has(relPath)) return `${relPath} is a protected file`;
  const prefix = PROTECTED_PREFIXES.find((p) => relPath.startsWith(p));
  if (prefix) return `${relPath} is under the protected path ${prefix}`;
  return null;
}

// True when the text differs from `before` only on the ADR status line.
export function onlyStatusChanged(before, after) {
  const body = (text) =>
    text
      .split("\n")
      .filter((line) => !STATUS_LINE.test(line))
      .join("\n");
  return body(before) === body(after);
}

export function adrReason(relPath, absPath, toolName, toolInput) {
  if (!ADR_PATH.test(relPath) || !existsSync(absPath)) return null;
  const current = readFileSync(absPath, "utf8");
  if (!/\*\*Status:\*\*\s*Accepted/.test(current)) return null;

  if (toolName === "Write") {
    if (onlyStatusChanged(current, toolInput.content ?? "")) return null;
  } else if (onlyStatusChanged(toolInput.old_string ?? "", toolInput.new_string ?? "")) {
    return null;
  }
  return `${relPath} is an Accepted ADR. Only its Status line may change. Write a new ADR that supersedes it instead.`;
}

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

async function main() {
  if (process.env.OFFGRID_ALLOW_PROTECTED_EDITS === "1") return 0;

  const input = JSON.parse((await readStdin()) || "{}");
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const filePath = input.tool_input?.file_path;
  if (!filePath) return 0;

  const absPath = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);
  const relPath = relative(projectDir, absPath).split("\\").join("/");
  if (relPath.startsWith("..")) return 0;

  const reason =
    protectedReason(relPath) ?? adrReason(relPath, absPath, input.tool_name, input.tool_input);
  if (!reason) return 0;

  process.stderr.write(
    `Blocked: ${reason}.\n` +
      "If the user asked for this change, restart the session with OFFGRID_ALLOW_PROTECTED_EDITS=1. " +
      "See .claude/README.md.\n",
  );
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main();
}
