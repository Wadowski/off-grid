#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// Stop hook. Runs the fast repository checks when the agent finishes a turn:
// typecheck and module boundaries. A failure exits with code 2, which sends
// the output back to the agent so it can fix the problem before stopping.
// Slower suites (integration, e2e) run in CI and in the pre-pr-verify skill.
//
// The checks run under the Node version pinned in .nvmrc when nvm has it
// installed. Otherwise a shell default such as Node 20 would be used, and pnpm
// 12 cannot start there.
//
// OFFGRID_STOP_CHECKS overrides the command list (a JSON array of
// [command, args] pairs). Tests use it; normal sessions do not set it.

import { existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { delimiter, join } from "node:path";
import { pathToFileURL } from "node:url";

const DEFAULT_CHECKS = [
  ["pnpm", ["typecheck"]],
  ["pnpm", ["check:boundaries"]],
];

const OUTPUT_LIMIT = 4000;

export function checksFromEnv(value) {
  return value ? JSON.parse(value) : DEFAULT_CHECKS;
}

// Returns the bin directory of the nvm-installed Node named in .nvmrc, or null.
export function pinnedNodeBin(projectDir, nvmDir = process.env.NVM_DIR ?? join(homedir(), ".nvm")) {
  const nvmrc = join(projectDir, ".nvmrc");
  if (!existsSync(nvmrc)) return null;
  const version = readFileSync(nvmrc, "utf8").trim().replace(/^v/, "");
  const bin = join(nvmDir, "versions/node", `v${version}`, "bin");
  return existsSync(bin) ? bin : null;
}

// The environment for the checks: the pinned Node's bin directory first, if present.
export function checksEnv(projectDir, baseEnv = process.env) {
  const bin = pinnedNodeBin(projectDir, baseEnv.NVM_DIR ?? join(homedir(), ".nvm"));
  if (!bin) return baseEnv;
  return { ...baseEnv, PATH: `${bin}${delimiter}${baseEnv.PATH ?? ""}` };
}

function tail(text) {
  return text.length > OUTPUT_LIMIT ? `...${text.slice(-OUTPUT_LIMIT)}` : text;
}

async function readStdin() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  return data;
}

async function main() {
  const input = JSON.parse((await readStdin()) || "{}");
  // Already continuing because of a previous Stop block: do not loop.
  if (input.stop_hook_active) return 0;

  const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
  const checks = checksFromEnv(process.env.OFFGRID_STOP_CHECKS);
  const env = checksEnv(projectDir);
  const failures = [];

  for (const [command, args] of checks) {
    const result = spawnSync(command, args, { cwd: projectDir, env, encoding: "utf8" });
    if (result.status !== 0) {
      const output = `${result.stdout ?? ""}${result.stderr ?? ""}`.trim();
      failures.push(`$ ${command} ${args.join(" ")}\n${tail(output)}`);
    }
  }

  if (failures.length === 0) return 0;
  process.stderr.write(
    `Checks failed before stopping. Fix them, then finish again.\n\n${failures.join("\n\n")}\n`,
  );
  return 2;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  process.exitCode = await main();
}
