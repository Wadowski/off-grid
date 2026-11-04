// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import { classifyMailError } from "../../infrastructure/mail/classify-mail-error.js";

export const sendWithRetry = (
  attempt: () => Promise<void>,
  retryDelaysMs: readonly number[],
  logger: Logger,
  fields: Record<string, string>,
): void => {
  const runAttempt = (attemptIndex: number): void => {
    attempt().catch((error: unknown) => {
      const reason = classifyMailError(error);
      const retryInMs = retryDelaysMs[attemptIndex];
      if (retryInMs === undefined) {
        logger.warn("email delivery gave up", { ...fields, attempts: attemptIndex + 1, reason });
        return;
      }
      logger.warn("email delivery failed, retrying", {
        ...fields,
        attempt: attemptIndex + 1,
        retryInMs,
        reason,
      });
      setTimeout(() => runAttempt(attemptIndex + 1), retryInMs).unref();
    });
  };
  runAttempt(0);
};
