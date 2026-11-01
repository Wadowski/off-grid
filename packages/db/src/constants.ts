// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const MIGRATOR_ROLE = "offgrid_migrator";

export const DATABASE_SCHEMAS = [
  "identity",
  "family",
  "access",
  "calendar",
  "lists",
  "notes",
  "files",
  "food",
  "relations",
  "notifications",
  "export",
  "outbox",
] as const;

export const OWNERSHIP_SCOPES = ["family-or-user", "family", "user", "shared", "instance"] as const;

export const SCOPE_COMMENT = /^offgrid:scope=(.+)$/;

export const IDENTIFIER = /^[a-z_][a-z0-9_]*$/;

export const PRISMA_CLI_PATH = join(
  dirname(createRequire(import.meta.url).resolve("prisma/package.json")),
  "build/index.js",
);

export const DB_PACKAGE_DIRECTORY = fileURLToPath(new URL("..", import.meta.url));
