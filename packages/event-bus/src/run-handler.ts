// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Pool } from "pg";
import type { AnyEventDefinition } from "@offgrid/contracts";
import { resolveTraceId, runWithTrace } from "@offgrid/observability";
import type { EventOf, Subscription } from "./types.js";
import { withTransaction } from "./with-transaction.js";

export const runHandler = async <D extends AnyEventDefinition>(
  pool: Pool,
  subscription: Pick<Subscription<D>, "handler">,
  event: EventOf<D>,
): Promise<void> =>
  withTransaction(pool, (client) =>
    runWithTrace(resolveTraceId(event.traceId), () => subscription.handler(event, { tx: client })),
  );
