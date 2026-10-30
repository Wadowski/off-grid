// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import { fileURLToPath } from "node:url";

export const MIGRATION_DIRECTORIES = [
  {
    schema: "outbox",
    directory: fileURLToPath(new URL("../../../packages/event-bus/migrations", import.meta.url)),
  },
  {
    schema: "family",
    directory: fileURLToPath(new URL("../src/infrastructure/migrations", import.meta.url)),
  },
] as const;
