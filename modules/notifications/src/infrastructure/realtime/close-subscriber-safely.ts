// SPDX-FileCopyrightText: 2026 Dominik Wadowski
// SPDX-License-Identifier: FSL-1.1-ALv2

import type { Logger } from "@offgrid/observability";
import type { NoticeSubscriber } from "../../types.js";
import { errorTypeName } from "./error-type-name.js";

export const closeSubscriberSafely = (subscriber: NoticeSubscriber, logger: Logger): void => {
  try {
    subscriber.close();
  } catch (error: unknown) {
    logger.warn("notification stream close failed", { error: errorTypeName(error) });
  }
};
