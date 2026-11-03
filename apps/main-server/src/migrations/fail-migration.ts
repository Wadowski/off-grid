// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

export const failMigration = (error: unknown): never => {
  process.stderr.write(`${error instanceof Error ? error.message : "migration failed"}\n`);
  process.exit(1);
};
