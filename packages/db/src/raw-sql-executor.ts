// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { ModuleTransaction } from "./types.js";

export const rawSqlExecutor = (tx: ModuleTransaction) => ({
  query: async <Row = unknown>(text: string, values: unknown[] = []): Promise<{ rows: Row[] }> => ({
    rows: await tx.$queryRawUnsafe<Row[]>(text, ...values),
  }),
});
