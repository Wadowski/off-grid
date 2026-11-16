// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const IGNORED_DIRECTORIES = new Set(["node_modules", "dist", ".git"]);

const listSourceFiles = async (directory: string): Promise<string[]> => {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries
      .filter((entry) => !IGNORED_DIRECTORIES.has(entry.name))
      .map(async (entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
          return listSourceFiles(path);
        }
        return entry.name.endsWith(".ts") ? [path] : [];
      }),
  );
  return nested.flat();
};

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url));
const testDatabasePackage = join(repositoryRoot, "packages", "test-db") + sep;
const scannedRoots = ["apps", "modules", "packages"].map((name) => join(repositoryRoot, name));
const clusterLevelStatements = [
  /\bALTER\s+ROLE\b/i,
  /\bCREATE\s+ROLE\b/i,
  /\bALTER\s+SYSTEM\b/i,
  /\bALTER\s+DATABASE\b/i,
  /\bCREATE\s+EXTENSION\b/i,
  /\bpg_terminate_backend\b/i,
  /\bpg_roles\b/i,
];

const findClusterLevelStatements = async (): Promise<string[]> => {
  const files = (await Promise.all(scannedRoots.map(listSourceFiles))).flat();
  const findings: string[] = [];
  for (const file of files) {
    if (file.startsWith(testDatabasePackage)) {
      continue;
    }
    const contents = await readSource(file);
    if (clusterLevelStatements.some((statement) => statement.test(contents))) {
      findings.push(relative(repositoryRoot, file));
    }
  }
  return findings;
};

const readSource = (file: string): Promise<string> => readFile(file, "utf8");

describe("cluster level SQL", () => {
  it("is only issued by the shared cluster runner in packages/test-db", async () => {
    await expect(findClusterLevelStatements()).resolves.toEqual([]);
  });
});
