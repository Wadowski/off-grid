#!/usr/bin/env node
// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";
import { changedLineMap, repoRoot } from "./changed-lines.mjs";

const CODE_FILE = /\.(ts|tsx|js|mjs|cjs)$/;
const TEST_FILE = /\.test\.(ts|tsx|js|mjs)$|\/test\//;
const ALLOWED_COMMENT = /SPDX-|REUSE-Ignore|^\/\*\*\s*@type\b|^#!/;
const FUNCTION_DECLARATION = /^\s*(export\s+)?(default\s+)?(async\s+)?function\b/;
const TYPE_DECLARATION = /^\s*(export\s+)?(declare\s+)?(const\s+)?(interface|type|enum)\s+\w+/;
const EXPORT_DECLARATION = /^export\s+(?:async\s+)?(?:const|function|class)\s+(\w+)/;
const ROUTE_CALL = /\bapi\.(get|post|patch|put|delete)\(/g;
const COLOUR_LITERAL = /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/;
const COLOUR_SOURCES =
  /(^|\/)(light-colors|dark-colors|color-themes|tokens|tokens-stylesheet)\.ts$/;
const NETWORK_CALL = /\bfetch\(|new XMLHttpRequest|from "axios"/;
const SHIPPED_CODE = /^(apps|modules|packages)\/.*\.(ts|tsx)$/;
const ENTRY_FILE = /(^|\/)(index|main)\.(ts|tsx)$/;

export const findComments = (source) => {
  const comments = [];
  let state = "code";
  let line = 1;
  let startLine = 0;
  let text = "";
  const flush = () => {
    if (!ALLOWED_COMMENT.test(text.trim())) comments.push(startLine);
    text = "";
  };
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (char === "\n") {
      if (state === "line") {
        flush();
        state = "code";
      } else if (state === "single" || state === "double") {
        state = "code";
      } else if (state === "block") {
        text += char;
      }
      line += 1;
      continue;
    }
    if (state === "code") {
      if (char === "\\") {
        index += 1;
      } else if (char === "/" && next === "/") {
        state = "line";
        startLine = line;
        text = "";
        index += 1;
      } else if (char === "/" && next === "*") {
        state = "block";
        startLine = line;
        text = "/*";
        index += 1;
      } else if (char === "'") state = "single";
      else if (char === '"') state = "double";
      else if (char === "`") state = "template";
      else if (char === "#" && index === 0 && next === "!") {
        state = "line";
        startLine = line;
        text = "#!";
      }
      continue;
    }
    if (state === "line") {
      text += char;
    } else if (state === "block") {
      text += char;
      if (char === "*" && next === "/") {
        flush();
        state = "code";
        index += 1;
      }
    } else if (state === "single" || state === "double" || state === "template") {
      if (char === "\\") index += 1;
      else if (
        (state === "single" && char === "'") ||
        (state === "double" && char === '"') ||
        (state === "template" && char === "`")
      ) {
        state = "code";
      }
    }
  }
  if (state === "line") flush();
  return comments;
};

const lineChecks = [
  {
    id: "arrow-functions",
    applies: (path) => CODE_FILE.test(path),
    test: (text) => FUNCTION_DECLARATION.test(text),
    message: "Write named functions as arrow functions (functions.md).",
  },
  {
    id: "types-file",
    applies: (path) => CODE_FILE.test(path) && !/(^|\/)types\.ts$|\.d\.ts$/.test(path),
    test: (text) => TYPE_DECLARATION.test(text),
    message: "Declare types, interfaces and enums in types.ts (types.md).",
  },
  {
    id: "web-network-call",
    applies: (path) => path.startsWith("apps/main-web/src/") && !TEST_FILE.test(path),
    test: (text) => NETWORK_CALL.test(text),
    message: "Make server calls through packages/api-client (frontend.md).",
  },
  {
    id: "hard-coded-colour",
    applies: (path) =>
      /^(apps\/main-web|packages\/ui)\/src\//.test(path) &&
      !TEST_FILE.test(path) &&
      !COLOUR_SOURCES.test(path) &&
      /\.(ts|tsx)$/.test(path),
    test: (text) => COLOUR_LITERAL.test(text),
    message: "Use design tokens instead of colour literals (frontend.md).",
  },
];

export const checkFile = (path, source, changedLines) => {
  const findings = [];
  const lines = source.split("\n");
  if (CODE_FILE.test(path)) {
    for (const line of findComments(source)) {
      findings.push({
        path,
        line,
        rule: "no-comments",
        message: "Remove the comment (code-style.md).",
      });
    }
  }
  for (const check of lineChecks) {
    if (!check.applies(path)) continue;
    lines.forEach((text, index) => {
      if (changedLines.has(index + 1) && check.test(text)) {
        findings.push({ path, line: index + 1, rule: check.id, message: check.message });
      }
    });
  }
  if (/^modules\/[^/]+\/src\/http\//.test(path) && !TEST_FILE.test(path)) {
    const routes = [...source.matchAll(ROUTE_CALL)];
    if (routes.length > 1) {
      const line = source.slice(0, routes[1].index).split("\n").length;
      findings.push({
        path,
        line,
        rule: "one-route-per-file",
        message: "Register one route per file (code-style.md).",
      });
    }
  }
  return findings;
};

export const exportedNames = (source, changedLines) =>
  source
    .split("\n")
    .map((text, index) => ({ line: index + 1, match: EXPORT_DECLARATION.exec(text) }))
    .filter(({ line, match }) => match && changedLines.has(line))
    .map(({ line, match }) => ({ line, name: match[1] }));

export const findUnusedExports = (root, path, source, changedLines, usedElsewhere) => {
  if (!SHIPPED_CODE.test(path) || ENTRY_FILE.test(path) || TEST_FILE.test(path)) return [];
  return exportedNames(source, changedLines)
    .filter(({ name }) => !usedElsewhere(root, name, path))
    .map(({ line, name }) => ({
      path,
      line,
      rule: "unused-export",
      message: `Export "${name}" is not imported by another file (code-style.md).`,
    }));
};

export const gitUsedElsewhere = (root, name, path) => {
  try {
    const output = execFileSync(
      "git",
      ["grep", "--untracked", "-lw", name, "--", "*.ts", "*.tsx", "*.js", "*.mjs", "*.cjs"],
      { cwd: root, encoding: "utf8" },
    );
    return output
      .split("\n")
      .filter(Boolean)
      .some((file) => file !== path && !TEST_FILE.test(file));
  } catch {
    return false;
  }
};

export const checkChanges = (root, changes, usedElsewhere = gitUsedElsewhere) => {
  const findings = [];
  for (const [path, changedLines] of changes) {
    if (!CODE_FILE.test(path)) continue;
    let source;
    try {
      source = readFileSync(join(root, path), "utf8");
    } catch {
      continue;
    }
    findings.push(...checkFile(path, source, changedLines));
    findings.push(...findUnusedExports(root, path, source, changedLines, usedElsewhere));
  }
  return findings;
};

const main = () => {
  const root = repoRoot();
  const only = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const changes = changedLineMap(root);
  const selected =
    only.length > 0 ? new Map([...changes].filter(([path]) => only.includes(path))) : changes;
  const findings = checkChanges(root, selected);
  if (findings.length === 0) {
    console.log(`check-rules: ok (${selected.size} changed files)`);
    return 0;
  }
  for (const finding of findings) {
    console.error(`${finding.path}:${finding.line} ${finding.rule} ${finding.message}`);
  }
  console.error(`check-rules: ${findings.length} finding(s) in ${basename(root)}`);
  return 1;
};

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) process.exitCode = main();
