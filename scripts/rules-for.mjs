#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readFileSync, readdirSync } from "node:fs";
import { matchesGlob } from "node:path";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { parseFrontmatter } from "./check-agent-config.mjs";
import { changedFiles, repoRoot } from "./changed-lines.mjs";

const LINT_TAG = "[lint]";

export const loadRules = (root) => {
  const dir = join(root, ".claude/rules");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".md"))
    .sort()
    .map((name) => {
      const text = readFileSync(join(dir, name), "utf8");
      const frontmatter = parseFrontmatter(text);
      const body = text.replace(/^---\n[\s\S]*?\n---\n/, "");
      return {
        file: `.claude/rules/${name}`,
        paths: frontmatter?.paths ?? [],
        bullets: body.split("\n").filter((line) => line.startsWith("- ")),
      };
    });
};

export const rulesFor = (rules, files) =>
  rules.filter((rule) =>
    files.some((file) => rule.paths.some((pattern) => matchesGlob(file, pattern))),
  );

export const renderRules = (matched, { reviewOnly = false } = {}) =>
  matched
    .map((rule) => {
      const bullets = reviewOnly
        ? rule.bullets.filter((bullet) => !bullet.includes(LINT_TAG))
        : rule.bullets;
      return bullets.length === 0 ? "" : `## ${rule.file}\n${bullets.join("\n")}`;
    })
    .filter(Boolean)
    .join("\n\n");

const main = () => {
  const args = process.argv.slice(2);
  const reviewOnly = args.includes("--review-only");
  const given = args.filter((arg) => !arg.startsWith("--"));
  const root = repoRoot();
  const files = given.length > 0 ? given : changedFiles(root);
  const matched = rulesFor(loadRules(root), files);
  if (matched.length === 0) {
    console.log("rules:for: no rule matches these files");
    return;
  }
  console.log(
    `# Rules for ${files.length} file(s). [lint] rules are enforced by pnpm check:rules.\n`,
  );
  console.log(renderRules(matched, { reviewOnly }));
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
