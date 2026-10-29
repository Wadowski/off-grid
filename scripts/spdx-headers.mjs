// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// REUSE-IgnoreStart
const HEADER = [
  "// SPDX-FileCopyrightText: 2026 Dominik Wadowski",
  "// SPDX-License-Identifier: FSL-1.1-ALv2",
];
const TAG = "SPDX-License-Identifier:";
// REUSE-IgnoreEnd

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs"]);
export function hasHeader(text) {
  return text
    .split("\n")
    .slice(0, 5)
    .some((line) => line.includes(TAG));
}

export function addHeader(text) {
  const lines = text.split("\n");
  const insertAt = lines[0]?.startsWith("#!") ? 1 : 0;
  const before = lines.slice(0, insertAt);
  const after = lines.slice(insertAt);
  return [...before, ...HEADER, "", ...after].join("\n");
}

export function sourceFiles() {
  const output = execFileSync("git", ["ls-files", "-co", "--exclude-standard", "-z"], {
    encoding: "utf8",
  });
  return output
    .split("\0")
    .filter((file) => file !== "")
    .filter((file) => SOURCE_EXTENSIONS.has(extensionOf(file)));
}

function extensionOf(file) {
  const dot = file.lastIndexOf(".");
  return dot === -1 ? "" : file.slice(dot);
}

function main() {
  const check = process.argv.includes("--check");
  const missing = sourceFiles().filter((file) => !hasHeader(readFileSync(file, "utf8")));

  if (check) {
    if (missing.length > 0) {
      console.error("Missing SPDX header:");
      for (const file of missing) console.error(`  ${file}`);
      console.error("Run `pnpm license:headers` to add them.");
      process.exitCode = 1;
    }
    return;
  }

  for (const file of missing) {
    writeFileSync(file, addHeader(readFileSync(file, "utf8")));
    console.log(`added header: ${file}`);
  }
  if (missing.length === 0) console.log("all source files already have an SPDX header");
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
