#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// PostToolUse hook for Edit and Write. Runs Prettier on the changed file, and
// ESLint --fix on TypeScript and JavaScript files. Errors that remain after
// the fix are sent back to the agent (exit code 2).

import { existsSync } from "node:fs";
import { extname, isAbsolute, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const ESLINT_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);

export function commandsFor(relPath) {
  const commands = [["prettier", ["--write", "--ignore-unknown", relPath]]];
  if (ESLINT_EXTENSIONS.has(extname(relPath))) {
    commands.push(["eslint", ["--fix", "--no-error-on-unmatched-pattern", relPath]]);
  }
  return commands;
}

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

async function main() {
  const input = JSON.parse((await readStdin()) || "{}");
  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const filePath = input.tool_input?.file_path;
  if (!filePath) return 0;

  const absPath = isAbsolute(filePath) ? filePath : resolve(projectDir, filePath);
  const relPath = relative(projectDir, absPath).split("\\").join("/");
  if (relPath.startsWith("..") || !existsSync(absPath)) return 0;

  let failed = false;
  for (const [tool, args] of commandsFor(relPath)) {
    const bin = resolve(projectDir, "node_modules/.bin", tool);
    const result = spawnSync(bin, args, { cwd: projectDir, encoding: "utf8" });
    if (result.status !== 0) {
      failed = true;
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
      process.stderr.write(
        `${tool} failed on ${relPath}. Fix the reported problems, then edit again.\n${output}\n`,
      );
    }
  }
  return failed ? 2 : 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main();
}
