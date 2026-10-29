#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

// Validates the agent configuration under .claude/:
//   - settings.json parses, and every hook script it names exists and is executable
//   - every rule in .claude/rules has a non-empty paths list of globs
//   - every paths glob matches at least one file (unmatched globs are warnings,
//     because some rules cover areas that do not exist yet)
//   - every skill in .claude/skills has a SKILL.md whose name matches its folder
//     and that has a description
//
//   node scripts/check-agent-config.mjs [root]
//
// Exit code 1 if any error is found.

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { glob } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const HOOK_PATH = /\.claude\/hooks\/[\w.-]+/g;

// Minimal frontmatter reader: `key: value` pairs and a `paths:` list of "- item" lines.
export function parseFrontmatter(text) {
  const match = /^---\n([\s\S]*?)\n---/.exec(text);
  if (!match) return null;
  const fields = { paths: [] };
  let listKey = null;
  for (const line of match[1].split("\n")) {
    const item = /^\s+-\s+(.*)$/.exec(line);
    if (item && listKey) {
      fields[listKey].push(item[1].trim().replace(/^["']|["']$/g, ""));
      continue;
    }
    const pair = /^([\w-]+):\s*(.*)$/.exec(line);
    if (!pair) continue;
    listKey = pair[2] === "" ? pair[1] : null;
    if (listKey) fields[listKey] = [];
    else fields[pair[1]] = pair[2].replace(/^["']|["']$/g, "");
  }
  return fields;
}

function listFiles(dir, suffix) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter((name) => name.endsWith(suffix));
}

function checkHooks(root, errors) {
  const settingsPath = join(root, ".claude/settings.json");
  if (!existsSync(settingsPath)) {
    errors.push(".claude/settings.json is missing");
    return;
  }
  let settings;
  try {
    settings = JSON.parse(readFileSync(settingsPath, "utf8"));
  } catch (error) {
    errors.push(`.claude/settings.json is not valid JSON: ${error.message}`);
    return;
  }

  for (const groups of Object.values(settings.hooks ?? {})) {
    for (const group of groups) {
      for (const hook of group.hooks ?? []) {
        for (const relPath of hook.command?.match(HOOK_PATH) ?? []) {
          const absPath = join(root, relPath);
          if (!existsSync(absPath)) {
            errors.push(`hook script ${relPath} does not exist`);
          } else if ((statSync(absPath).mode & 0o111) === 0) {
            errors.push(`hook script ${relPath} is not executable`);
          }
        }
      }
    }
  }
}

async function globMatches(root, pattern) {
  for await (const _ of glob(pattern, {
    cwd: root,
    exclude: (name) => name === "node_modules" || name === ".git",
  })) {
    return true;
  }
  return false;
}

async function checkRules(root, errors, warnings) {
  const rulesDir = join(root, ".claude/rules");
  for (const file of listFiles(rulesDir, ".md")) {
    const label = `.claude/rules/${file}`;
    const frontmatter = parseFrontmatter(readFileSync(join(rulesDir, file), "utf8"));
    if (!frontmatter || frontmatter.paths.length === 0) {
      errors.push(`${label} needs frontmatter with a non-empty paths list`);
      continue;
    }
    for (const pattern of frontmatter.paths) {
      if (pattern === "") {
        errors.push(`${label} has an empty paths glob`);
      } else if (!(await globMatches(root, pattern))) {
        warnings.push(`${label}: paths glob "${pattern}" matches no file yet`);
      }
    }
  }
}

function checkSkills(root, errors) {
  const skillsDir = join(root, ".claude/skills");
  if (!existsSync(skillsDir)) return;
  for (const folder of readdirSync(skillsDir)) {
    const label = `.claude/skills/${folder}/SKILL.md`;
    const file = join(skillsDir, folder, "SKILL.md");
    if (!existsSync(file)) {
      errors.push(`${label} is missing`);
      continue;
    }
    const frontmatter = parseFrontmatter(readFileSync(file, "utf8"));
    if (!frontmatter) {
      errors.push(`${label} has no frontmatter`);
      continue;
    }
    if (frontmatter.name !== folder) {
      errors.push(`${label} name must be "${folder}"`);
    }
    if (!frontmatter.description) {
      errors.push(`${label} needs a description`);
    }
  }
}

export async function checkAgentConfig(root) {
  const errors = [];
  const warnings = [];
  checkHooks(root, errors);
  await checkRules(root, errors, warnings);
  checkSkills(root, errors);
  return { errors, warnings };
}

async function main() {
  const root = resolve(process.argv[2] ?? join(dirname(fileURLToPath(import.meta.url)), ".."));
  const { errors, warnings } = await checkAgentConfig(root);
  for (const warning of warnings) console.warn(`warning: ${warning}`);
  if (errors.length > 0) {
    for (const error of errors) console.error(`error: ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log("agent configuration is valid");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
